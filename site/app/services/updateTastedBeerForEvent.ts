import {STATS_URL} from '~/constants';

export async function updateTastedBeerForEvent(
  beerId: number,
  eventId: number,
  userId: string,
  tasted: boolean,
) {
  await fetch(STATS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      beerId,
      eventId,
      userId,
      tasted,
    }),
  });
}
