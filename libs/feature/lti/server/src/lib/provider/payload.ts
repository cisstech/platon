/* eslint-disable @typescript-eslint/no-explicit-any */
import { LTIRoles } from './roles'

export interface LTIPayload {
  // Auth
  oauth_callback: string

  /** The unique key assigned to each Tool Consumer. */
  oauth_consumer_key: string

  /** A unique value identifying the message, which helps to identify the duplicate messages. */
  oauth_nonce: string

  /** On the Provider's end, the key and corresponding secret is used to generate a signature that is matched this signature. */
  oauth_signature: string

  /**  The method used to generate the signature.LTI currently supports HMAC - SHA1. */
  oauth_signature_method:
    | 'HMAC-SHA1'
    | 'HMAC-SHA224'
    | 'HMAC-SHA256'
    | 'HMAC-SH384'
    | 'HMAC-SHA512'
    | 'RS256'
    | 'RS384'
    | 'RS512'

  /**
   * The time at which the message was signed.
   * It should be checked that the server time is within a specific time interval of this timestamp(typically 5 minutes).
   */
  oauth_timestamp: number

  /** The OAuth version used */
  oauth_version: string

  //Required Parameters
  lti_message_type: string
  lti_version: 'LTI-1p0' | 'LTI-2p0' | '1.3.0'
  resource_link_id: string

  // Recommended Parameters
  user_id: string
  roles: LTIRoles[]
  lis_person_name_full: string
  lis_person_name_given: string
  lis_person_name_family: string
  lis_person_contact_email_primary: string
  resource_link_title: string
  context_id: string
  context_title: string
  context_label: string
  launch_presentation_locale: string
  launch_presentation_document_target: string
  launch_presentation_width: string
  launch_presentation_height: string
  launch_presentation_return_url: string
  tool_consumer_info_product_family_code: string
  tool_consumer_info_version: string
  tool_consumer_instance_guid: string
  tool_consumer_instance_name: string
  tool_consumer_instance_contact_email: string

  // Optional Parameters
  lis_outcome_service_url: string
  selection_directive: string
  resource_link_description: string
  context_type: string
  launch_presentation_css_url: string
  tool_consumer_instance_description: string
  tool_consumer_instance_url: string
  user_image: string

  // Username
  // https://developers.exlibrisgroup.com/leganto/integrations/lti/troubleshooting/user-problems/lms-username-parameter/

  /** Moodle username field */
  ext_user_username: string

  /** Canvas/Blackboard username field */
  custom_lis_user_username: string

  /** Desire2Learn username field */
  ext_d2l_username: string

  // Customs
  is_admin: boolean
  is_reviewer: boolean
  is_student: boolean
  is_instructor: boolean

  // Custom Parameters prefixed by custom_
  [key: string]: any
}
