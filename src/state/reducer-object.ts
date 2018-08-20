import { ActionReducer } from "@ngrx/store";

export abstract class ReducerObject<S> {
  abstract reducer(): ActionReducer<S>;
}
