import type {Beer} from '~/Types';
import {EVENT_ID} from '~/constants';
import {loadDataForEvent} from '~/services';
import BreweryItem from './breweryitem';

type Props = {
  breweries: string[];
  data: Record<string, Beer[]>;
};

export async function loader() {
  console.log('foo');
  return await loadDataForEvent(EVENT_ID);
}

export default function BreweryList({breweries, data}: Props) {
  return (
    <div>
      {breweries.map(function (k) {
        return <BreweryItem key={k} name={k} beers={data[k]} />;
      })}
    </div>
  );
}
