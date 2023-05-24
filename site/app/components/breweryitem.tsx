import type {Beer} from '~/Types';
import BeerItem from './beeritem';

type Props = {
  name: string;
  beers: Beer[];
};

export default function BreweryItem({name, beers}: Props) {
  return (
    <>
      <h1>{name}</h1>
      <div>
        {beers.map(function (b) {
          return <BeerItem key={b.id} beer={b} />;
        })}
      </div>
    </>
  );
}
