import { RouterStateSerializer } from '@ngrx/router-store';
import { ActivatedRouteSnapshot, Data, Params, RouterStateSnapshot } from '@angular/router';

/**
 * The RouterStateSerializer takes the current RouterStateSnapshot
 * and returns any pertinent information needed. The snapshot contains
 * all information about the state of the router at the given point in time.
 * The entire snapshot is complex and not always needed. In this case, you only
 * need the URL and query parameters from the snapshot in the store. Other items could be
 * returned such as route parameters and static route data.
 */

export interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
  data: Data;
}

export class CustomRouterStateSerializer implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    return {
      url: routerState.url,
      params: mergeRouteParams(routerState.root, r => r.params),
      queryParams: mergeRouteParams(routerState.root, r => r.queryParams),
      data: mergeRouteData(routerState.root)
    };
  }
}

function mergeRouteParams(route: ActivatedRouteSnapshot, getter: (r: ActivatedRouteSnapshot) => Params): Params {
  if (!route) {
    return {};
  }

  const currentParams = getter(route);
  const primaryChild = route.children.find(c => c.outlet === 'primary') || route.firstChild;
  return Object.assign({}, currentParams, mergeRouteParams(primaryChild, getter));
}

function mergeRouteData(route: ActivatedRouteSnapshot): Data {
  if (!route) {
    return {};
  }

  const currentData = route.data;
  const primaryChild = route.children.find(c => c.outlet === 'primary') || route.firstChild;
  return Object.assign({}, currentData, mergeRouteData(primaryChild));
}
