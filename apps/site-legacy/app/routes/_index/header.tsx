import banner from '../../images/botb_logo.png';

export default function Header() {
  return (
    <div className="container m-auto flex h-28 w-full max-w-lg items-center justify-center">
      <img src={banner} alt="beers of the burgh logo" className="h-[120px]" height={120} />
    </div>
  );
}
