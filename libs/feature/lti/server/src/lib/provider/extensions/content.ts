/* eslint-disable @typescript-eslint/no-explicit-any */
import * as url from 'url';
import { ExtensionError } from '../errors';
import { LTIProvider } from '../provider';

const FILE_RETURN_TYPE = 'file';
const IFRAME_RETURN_TYPE = 'iframe';
const IMAGE_URL_RETURN_TYPE = 'image_url';
const LTI_LAUNCH_URL_RETURN_TYPE = 'lti_launch_url';
const OEMBED_RETURN_TYPE = 'oembed';
const URL_RETURN_TYPE = 'url';

const parseUrl = (raw_url: string) => {
  const return_url = url.parse(raw_url, true) as any;
  delete return_url.path;
  return return_url;
}

const optionalUrlPropertySetter = (returnUrl: url.UrlWithParsedQuery) => {
  return (property: string, value: any) => {
    if (typeof value !== 'undefined') {
      returnUrl.query[property] = value;
    }
  };
}

const redirector = (res: any, url: any) => {
  return res.redirect(303, url);
}

export class ContentExtension {
  private returnUrl: string;
  private returnTypes: string[];
  private fileExtensions: string[];


  constructor(params: any) {
    this.returnTypes = params.ext_content_return_types.split(',');
    this.returnUrl = params.ext_content_return_url || params.launch_presentation_return_url;
    this.fileExtensions = (params.ext_content_file_extensions && params.ext_content_file_extensions.split(',')) || [];
  }

  hasReturnType(returnType: string) {
    return this.returnTypes.indexOf(returnType) !== -1;
  }

  hasFileExtension(extension: string) {
    return this.fileExtensions.indexOf(extension) !== -1;
  }

  sendFile(res: any, fileUrl: string, text: string, contentType: string) {
    this.validateReturnType(FILE_RETURN_TYPE);

    const returnUrl = parseUrl(this.returnUrl);
    const set_if_exists = optionalUrlPropertySetter(returnUrl);

    returnUrl.query.return_type = FILE_RETURN_TYPE;
    returnUrl.query.url = fileUrl;
    returnUrl.query.text = text;

    set_if_exists('content_type', contentType);

    redirector(res, url.format(returnUrl));
  }

  sendIframe(res: any, iFrameUrl: string, title: string, width: string, height: string) {
    this.validateReturnType(IFRAME_RETURN_TYPE)

    const return_url = parseUrl(this.returnUrl)
    const set_if_exists = optionalUrlPropertySetter(return_url)

    return_url.query.return_type = IFRAME_RETURN_TYPE
    return_url.query.url = iFrameUrl

    set_if_exists("title", title)
    set_if_exists("width", width)
    set_if_exists("height", height)

    redirector(res, url.format(return_url))
  }

  sendImageUrl(res: any, imageUrl: string, text: string, width: string, height: string) {
    this.validateReturnType(IMAGE_URL_RETURN_TYPE)

    const returnUrl = parseUrl(this.returnUrl)
    const setIfExists = optionalUrlPropertySetter(returnUrl)

    returnUrl.query.return_type = IMAGE_URL_RETURN_TYPE
    returnUrl.query.url = imageUrl

    setIfExists("text", text)
    setIfExists("width", width)
    setIfExists("height", height)

    redirector(res, url.format(returnUrl))
  }

  sendLTILaunchUrl(res: string, launchUrl: string, title: string, text: string) {
    this.validateReturnType(LTI_LAUNCH_URL_RETURN_TYPE)

    const returnUrl = parseUrl(this.returnUrl)
    const setIfExists = optionalUrlPropertySetter(returnUrl)

    returnUrl.query.return_type = LTI_LAUNCH_URL_RETURN_TYPE
    returnUrl.query.url = launchUrl

    setIfExists("title", title)
    setIfExists("text", text)

    redirector(res, url.format(returnUrl))
  }

  sendOembed(res: any, oembed_url: string, endpoint: string) {
    this.validateReturnType(OEMBED_RETURN_TYPE)

    const returnUrl = parseUrl(this.returnUrl)
    const setIfExists = optionalUrlPropertySetter(returnUrl)

    returnUrl.query.return_type = OEMBED_RETURN_TYPE
    returnUrl.query.url = oembed_url

    setIfExists("endpoint", endpoint)

    redirector(res, url.format(returnUrl))
  }

  sendUrl(res: string, hyperlink: string, text: string, title: string, target: string) {
    this.validateReturnType(URL_RETURN_TYPE)

    const returnUrl = parseUrl(this.returnUrl)
    const setIfExists = optionalUrlPropertySetter(returnUrl)

    returnUrl.query.return_type = URL_RETURN_TYPE
    returnUrl.query.url = hyperlink

    setIfExists('text', text)
    setIfExists('title', title)
    setIfExists('target', target)

    redirector(res, url.format(returnUrl))
  }

  private validateReturnType(return_type: string) {
    if (!this.hasReturnType(return_type)) {
      throw new ExtensionError('Invalid return type, valid options are ' + this.returnTypes.join(', '));
    }
  }

  static fromProvider(provider: LTIProvider): ContentExtension | undefined {
    if (provider.body.ext_content_return_types) {
      return new ContentExtension(provider.body);
    }
    return undefined;
  }
}

