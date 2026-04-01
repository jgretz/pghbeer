import {useCallback} from 'react';
import type {Beer} from '~/Types';
import {EVENT_ID} from '~/constants';
import {useStateWthLocalStorage} from '~/hooks/useStateWithLocalStorage';
import {useUserId} from '~/hooks/useUserId';
import {updateTastedBeerForEvent} from '~/services/updateTastedBeerForEvent';

type Props = {
  beer: Beer;
};

const TASTED_BEERS = 'TASTED_BEERS';

export default function Checkmark({beer}: Props) {
  // get the current userId
  const userId = useUserId();

  // tasted beer
  const [tastedBeers, setTastedBeers] = useStateWthLocalStorage(TASTED_BEERS, '');
  const tastedBeersArray = tastedBeers.split(',').map((id) => parseInt(id, 10));

  const handleCheckmarkTouch = useCallback(
    function () {
      if (tastedBeersArray.includes(beer.id)) {
        tastedBeersArray.splice(tastedBeersArray.indexOf(beer.id), 1);
        updateTastedBeerForEvent(beer.id, EVENT_ID, userId, false);
      } else {
        tastedBeersArray.push(beer.id);
        updateTastedBeerForEvent(beer.id, EVENT_ID, userId, true);
      }

      setTastedBeers(tastedBeersArray.join(','));
    },
    [tastedBeersArray, beer.id, setTastedBeers, userId],
  );

  const hasBeerBeenTasted = tastedBeersArray.includes(beer.id);
  const checkmark = hasBeerBeenTasted ? <div className="checkmark" /> : null;

  return (
    <div
      className="mr-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"
      onClick={handleCheckmarkTouch}
    >
      {checkmark}
    </div>
  );
}
