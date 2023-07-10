/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto'
import http from 'http'
import https from 'https'
import url from 'url'
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'
import xml2js from 'xml2js'
import xmlbuilder from 'xmlbuilder'
import { ExtensionError, OutcomeResponseError, ParameterError } from '../errors'
import { LTIProvider } from '../provider'
import { HmacSha1 } from '../signers/hmac-sha1'
import { Signer } from '../signers/signer'
import { encode } from '../utils'

const navigateXml = (xmlObject: any, path: string) => {
  const pathParts = path.split('.')
  for (const part of pathParts) {
    xmlObject = xmlObject?.[part]?.[0]
  }
  return xmlObject
}

class OutcomeDocument {
  private doc: xmlbuilder.XMLElementOrXMLNode
  private head: xmlbuilder.XMLElementOrXMLNode
  private body: xmlbuilder.XMLElementOrXMLNode
  private result?: xmlbuilder.XMLElementOrXMLNode
  private hasPayload = false

  constructor(type: string, sourceDID: string, private outcomeService: OutcomeService) {
    // Build and configure the document
    const xmldec = {
      version: '1.0',
      encoding: 'UTF-8',
    }

    this.doc = xmlbuilder.create('imsx_POXEnvelopeRequest', xmldec)
    this.doc.attribute('xmlns', 'http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0')

    this.head = this.doc.ele('imsx_POXHeader').ele('imsx_POXRequestHeaderInfo')
    this.body = this.doc
      .ele('imsx_POXBody')
      .ele(type + 'Request')
      .ele('resultRecord')

    // Generate a unique identifier and apply the version to the header information
    this.head.ele('imsx_version', 'V1.0')
    this.head.ele('imsx_messageIdentifier', uuidv1())

    // Apply the source DID to the body
    this.body.ele('sourcedGUID').ele('sourcedId', sourceDID)
  }

  addScore(score: number, language: string): void {
    if (score < 0 || score > 1.0) {
      throw new ParameterError('Score must be a floating point number >= 0 and <= 1')
    }

    const eScore = this.resultEle().ele('resultScore')
    eScore.ele('language', language)
    eScore.ele('textString', score)
  }

  addText(text: string): void {
    this.addPayload('text', text)
  }

  addUrl(url: string): void {
    this.addPayload('url', url)
  }

  build(): string {
    return this.doc.end({ pretty: true })
  }

  private resultEle() {
    return this.result || (this.result = this.body.ele('result'))
  }

  private addPayload(type: string, value: any) {
    if (this.hasPayload) {
      throw new ExtensionError('Result data payload has already been set')
    }

    if (!this.outcomeService.supportsResultData(type)) {
      throw new ExtensionError('Result data type is not supported')
    }

    this.resultEle().ele('resultData').ele(type, value)
    this.hasPayload = true
  }
}

interface OutcomeServiceOptions {
  readonly consumerKey: string
  readonly consumerSecret: string
  readonly serviceUrl: string
  readonly sourceDID: string
  readonly resultDataTypes?: string[]
  readonly signer?: Signer
  readonly certAuthority?: any
  readonly language?: string
}

export class OutcomeService {
  private readonly REQUEST_REPLACE = 'replaceResult'
  private readonly REQUEST_READ = 'readResult'
  private readonly REQUEST_DELETE = 'deleteResult'

  private readonly consumerKey: string
  private readonly consumerSecret: string
  private readonly serviceUrl: string
  private readonly sourceDID: string
  private readonly resultDataTypes: string[]
  private readonly signer: Signer
  private readonly certAuthority: any
  private readonly language: string
  private readonly serviceUrlParts: any
  private readonly serviceUrlOauth: string

  constructor(options: OutcomeServiceOptions) {
    this.consumerKey = options.consumerKey
    this.consumerSecret = options.consumerSecret
    this.serviceUrl = options.serviceUrl
    this.sourceDID = options.sourceDID
    this.resultDataTypes = options.resultDataTypes || []
    this.signer = options.signer || new HmacSha1()
    this.certAuthority = options.certAuthority || null
    this.language = options.language || 'en'

    const parts = (this.serviceUrlParts = url.parse(this.serviceUrl, true))
    this.serviceUrlOauth = `${parts.protocol}//${parts.host}${parts.pathname}`
  }

  sendReplaceResult(score: number): Promise<any> {
    const doc = new OutcomeDocument(this.REQUEST_REPLACE, this.sourceDID, this)
    doc.addScore(score, this.language)
    return this.sendRequest(doc)
  }

