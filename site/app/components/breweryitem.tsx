import type {Beer} from '~/Types';
import BeerItem from './beeritem';

type Props = {
  name: string;
  beers: Beer[];
};

export default function BreweryItem({name, beers}: Props) {
  return (
    <div className="pt-0.5">
      <h1 className="line-clamp-1 text-3xl">{name}</h1>
      <div>
        {beers.map(function (b) {
          return <BeerItem key={b.id} beer={b} />;
        })}
      </div>
    </div>
  );
}
