import type {Beer} from '~/Types';

type Props = {
  beer: Beer;
};

export default function BeerItem({beer}: Props) {
  return (
    <div className="my-1.5 flex flex-row items-center rounded-l-full bg-yellow-300 px-1 py-1 text-black">
      <div className="mr-2 h-12 w-12 shrink-0 rounded-full bg-white"></div>
      <div className="flex grow flex-col">
        <div className="line-clamp-1 grow  text-xl">{beer.name}</div>
        <div className="flex flex-row justify-between">
          <div>{beer.style.name}</div>
          <div>{beer.abv}%</div>
        </div>
      </div>
    </div>
  );
}
