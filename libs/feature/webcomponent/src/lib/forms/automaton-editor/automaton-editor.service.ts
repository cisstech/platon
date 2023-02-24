import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  Automaton,
  automatonFromString,
  emptyAutomaton,
  Point,
  Transition,
} from './automaton';
import { AutomatonEditorState } from './automaton-editor';

/**
 * Automaton editor API.
 */
@Injectable()
export class AutomatonEditorService {
  private state!: AutomatonEditorState;

  private readonly createStateEvent = new Subject<string>();
  private readonly createTransitionEvent = new Subject<Transition>();
  private readonly createInitialStateEvent = new Subject<string>();
  private readonly createAcceptingStateEvent = new Subject<string>();

  private readonly removeStateEvent = new Subject<string>();
  private readonly removeTransitionEvent = new Subject<Transition>();
  private readonly removeInitialStateEvent = new Subject<string>();
  private readonly removeAcceptingStateEvent = new Subject<string>();

  private readonly renameStateEvent = new Subject<{
    oldName: string;
    newName: string;
  }>();
  private readonly renameTransitionEvent = new Subject<Transition>();

  get onCreateState() {
    return this.createStateEvent.asObservable();
  }
  get onCreateTransition() {
    return this.createTransitionEvent.asObservable();
  }
  get onCreateInitialState() {
    return this.createInitialStateEvent.asObservable();
  }
  get onCreateAcceptingState() {
    return this.createAcceptingStateEvent.asObservable();
  }

  get onRemoveState() {
    return this.removeStateEvent.asObservable();
  }
  get onRemoveTransition() {
    return this.removeTransitionEvent.asObservable();
  }
  get onRemoveInitialState() {
    return this.removeInitialStateEvent.asObservable();
  }
  get onRemoveAcceptingState() {
    return this.removeAcceptingStateEvent.asObservable();
  }

  get onRenameState() {
    return this.renameStateEvent.asObservable();
  }
  get onRenameTransition() {
    return this.renameTransitionEvent.asObservable();
  }

  private get automaton() {
    try {
      if (typeof this.state.automaton === 'string') {
        this.state.automaton = automatonFromString(this.state.automaton);
      } else if (!this.state.automaton) {
        this.state.automaton = emptyAutomaton();
      }
    } catch (error) {
      console.log(error);
      this.state.automaton = emptyAutomaton();
    }
    const automaton = this.state.automaton;
    if (!automaton.position) automaton.position = {};
    if (!automaton.states) automaton.states = [];
    if (!automaton.initialStates) automaton.initialStates = [];
    if (!automaton.acceptingStates) automaton.acceptingStates = [];
    if (!automaton.alphabet) automaton.alphabet = [];
    if (!automaton.transitions) automaton.transitions = [];
    return automaton;
  }

  private set automaton(value: Automaton) {
    this.state.automaton = value;
  }

  private get alphabet() {
    return this.automaton.alphabet;
  }

  private set alphabet(value: string[]) {
    this.automaton.alphabet = value;
  }

  private get states() {
    return this.automaton.states;
  }

  private set states(value: string[]) {
    this.automaton.states = value;
  }

  private get position() {
    if (!this.automaton.position) {
      this.automaton.position = {};
    }
    return this.automaton.position;
  }

  private set position(value: Record<string, Point>) {
    this.automaton.position = value;
  }

  private get transitions() {
    return this.automaton.transitions;
  }

  private set transitions(value: Transition[]) {
    this.automaton.transitions = value;
  }

  private get initialStates() {
    return this.automaton.initialStates;
  }

  private set initialStates(value: string[]) {
    this.automaton.initialStates = value;
  }

  private get acceptingStates() {
    return this.automaton.acceptingStates;
  }

  private set acceptingStates(value: string[]) {
    this.automaton.acceptingStates = value;
  }

  sync(state: AutomatonEditorState) {
    this.state = state;
    this.validate();
  }

  findPosition(name: string) {
    return this.position[name];
  }

