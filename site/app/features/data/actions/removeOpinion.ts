import {del} from '@truefit/http-utils';
import {Dispatch} from 'redux';
import {createAction} from '@reduxjs/toolkit';
import {BeerDetail, Stat} from '../Types';

export enum RemoveOpinionActions {
  Remove = 'RECORD_OPINION/Removed',
}

const opinionRemoved = createAction<Stat>(RemoveOpinionActions.Remove);

export const removeOpinion = (beerDetail: BeerDetail) => async (dispatch: Dispatch) => {
  // I know this will make them click 2x, but its ok for this application to let the web calls catch up
  // so we have data integrity
  if (!beerDetail.opinion.id) {
    return;
  }

  dispatch(opinionRemoved(beerDetail.opinion));

  await del(`/stats/${beerDetail.opinion.id}`);
};
