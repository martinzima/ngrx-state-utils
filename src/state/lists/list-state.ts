import { FetchedState } from '../fetched/fetched-state';

export class ListSearch {
  page: number = 0;
  itemsPerPage: number = 10;
  orderBy: string[] = [];
}

export class FulltextListSearch extends ListSearch {
  fulltext: string = null;
}

export class ListState<T, TSearch = ListSearch> extends FetchedState<T[]> {
  constructor(public id: string, public search: TSearch) {
    super([]);
  }
  
  totalCount: number = 0;
  selected: T[] = [];
}

export function defaultListState<T extends ListState<any, ListSearch>>(id: string): T {
  return new ListState<T, ListSearch>(id, new ListSearch()) as T;
}

export function defaultFulltextListState<T extends ListState<any, FulltextListSearch>>(id: string): T {
  return new ListState<T, ListSearch>(id, new FulltextListSearch()) as T;
}