  sendReplaceResultWithText(score: number, text: string): Promise<any> {
    const doc = new OutcomeDocument(this.REQUEST_REPLACE, this.sourceDID, this)
    doc.addScore(score, this.language)
    doc.addText(text)
    return this.sendRequest(doc)
  }

  sendReplaceResultWithUrl(score: number, url: string): Promise<any> {
    const doc = new OutcomeDocument(this.REQUEST_REPLACE, this.sourceDID, this)
    doc.addScore(score, this.language)
    doc.addUrl(url)
    return this.sendRequest(doc)
  }

  async sendReadResult(): Promise<number> {
    const doc = new OutcomeDocument(this.REQUEST_READ, this.sourceDID, this)
    const xml = await this.sendRequest(doc)
    const score = parseFloat(
      navigateXml(xml, 'imsx_POXBody.readResultResponse.result.resultScore.textString')
    )
    if (isNaN(score)) {
      throw new OutcomeResponseError('Invalid score response')
    }
    return score
  }

  sendDeleteResult(): Promise<any> {
    const doc = new OutcomeDocument(this.REQUEST_DELETE, this.sourceDID, this)
    return this.sendRequest(doc)
  }

  supportsResultData(type: any) {
    return this.resultDataTypes.length && (!type || this.resultDataTypes.indexOf(type) !== -1)
  }

  private sendRequest(doc: OutcomeDocument): Promise<any> {
    const xml = doc.build()

    const ssl = this.serviceUrlParts.protocol == 'https:'
    const options: any = {
      hostname: this.serviceUrlParts.hostname,
      path: this.serviceUrlParts.path,
      method: 'POST',
      headers: this.buildHeaders(xml),
    }

    if (this.certAuthority && ssl) {
      options.ca = this.certAuthority
    } else {
      options.agent = ssl ? https.globalAgent : http.globalAgent
    }

    if (this.serviceUrlParts.port) {
      options.port = this.serviceUrlParts.port
    }

    return new Promise<any>((resolve, reject) => {
      const req = (ssl ? https : http).request(options, (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => {
          this.processResponse(body).then(resolve).catch(reject)
        })
      })

      req.on('error', reject)

      req.write(xml)
      req.end()
    })
  }

  private buildHeaders(body: any): any {
    const headers = {
      oauth_version: '1.0',
      oauth_nonce: uuidv4(),
      oauth_timestamp: Math.round(Date.now() / 1000),
      oauth_consumer_key: this.consumerKey,
      oauth_body_hash: crypto.createHash('sha1').update(body).digest('base64'),
      oauth_signature_method: this.signer.method,
    }

    ;(headers as any).oauth_signature = this.signer.buildSignatureRaw(
      this.serviceUrlOauth,
      this.serviceUrlParts,
      'POST',
      headers,
      this.consumerSecret
    )

    return {
      Authorization: `OAuth realm="", ${Object.entries(headers)
        .map(([key, val]) => `${key}="${encode(val + '')}"`)
        .join(',')}`,
      'Content-Type': 'application/xml',
      'Content-Length': body.length,
    }
  }

  private async processResponse(body: any): Promise<any> {
    try {
      const result = await xml2js.parseStringPromise(body, { trim: true })
      const response = result?.imsx_POXEnvelopeResponse
      const code = navigateXml(
        response,
        'imsx_POXHeader.imsx_POXResponseHeaderInfo.imsx_statusInfo.imsx_codeMajor'
      )
      if (code !== 'success') {
        const msg = navigateXml(
          response,
          'imsx_POXHeader.imsx_POXResponseHeaderInfo.imsx_statusInfo.imsx_description'
        )
        throw new OutcomeResponseError(msg)
      } else {
        return response
      }
    } catch (err) {
      throw new OutcomeResponseError('The server responsed with an invalid XML document')
    }
  }

  static fromProvider(provider: LTIProvider): OutcomeService | undefined {
    if (provider.body.lis_outcome_service_url && provider.body.lis_result_sourcedid) {
      const acceptedVals = provider.body.ext_outcome_data_values_accepted
      return new OutcomeService({
        consumerKey: provider.consumerKey,
        consumerSecret: provider.consumerSecret,
        serviceUrl: provider.body.lis_outcome_service_url,
        sourceDID: provider.body.lis_result_sourcedid,
        resultDataTypes: acceptedVals ? acceptedVals.split(',') : [],
        signer: provider.signer,
      })
    }
    return undefined
  }
}