  forEachState(consumer: (name: string) => void) {
    this.states.forEach(consumer);
  }

  forEachTransition(consumer: (transition: Transition) => void) {
    this.transitions.forEach(consumer);
  }

  /**
   * Generates new state name.
   */
  stateName() {
    return 'S' + (this.states.length + 1);
  }

  /**
   * Gets a value indicating whether there is a state named `name`.
   * @param name The state name to test.
   */
  isState(name: string) {
    return this.states.find((e) => e === name) != null;
  }

  /**
   * Gets a value indicating whether there is an initial state named `name`.
   * @param name The state name to test.
   */
  isInitial(state: string) {
    return (
      this.isState(state) && this.initialStates.find((e) => e === state) != null
    );
  }

  /**
   * Gets a value indicating whether there is an accepting state named `name`.
   * @param name The state name to test.
   */
  isAccepting(state: string) {
    return (
      this.isState(state) &&
      this.acceptingStates.find((e) => e === state) != null
    );
  }

  /**
   * Adds new state named `name` to the editor and emit `onCreateState` event if the state is added.
   * @param name The name of the state.
   * @param x x position of the state.
   * @param y y position of the state.
   * @returns `true` if the state is added `false` otherwises.
   */
  addState(name: string, x: number, y: number) {
    if (!this.isState(name)) {
      this.states.push(name);
      this.moveState(name, x, y);
      if (!this.initialStates.length) {
        this.addInitial(name);
      }
      this.createStateEvent.next(name);
      return true;
    }
    return false;
  }

  /**
   * Updates the position of the state named `named`.
   * @param name The name of the state to move.
   * @param x New x position.
   * @param y New y position.
   */
  moveState(name: string, x: number, y: number) {
    this.position[name] = { x, y };
  }

  /**
   * Adds the state named `name` to the initials states list of the automaton
   * and emit `onCreateInitialState` event if the state is added.
   * @param name The state to add.
   * @returns `true` if the state is added `false` otherwises.
   */
  addInitial(name: string) {
    if (!this.isInitial(name)) {
      this.initialStates.push(name);
      this.createInitialStateEvent.next(name);
      return true;
    }
    return false;
  }

  /**
   * Adds the state named `name` to the accepting states list of the automaton
   * and emit `onCreateAcceptingState` event if the state is added.
   * @param name The state to add.
   * @returns `true` if the state is added `false` otherwises.
   */
  addAccepting(name: string) {
    if (!this.isState(name)) return false;

    if (!this.isAccepting(name)) {
      this.acceptingStates.push(name);
      this.createAcceptingStateEvent.next(name);
      return true;
    }
    return false;
  }

  /**
   * Removes the state named `name` from the states list of the automaton if it exists
   * and emit `onRemoveState` event.
   *
   * Note:
   *
   * This method will also remove all the references of the state from the properties
   * of the automaton (initialStates, acceptingStates...).
   *
   * @param name The state to remove.
   * @returns `true` if the state is removed `false` otherwises.
   */
  removeState(name: string) {
    if (this.remove(this.states, (e) => e === name)) {
      delete this.position[name];
      this.removeInitial(name);
      this.removeAccepting(name);
      this.remove(
        this.transitions,
        (t) => t.fromState === name || t.toState === name
      );
      this.validate();
      this.removeStateEvent.next(name);
      return true;
    }
    return false;
  }

  /**
   * Removes the state named `name` from the initials states list of the automaton if it exists
   * and emit `onRemoveInitialState` event.
   * @param name The state to remove.
   * @returns `true` if the state is removed `false` otherwises.
   */
  removeInitial(name: string) {
    if (this.remove(this.initialStates, (e) => e === name)) {
      this.removeInitialStateEvent.next(name);
      return true;
    }
    return false;
  }

