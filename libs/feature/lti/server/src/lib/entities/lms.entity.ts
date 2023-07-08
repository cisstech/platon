import { BaseEntity } from '@platon/core/server'
import { Column, Entity, Unique } from 'typeorm'

@Entity('Lmses')
@Unique('Lmses_unique_idx', ['consumerKey'])
export class LmsEntity extends BaseEntity {
  /**
   * Name that identifies the LMS, for example: Moodle UPEM.
   */
  @Column()
  name!: string

  /**
   * URL of the LMS, for example: https://elearning.u-pem.fr/
   */
  @Column()
  url!: string

  /**
   * URL on which to post back results to a LMS.
   * Correspond to the lis_outcome_service_url param of a LTI request
   */
  @Column({ name: 'outcome_url' })
  outcomeUrl!: string

  /**
   * Key that you'll need to enter on the LMS when creating a LTI activity.
   * Correspond to the oauth_consumer_key param of a LTI request
   */
  @Column({ name: 'consumer_key' })
  consumerKey!: string

  /**
   * Secret that you'll need to enter on the LMS when creating a LTI activity.
   */
  @Column({ name: 'consumer_secret' })
  consumerSecret!: string
}
