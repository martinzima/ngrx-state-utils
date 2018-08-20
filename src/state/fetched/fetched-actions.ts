import { Action } from '@ngrx/store';
import { Guid } from '../../core';

export abstract class FetchAction implements Action {
  readonly requestId = Guid.newGuid();
  abstract readonly type;
}

export abstract class FetchCompleteAction<TResult> implements Action {
  constructor(public requestId: string, public value: TResult) {
  }

  abstract readonly type;
}
