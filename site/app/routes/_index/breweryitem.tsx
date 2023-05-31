import type {Beer} from '~/Types';
import BeerItem from './beeritem';

type Props = {
  name: string;
  beers: Beer[];
};

export default function BreweryItem({name, beers}: Props) {
  const scrollProps = {name: name.substring(0, 1)};

  return (
    <div className="pt-0.5">
      <h1 className="line-clamp-1 text-3xl" {...scrollProps}>
        {name}
      </h1>
      <div>
        {beers.map(function (b) {
          return <BeerItem key={b.id} beer={b} />;
        })}
      </div>
    </div>
  );
}