  /**
   * Removes the state named `name` from the accepting states list of the automaton if it exists
   * and emit `onRemoveAcceptingState` event.
   * @param name The state to remove.
   * @returns `true` if the state is removed `false` otherwises.
   */
  removeAccepting(name: string) {
    if (this.remove(this.acceptingStates, (e) => e === name)) {
      this.removeAcceptingStateEvent.next(name);
      return true;
    }
    return false;
  }

  /**
   * Renames the state `oldName` to `newName` and call `onRenameState` event.
   * @param oldName The old state name.
   * @param newName The new state name.
   * @returns `true` if the state is renamed `false` otherwise.
   */
  renameState(oldName: string, newName: string) {
    if (!this.isState(oldName)) {
      return false;
    }

    // replace in states
    this.states = [
      newName,
      ...this.states.filter((state) => {
        return state !== oldName;
      }),
    ];

    // replace in initials
    this.initialStates = this.initialStates.map((state) => {
      if (state === oldName) {
        return newName;
      }
      return state;
    });

    // replace in finals
    this.acceptingStates = this.acceptingStates.map((state) => {
      if (state === oldName) {
        return newName;
      }
      return state;
    });

    // replace in transitions
    this.automaton.transitions.forEach((transition) => {
      if (transition.fromState === oldName) {
        transition.fromState = newName;
      }
      if (transition.toState === oldName) {
        transition.toState = newName;
      }
    });

    // replace in position
    this.position[newName] = this.position[oldName];

    delete this.position[oldName];

    this.validate();
    this.renameStateEvent.next({ oldName, newName });
    return true;
  }

  /**
   * Gets a value indicating whether the given `transition` exists.
   * @param transition The transition to test.
   */
  isTransition(transition: Transition) {
    return this.transitions.find((e) => {
      return (
        e.fromState === transition.fromState && e.toState === transition.toState
      );
    });
  }

  /**
   * Adds `transition` to the transitions list of the automaton
   * and emit `onCreateTransition` event if it is added.
   * @param transition The transition to add.
   * @returns `true` if the transition is added `false` otherwise.
   */
  addTransition(transition: Transition) {
    if (!this.isTransition(transition)) {
      this.transitions.push(transition);
      this.validate();
      this.createTransitionEvent.next(transition);
      return true;
    }
    return false;
  }

  /**
   * Adds `transition` to the transitions list of the automaton
   * and emit `onRemoveTransition` event if it is removed.
   * @param transition The transition to remove.
   * @returns `true` if the transition is removed `false` otherwise.
   */
  removeTransition(transition: Transition) {
    if (
      this.remove(this.transitions, (e) => {
        return (
          e.fromState === transition.fromState &&
          e.toState === transition.toState
        );
      })
    ) {
      this.validate();
      this.removeTransitionEvent.next(transition);
      return true;
    }
    return false;
  }

  /**
   * Renames the symbols of `transition` and emit `onRenameTransition` event.
   * @param transition The transition to remove.
   * @returns `true` if the transition is renamed `false` otherwise.
   */
  renameTransition(transition: Transition, symbols: string[]) {
    const tr = this.transitions.find(
      (e) =>
        e.fromState === transition.fromState && e.toState === transition.toState
    );
    if (tr) {
      tr.symbols = [...symbols];
      this.validate();
      this.renameTransitionEvent.next(tr);
      return true;
    }
    return false;
  }

  /**
   * Finds the transition that meets the given `predicate`.
   * @param predicate The predicate to test.
   */
  findTransition(predicate: (transition: Transition) => boolean) {
    return this.transitions.find(predicate);
  }

  private validate() {
    const alphabet: string[] = [];
    this.transitions.forEach((transition) => {
      transition.symbols.forEach((symbol) => {
        if (!alphabet.includes(symbol)) {
          alphabet.push(symbol);
        }
      });
    });
    this.alphabet = alphabet;
  }

  private remove<T>(array: T[], predicate: (e: T) => boolean) {
    let i = 0;
    for (const e of array) {
      if (predicate(e)) {
        array.splice(i, 1);
        return true;
      }
      i++;
    }
    return false;
  }
}
