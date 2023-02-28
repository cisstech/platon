/** Exercise settings. */
export interface PlayerSettings {
  /** Duration of the activity (-1 for infinite). */
  duration?: number;

  /** Activity authorized action buttons. */
  actions?: PlayerActionSettings;

  /** Activity navigation options. */
  navigation?: PlayerNavigationSettings;

  /** Activity feedback options */
  feedback?: PlayerFeedbackSettings;
}

/** Settings specific to action buttons. */
export interface PlayerActionSettings {
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
export interface PlayerFeedbackSettings {
  /** Show feedback at the end of the activity. */
  review?: boolean;
  /** Show feedback after exercise validation. */
  validation?: boolean;
}

/** Settings specific to navigation. */
export interface PlayerNavigationSettings {
  /**
   * Navigation mode.
   * - `manual` => The user can jump between the exercises by using the navigation card.
   * - `composed` => All exercises are shown together.
   * - `dynamic` => Navigation is controlled by a custom script.
  */
  mode?: 'manual' | 'composed' | 'dynamic';
}

/** Default settings for preview mode. */
export const defaultPlayerSettings = (): PlayerSettings => ({
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
