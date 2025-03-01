export interface WcGenerateGeneratorSchema {
  /**
   * The name of the web component.
   * Will be used to generate the component selector, files, and class names.
   */
  name: string;

  /**
   * The type of component (player, activity, etc.).
   * Used to determine the directory structure.
   */
  type: string;
}
