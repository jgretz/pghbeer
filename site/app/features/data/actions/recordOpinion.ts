import moment from 'moment';
import {post, put} from '@truefit/http-utils';
import {Dispatch} from 'redux';
import {createAction} from '@reduxjs/toolkit';
import {Stat, BeerDetail, User, StatOpinion} from '../Types';
import {EVENT_ID} from '../../../constants';

export enum RecordOpinionActions {
  Record = 'RECORD_OPINION/Recorded',
  UpdateOpinionId = 'RECORD_OPINION/UpdateOpinionId',
}

const opinionRecorded = createAction<Stat>(RecordOpinionActions.Record);
const updateOpinionId = createAction<Stat>(RecordOpinionActions.UpdateOpinionId);

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
      // I know this will make them click 2x, but its ok for this application to let the web calls catch up
      // so we have data integrity
      if (!beerDetail.opinion.id) {
        return;
      }

      dispatch(opinionRecorded(payload as Stat));

      await put(`/stats/${beerDetail.opinion.id}`, payload);
    } else {
      dispatch(opinionRecorded(payload as Stat));

      const response = await post<Stat>('/stats', payload);

      dispatch(updateOpinionId(response.data));
    }
  };
