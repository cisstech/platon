/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConsumerError, ParameterError, SignatureError } from './errors'
import { LTIPayload } from './payload'
import { AdminRoles, InstructorRoles, ReviewerRoles, StudentRoles } from './roles'
import { HmacSha1 } from './signers/hmac-sha1'
import { Signer } from './signers/signer'
import { MemoryNonceStore } from './stores/memory-nonce-store'
import { NonceStore } from './stores/nonce-store'

export const supported_versions = ['LTI-1p0']

export class LTIProvider {
  private _store: NonceStore = new MemoryNonceStore()
  private _signer: Signer = new HmacSha1()

  readonly body = {} as LTIPayload

  get store(): NonceStore {
    return this._store
  }

  get signer(): Signer {
    return this._signer
  }

  constructor(readonly consumerKey: string, readonly consumerSecret: string) {
    if (!consumerKey) {
      throw new ConsumerError('Must specify consumerKey')
    }

    if (!consumerSecret) {
      throw new ConsumerError('Must specify consumerSecret')
    }
  }

  public setSigner(signer: Signer): LTIProvider {
    this._signer = signer
    return this
  }

  public setNounceStore(store: NonceStore): LTIProvider {
    this._store = store
    return this
  }

  public async validate(req: any): Promise<LTIPayload> {
    if (req.connection) {
      req.connection.encrypted = true
    }

    this.parseRequest(req)
    this.checkParams()

    await this.sign(req)

    return this.body
  }

  private async sign(req: any): Promise<void> {
    const generated = this._signer.buildSignature(req, this.consumerSecret)
    const validSignature = generated === this.body.oauth_signature
    if (!validSignature) {
      throw new SignatureError('Invalid Signature')
    }
    return this._store.ensuresNotExpired(this.body.oauth_nonce, this.body.oauth_timestamp)
  }

  private checkParams(): void {
    const correctMessageType = this.body.lti_message_type === 'basic-lti-launch-request'
    const correctVersion = supported_versions.indexOf(this.body.lti_version) !== -1
    const hasResourceLinkId = this.body.resource_link_id != null
    const valid = correctMessageType && correctVersion && hasResourceLinkId
    if (!valid) {
      throw new ParameterError('Invalid LTI parameters')
    }
  }

  private parseRequest(req: any) {
    const body = req.body || req.payload
    if (body.oauth_timestamp) {
      body.oauth_timestamp = Number.parseInt(body.oauth_timestamp, 10)
    }

    body.roles = body.roles || []
    if (typeof body.roles === 'string') {
      body.roles = body.roles.split(',')
    }

    Object.assign(this.body, body)

    this.body.is_admin = Object.values(AdminRoles).some((role) => this.body.roles.includes(role))

    this.body.is_student = Object.values(StudentRoles).some((role) => this.body.roles.includes(role))

    this.body.is_reviewer = Object.values(ReviewerRoles).some((role) => this.body.roles.includes(role))

    this.body.is_instructor = Object.values(InstructorRoles).some((role) => this.body.roles.includes(role))
  }
}
