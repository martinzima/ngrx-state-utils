import { Action } from '@ngrx/store';

import { ListSearch } from './list-state';
import { FetchAction } from '../fetched';

export class ModifyListSearchAction implements Action {
  readonly type = 'revo.lists.ModifyListSearchAction';
  constructor(public listId: string, public listSearch: ListSearch) {}
}

export class LoadListAction extends FetchAction {
  readonly type = 'revo.lists.LoadListAction';
  constructor(public listId: string, public search: ListSearch) { super(); }
}

export class LoadListCompleteAction implements Action {
  readonly type = 'revo.lists.LoadListCompleteAction';
  constructor(public listId: string, public items: any[], public totalCount: number,
    public requestId: string) {}
}

export class SelectListItemsAction implements Action {
  readonly type = 'revo.lists.SelectListItemsAction';
  constructor(public listId: string, public selected: any[]) {}
}
