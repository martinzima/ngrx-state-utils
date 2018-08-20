import { Action, ActionReducer } from '@ngrx/store';
import { ReducerObject } from './reducer-object';

export interface StaticAction<A> {
  new(...args: any[]): A;
}

export interface CommandReducerMapping {
  action: StaticAction<Action>;
  command: ActionReducer<any, Action>;
}

/**
 * A command-style reducer mapping reducer functions based on action types.
 *
 * Adapted from: https://github.com/fathomlondon/ngrx-command-reducer.
 */
export class CommandReducer<S extends object> extends ReducerObject<S> {
  private map: CommandReducerMapping[] = [];

  constructor(private defaultState: S = null) {
    super();
  }

  add = <P extends Action>(action: StaticAction<Action>, command: ActionReducer<S, P>): CommandReducer<S> => {
    this.map.push({action, command});
    return this;
  }

  reducer(): ActionReducer<S> {
    return this._reducer;
  }

  private _reducer: ActionReducer<S> = (state: S, action: Action): S => {
    if (typeof state === 'undefined') {
      state = this.defaultState;
    }

    return this.map.reduce(
      (prevState: S, mapping: CommandReducerMapping) => {
        if (action instanceof mapping.action) {
          const newState = mapping.command(prevState, action);
          if (typeof newState !== 'undefined') {
            return newState;
          }
        }

        return prevState;
      },
      state
    );
  }
}
