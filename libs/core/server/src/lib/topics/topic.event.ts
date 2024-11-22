import { TopicEntity } from './topic.entity'

export const ON_TOPIC_FUSION_EVENT = 'topic.fusion'

export interface OnTopicFusionEventPayload {
  oldTopic: TopicEntity
  newTopic: TopicEntity
}
