/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, EventEmitter, InjectionToken, Injector } from '@angular/core'
import { deepCopy } from '@cisstech/nge/utils'
import { JSONSchema7 } from 'json-schema'

export enum WebComponentTypes {
  form = 'form',
  widget = 'widget',
}

/**
 * Configuration metadata that determines how a component should be processed, instantiated, and used at runtime.
 */
export interface WebComponentDefinition {
  /** Name of the component */
  name: string

  /** Type of the component */
  type: WebComponentTypes

  /** Html selector of the component. */
  selector: string

  /** Briefs description of the component. */
  description: string

  /** JSONSchema describing the properties of the component. */
  schema: Omit<JSONSchema7, 'properties'> & {
    // change properties map value types
    properties: Record<string, JSONSchema7>
  }
  /** State to show in showcase section of the documentation page. */
  showcase?: Record<string, any>

  /**
   * List of playgrounds to show in the documentation page.
   * Each playground is a code snippet that can be executed in the documentation page.
   * The key is the title of the playground and the value refers to a file in the `playground/[component-name]` folder.
   */
  playgrounds?: Record<string, string>
  [key: string]: unknown // allow deprecated properties to be kept for compatibility reasons with forked projects
}

/**
 * Basic representation of a web component model.
 */
export interface IWebComponent {
  /** Unique identifier of the component. */
  cid: string
  /** Show current state of the component. */
  debug: boolean
  /** Html selector of the component. */
  selector: string
  /** Indicates if the form is filled */
  isFilled: boolean
}

/**
 * Keeps a track to the changes that occurs in a web component state `@Input`.
 */
export interface WebComponentHooks<T = any> {
  /**
   * The state of the component.
   * The @WebComponent decorator create a getter and a setter during runtime to
   * synchronize the changes and call the methods `onAfterSerialize` (after the getter runs)
   * and `onAfterDeserialize` (after the setter runs).
   */
  state: T

  stateChange?: EventEmitter<T>

  readonly injector: Injector

  /**
   * This method is called immediately after the `state` getter runs with the object that
   * will be returned by the getter.
   * Define this method to handle any additional post validation tasks.
   *
   * @param state The state that will be returned by the getter.
   * @returns the state or a computed version of the state.
   */
  onGetState?(state: T): T

  /**
   * A callback method that is invoked immediately after the `state` setter runs.
   * Define this method to handle any additional validation and initialization tasks.
   *
   * Remarks:
   * - `ngOnInit` hook is always called before this one.
   * - change detector is triggered right after the end of this method refresh the view.
   */
  onChangeState?(): void
}

/**
 * Injection token to get the list of defined web components.
 */
export const WEB_COMPONENT_DEFINITIONS = new InjectionToken<WebComponentDefinition[]>('WEB_COMPONENT_DEFINITIONS')

/**
 * Defines the properties created by the WebComponent decorator.
 */
export interface WebComponentInstance extends WebComponentHooks<any> {
  /** A copy of $__state__$ to known which properties has changed during change detection. */
  $__stateCopy__$?: any

  /** Backed field for the `state` property of the component. */
  $__state__$?: any

  /**
   * Since onChangeState hook is called for each property change
   * setting this property to `true` allow to stop watching properties mutation
   * until the value is set to `false`.
   */
  $__suspendChanges__$?: boolean

  /**
   * A value indicating whether the ngOnInit hook
   * of the decorated component is already called.
   */
  $__ngOnInitCalled__$?: boolean

  /**
   * ChangeDetectorRef instance of the component.
   */
  $__changeDetector__$?: ChangeDetectorRef
}

/**
 * Decorator that marks a class as a web component and provides configuration metadata that determines how the component should be processed, instantiated, and used at runtime.
 * @param definition metadata informations about the component.
 */
export function WebComponent(definition: WebComponentDefinition): ClassDecorator {
  return function (target: any) {
    const prototype = target.prototype
    Object.defineProperty(prototype, 'state', {
      get: function () {
        return stateGetter(this, definition)
      },
      set: function (newState: any) {
        stateSetter(this, definition, newState)
      },
    })
    const ngOnInit = prototype.ngOnInit
    prototype.ngOnInit = async function (this: WebComponentInstance) {
      if (ngOnInit) {
        await ngOnInit.apply(this)
      }
      this.$__ngOnInitCalled__$ = true
      stateSetter(this, definition, this.state)
    }
    return target
  }
}

