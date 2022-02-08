import {del} from '@truefit/http-utils';
import {Dispatch} from 'redux';
import {createAction} from '@reduxjs/toolkit';
import {BeerDetail, Stat} from '../Types';

export enum RemoveOpinionActions {
  Remove = 'RECORD_OPINION/Removed',
}

const opinionRemoved = createAction<Stat>(RemoveOpinionActions.Remove);

export const removeOpinion = (beerDetail: BeerDetail) => async (dispatch: Dispatch) => {
  await del(`/stats/${beerDetail.opinion.id}`);

  dispatch(opinionRemoved(beerDetail.opinion));
};
