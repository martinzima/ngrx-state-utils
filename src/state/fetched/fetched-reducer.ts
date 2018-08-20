import { ActionReducer } from '@ngrx/store';

import { CommandReducer, StaticAction } from '../command-reducer';
import { DeepReducer } from '../deep-reducer';
import { FetchAction, FetchCompleteAction } from './fetched-actions';
import { defaultFetchedState, FetchedState } from './fetched-state';

export function fetchReduce<T extends FetchedState<TResult>, TResult>(state: T, requestId: string): T {
  return {
    ...(state as object),
    lastRequestId: requestId,
    isLoading: true
  } as object as T;
}

export function fetchCompleteReduce<T extends FetchedState<TResult>, TResult>(state: T, value: TResult, requestId: string): T {
  if (state.lastRequestId === requestId) {
    return {
      ...(state as object),
      isLoading: false,
      value: value,
      lastRequestId: null
    } as object as T;
  } else {
    return state;
  }
}

export function fetchReduceAction<T extends FetchedState<TResult>, TResult>(state: T, action: FetchAction): T {
  return fetchReduce(state, action.requestId);
}

export function fetchCompleteReduceAction<T extends FetchedState<TResult>, TResult>(state: T, action: FetchCompleteAction<TResult>): T {
  return fetchCompleteReduce(state, action.value, action.requestId);
}

export function createFetchReducer<TState extends FetchedState<TResult>,
  TFetchAction extends FetchAction,
  TFetchCompleteAction extends FetchCompleteAction<TResult>,
  TResult>(fetchActionType: StaticAction<TFetchAction>,
    fetchActionCompleteType: StaticAction<TFetchCompleteAction>,
    defaultState: TState = defaultFetchedState()): ActionReducer<TState> {
  return new CommandReducer<TState>(defaultState)
    .add<TFetchAction>(fetchActionType, fetchReduceAction)
    .add<TFetchCompleteAction>(fetchActionCompleteType, fetchCompleteReduceAction)
    .reducer();
}

export class FetchReducer<TState extends FetchedState<TResult>,
  TFetchAction extends FetchAction,
  TFetchCompleteAction extends FetchCompleteAction<TResult>,
  TResult> extends DeepReducer<TState> {
  constructor(fetchActionType: StaticAction<TFetchAction>,
    fetchActionCompleteType: StaticAction<TFetchCompleteAction>,
    defaultState: TState = defaultFetchedState()) {
    super(defaultState);
    this.addReducer(createFetchReducer(fetchActionType, fetchActionCompleteType, defaultState));
  }
}
