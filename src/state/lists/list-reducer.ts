import { ActionReducer } from '@ngrx/store';

import { CommandReducer } from '../command-reducer';
import { DeepReducer } from '../deep-reducer';
import { fetchCompleteReduce, fetchReduce } from '../fetched';
import { LoadListAction, LoadListCompleteAction, ModifyListSearchAction, SelectListItemsAction } from './list-actions';
import { defaultFulltextListState, defaultListState, FulltextListSearch, ListSearch, ListState } from './list-state';

function modifyListSearch(listId: string) {
  return function(state: ListState<any, ListSearch>, action: ModifyListSearchAction): ListState<any, ListSearch> {
    if (action.listId === listId) {
      return {
        ...state,
        search: {
          ...state.search,
          ...action.listSearch
        }
      };
    } else {
      return state;
    }
  };
}

function loadList(listId: string) {
  return function(state: ListState<any, ListSearch>, action: LoadListAction): ListState<any, ListSearch> {
    if (action.listId === listId) {
      return {
        ...state,
        ...fetchReduce(state, action.requestId)
      };
    } else {
      return state;
    }
  };
}

function loadListComplete(listId: string) {
  return function(state: ListState<any, ListSearch>, action: LoadListCompleteAction): ListState<any, ListSearch> {
    if (action.listId === listId) {
      return {
        ...state,
        ...fetchCompleteReduce(state, action.items, action.requestId),
        totalCount: action.totalCount,
        selected: state.selected
          .map(x => {
            const item = action.items.find(y => y.id && x.id && y.id === x.id);
            return item != null ? item : null;
          })
          .filter(x => x != null)
      };
    } else {
      return state;
    }
  };
}

function selectListItems(listId: string) {
  return function(state: ListState<any, ListSearch>, action: SelectListItemsAction): ListState<any, ListSearch> {
    if (action.listId === listId) {
      return {
        ...state,
        selected: action.selected
      };
    } else {
      return state;
    }
  };
}

export function createListReducer(listId: string): ActionReducer<ListState<any, ListSearch>> {
  return new CommandReducer<ListState<any, ListSearch>>()
    .add(ModifyListSearchAction, modifyListSearch(listId))
    .add(LoadListAction, loadList(listId))
    .add(LoadListCompleteAction, loadListComplete(listId))
    .add(SelectListItemsAction, selectListItems(listId))
    .reducer();
}

export class ListReducer<TListState extends ListState<T, TListSearch>,
  T, TListSearch> extends DeepReducer<TListState> {
  constructor(listId: string, defaultState: TListState) {
    super(defaultState);
    this.addReducer(createListReducer(listId) as any as ActionReducer<TListState>);
  }
}

export class SimpleListReducer<TListState extends ListState<T, ListSearch>,
  T> extends ListReducer<TListState, T, ListSearch> {
  constructor(listId: string, defaultState: TListState = defaultListState(listId)) {
    super(listId, defaultState);
  }
}

export class FulltextListReducer<TListState extends ListState<T, FulltextListSearch>,
  T> extends ListReducer<TListState, T, FulltextListSearch> {
  constructor(listId: string, defaultState: TListState = defaultFulltextListState(listId)) {
    super(listId, defaultState);
  }
}