/**
 * Inject web components defaults properties (`cid`, `debug`...) to the given `definition` object.
 * @param definition Definition object to modify.
 *@returns The modified definition object.
 */
export function defineWebComponent(definition: WebComponentDefinition): WebComponentDefinition {
  definition.schema.properties = {
    ...definition.schema.properties,
    cid: {
      default: '',
      type: 'string',
      description: 'Identifiant unique du composant.',
    },
    selector: {
      default: definition.selector,
      readOnly: true,
      type: 'string',
      description: 'Nom de la balise HTML associée au composant.',
    },
    debug: {
      default: false,
      type: 'boolean',
      description: 'Afficher les propriétés du composant?',
    },
    isFilled: {
      default: false,
      readOnly: true,
      type: 'boolean',
      description: 'Indique si le formulaire à été rempli.',
    },
  }
  definition.schema.additionalProperties = false
  definition.schema.required = [...(definition.schema.required || []), 'cid', 'selector']
  return definition
}

function createState(component: WebComponentInstance, definition: WebComponentDefinition) {
  if (component.$__state__$) return component.$__state__$

  // create a proxy to handles mutations of the state object.
  const handler: ProxyHandler<any> = {
    get(target: any, key: string) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        return new Proxy(target[key], handler)
      }
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      detectChanges(component)
      return true
    },
  }

  return (component.$__state__$ = new Proxy(
    {
      cid: '',
      selector: definition.selector,
      debug: false,
      isFilled: false,
    },
    handler
  ))
}

function stateGetter(component: WebComponentInstance, definition: WebComponentDefinition) {
  const suspended = suspendChanges(component)
  const state = createState(component, definition)
  const properties = definition.schema.properties
  Object.keys(properties).forEach((propertyName) => {
    const property = properties[propertyName]
    if (state[propertyName] == null && property.default != null) {
      state[propertyName] = deepCopy(property.default)
    }
  })
  if (component.onGetState) {
    component.onGetState(state)
  }
  component.$__suspendChanges__$ = suspended
  return state
}

function stateSetter(component: WebComponentInstance, definition: WebComponentDefinition, newState: any) {
  if (!newState) {
    throw new Error('[web-component]: A webcomponent state cannot be null')
  }

  if (typeof newState === 'string') {
    newState = JSON.parse(newState.startsWith('{') ? newState : window.atob(newState))
  }

  const suspended = suspendChanges(component)
  const state = component.state
  const properties = definition.schema.properties
  Object.keys(properties).forEach((propertyName) => {
    if (propertyName in newState) {
      state[propertyName] = newState[propertyName]
    }
  })
  component.$__suspendChanges__$ = suspended
  detectChanges(component)
}

function detectChanges(component: WebComponentInstance) {
  component.$__changeDetector__$ = component.$__changeDetector__$ ?? component.injector.get(ChangeDetectorRef)
  if (component.$__ngOnInitCalled__$) {
    component.stateChange?.next(component.state)
  }

  component.$__changeDetector__$.markForCheck()
  component.$__changeDetector__$.detectChanges()

  if (component.$__suspendChanges__$ || !component.$__ngOnInitCalled__$) {
    return
  }

  component.$__suspendChanges__$ = true
  if (component.onChangeState) {
    component.onChangeState()
  }

  component.$__changeDetector__$.markForCheck()
  component.$__changeDetector__$.detectChanges()
  component.$__suspendChanges__$ = false
}

/**
 * Suspend the changes detection of the component.
 * @param component The component to suspend the changes detection.
 * @returns `true` if the changes detection was already suspended, `false` otherwise.
 */
function suspendChanges(component: WebComponentInstance): boolean {
  const suspended = component.$__suspendChanges__$ ?? false
  component.$__suspendChanges__$ = true
  return suspended
}
