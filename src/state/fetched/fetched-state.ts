/**
 * Generic utility class for states that are fetched - i.e. have a 'isLoading' flag
 * and handle concurrency correctly by always using response only from the latest
 * request.
 */
export class FetchedStateBase {
  isLoading: boolean = false;
  lastRequestId: string = null;
}

export class FetchedState<T> extends FetchedStateBase {
  constructor(value: T = null) {
    super();
    this.value = value;
  }
  
  value: T;
}

export function defaultFetchedState<T extends FetchedState<any>>(): T {
  return new FetchedState<T>() as T;
}
