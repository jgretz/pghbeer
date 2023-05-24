import type {Beer} from '~/Types';

type Props = {
  beer: Beer;
};

export default function BeerItem({beer}: Props) {
  return (
    <>
      <div>{beer.name}</div>
    </>
  );
}
