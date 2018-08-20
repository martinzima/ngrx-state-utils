import { Action, ActionReducer } from '@ngrx/store';

import { CommandReducer, StaticAction } from './command-reducer';
import { ReducerObject } from './reducer-object';

/**
 * A combined reducer for complex state structures.
 * Similar to combineReducers - unlike that it however correctly slices state
 * as per specified 'reducers' object structure, support multiple reducers
 * per slice (specified as an array), allows omitting reducers for slices
 * and also supports command-style reducers.
 *
 * Methods addMap/addReducer/addComand calls respect the order in which they
 * were called when executing this reducer.
 */
export class DeepReducer<S extends object> extends ReducerObject<S> {
  private reducers: any[] = [];
  private commandReducer: CommandReducer<S> = null;

  constructor(private initialState: S = null) {
    super();
  }

  /**
   * Adds a new sub-reducer map.
   * Example:
   *
   * class MyState {
   *   foo: {
   *     bar: number = 5;
   *   }
   *
   *   lorem: {
   *     dolor: {
   *       emet: string = null;
   *       ipsum: number = 5;
   *     },
   *     form: FormGroupState<MyFormValue> = createFormGroupState<MyFormValue>('my.lorem.form', {  myField: '' })
   *   }
   * }
   *
   * ...
   *
   * this.addMap({
   *   foo: {
   *     bar: [barReduce1, new BarReduce2()]
   *   },
   *   lorem: [
   *     {
   *       form: [myFormReduce]
   *     },
   *     loremReduce
   *   ]
   * });
   *
   * @param map Should be an object with the structure of S (can omit any fields) specifying
   * the subreducers. The values can either be objects for deeper structures or arrays
   * of actual reducer functions/ReducerObject instances/deeper sub-reducer maps.
   */
  addMap(map: any) {
    this.reducers.push(map);
    this.commandReducer = null;
    return this;
  }

  /**
   * Adds a sub-reducer function or ReducerObject to be executed for the entire graph.
   *
   * @param reducer An action reducer function or ReducerObject instance.
   */
  addReducer(reducer: ActionReducer<S> | ReducerObject<S>) {
    this.reducers.push(reducer);
    this.commandReducer = null;
    return this;
  }

  /**
   * Adds a command reducer for an action type.
   *
   * @param action Action type.
   * @param command Reducer function.
   */
  addCommand<P extends Action>(action: StaticAction<Action>, command: ActionReducer<S, P>) {
    if (!this.commandReducer) {
      this.commandReducer = new CommandReducer(this.initialState);
      this.reducers.push(this.commandReducer);
    }

    this.commandReducer.add(action, command.bind(this));
    return this;
  }

  /**
   * Gets the combined reducer function.
   */
  reducer(): ActionReducer<S> {
    return createDeepReducer(this.reducers, this.initialState);
  }
}

/**
 * Creates a combined reducer for complex state structures.
 * Similar to combineReducers - unlike that it however correctly slices state
 * as per specified 'reducers' object structure, support multiple reducers
 * per slice (specified as an array) and allows omitting reducers for slices.
 * 
 */
export function createDeepReducer(
  reducers: any,
  initialState: any = undefined
): ActionReducer<any, Action> {
  if (Array.isArray(reducers)) {
    const reducerFuncs = [];
    for (let partEl of reducers) {
      if (typeof partEl === 'function') {
        reducerFuncs.push(partEl);
      } else if (partEl instanceof ReducerObject) {
        reducerFuncs.push(partEl.reducer());
      } else {
        reducerFuncs.push(createDeepReducer(partEl, initialState));
      }
    }

    return (state, action) => {
      state = state === undefined ? initialState : state;

      for (const reducerFun of reducerFuncs) {
        state = reducerFun(state, action);
      }
      return state;
    }
  }

  const reducerKeys = Object.keys(reducers);
  const finalReducers: any = {};

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    const part = reducers[key];
    finalReducers[key] = createDeepReducer(part, initialState ? initialState[key] : null);
  }

  return (state, action) => {
    state = state === undefined ? initialState : state;
    let hasChanged = false;
    const nextState = { ...state };
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer: any = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
