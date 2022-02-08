import {createAction} from '@reduxjs/toolkit';

export enum SetSearchTermActions {
  Set = 'SEARCH_TERM/Set',
}

const searchTermSet = createAction<string>(SetSearchTermActions.Set);

export const setSearchTerm = (term: string) => searchTermSet(term);
