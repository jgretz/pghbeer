import moment from 'moment';
import {post, put} from '@truefit/http-utils';
import {Dispatch} from 'redux';
import {createAction} from '@reduxjs/toolkit';
import {Stat, BeerDetail, User, StatOpinion} from '../Types';
import {EVENT_ID} from '../../../constants';

export enum RecordOpinionActions {
  Record = 'RECORD_OPINION/Recorded',
}

const opinionRecorded = createAction<Stat>(RecordOpinionActions.Record);

export const recordOpinion =
  (user: User, beerDetail: BeerDetail, opinion: StatOpinion) => async (dispatch: Dispatch) => {
    const payload = {
      ...(beerDetail.opinion ?? {}),

      date: moment.utc().toDate(),
      opinion,
      beer_id: beerDetail.beer.id,
      user_id: user.id,
      event_id: EVENT_ID,
    };

    if (beerDetail.opinion) {
      await put(`/stats/${beerDetail.opinion.id}`, payload);
    } else {
      const response = await post<Stat>('/stats', payload);

      payload.id = response.data.id;
    }

    dispatch(opinionRecorded(payload as Stat));
  };
