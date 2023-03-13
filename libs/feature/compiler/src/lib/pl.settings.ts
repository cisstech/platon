/** Exercise settings. */
export interface ActivitySettings {
  /** Duration of the activity (-1 for infinite). */
  duration?: number;

  /** Activity authorized action buttons. */
  actions?: ActivityActionSettings;

  /** Activity navigation options. */
  navigation?: ActivityNavigationSettings;

  /** Activity feedback options */
  feedback?: ActivityFeedbackSettings;
}

/** Settings specific to action buttons. */
export interface ActivityActionSettings {
  /** Number of attempts authorized (-1 for infinite). */
  retry?: number;
  /** Display "hints" button. */
  hints?: boolean;

  /** Display "reroll" button. */
  reroll?: boolean;
  /** Display "theories" button. */
  theories?: boolean;
  /** Display "solution" button. */
  solution?: boolean;
}

/** Settings specific to feedbacks. */
export interface ActivityFeedbackSettings {
  /** Show feedback at the end of the activity. */
  review?: boolean;
  /** Show feedback after exercise validation. */
  validation?: boolean;
}

/** Settings specific to navigation. */
export interface ActivityNavigationSettings {
  /**
   * Navigation mode.
   * - `manual` => The user can jump between the exercises by using the navigation card.
   * - `composed` => All exercises are shown together.
   * - `dynamic` => Navigation is controlled by a custom script.
  */
  mode?: 'manual' | 'composed' | 'dynamic';
}

/** Default settings for preview mode. */
export const defaultActivitySettings = (): ActivitySettings => ({
  actions: {
    retry: 1,
    hints: true,
    reroll: true,
    theories: true,
    solution: true,
  },
  duration: -1,
  feedback: {
    review: true,
    validation: true,
  },
  navigation: {
    mode: 'manual'
  }
});
