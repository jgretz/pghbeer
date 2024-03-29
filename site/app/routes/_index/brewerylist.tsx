import type {Beer} from '~/Types';
import BreweryItem from './breweryitem';

type Props = {
  breweries: string[];
  data: Record<string, Beer[]>;
};

export default function BreweryList({breweries, data}: Props) {
  return (
    <div className="container m-auto max-w-lg pl-0.5 pt-0.5">
      {breweries.map(function (k) {
        return <BreweryItem key={k} name={k} beers={data[k]} />;
      })}
    </div>
  );
}
