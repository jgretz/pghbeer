import type {Beer} from '~/Types';
import BreweryItem from './breweryitem';

type Props = {
  breweries: string[];
  data: Record<string, Beer[]>;
};

export default function BreweryList({breweries, data}: Props) {
  return (
    <div className="m-auto max-w-lg p-0.5">
      {breweries.map(function (k) {
        return <BreweryItem key={k} name={k} beers={data[k]} />;
      })}
    </div>
  );
}
