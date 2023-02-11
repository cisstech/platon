/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LayoutTab {
  id: string;
  title: string;
  link: string | any[];
}

export declare type LayoutState =
  'LOADING' |
  'READY' |
  'NOT_FOUND' |
  'SERVER_ERROR' |
  'UNAUTHORIZED'
  ;
