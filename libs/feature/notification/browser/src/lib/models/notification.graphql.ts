import { gql } from 'apollo-angular'

gql`
  fragment Notif on Notification {
    id
    user {
      id
      email
      username
      firstName
      lastName
    }
    readAt
    createdAt
    data
  }

  query ListNotifications($filters: NotificationFiltersInput) {
    unreadNotificationsCount
    notifications(filters: $filters) {
      ...Notif
    }
  }

  subscription OnChangeNotifications {
    onChangeNotifications {
      unreadCount
      newNotification {
        ...Notif
      }
    }
  }

  mutation MarkAsRead($id: UUID!) {
    markAsRead(id: $id) {
      ...Notif
    }
  }

  mutation MarkAllAsRead {
    markAllAsRead
  }

  mutation DeleteNotification($id: UUID!) {
    deleteNotification(id: $id)
  }

  mutation DeleteAllNotifications {
    deleteAllNotifications
  }
`
