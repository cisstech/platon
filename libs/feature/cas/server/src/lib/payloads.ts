export interface CasServiceValidateResponse {
  serviceResponse: {
    authenticationSuccess?: {
      user: string
      attributes?: {
        [key: string]: string | string[]
      }
    }
    authenticationFailure?: {
      code: string
      description: string
    }
  }
}
