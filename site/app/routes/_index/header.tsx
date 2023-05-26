import banner from '../../images/botb_long.jpg';

export default function Header() {
  return (
    <div
      className="container m-auto h-28 w-full max-w-lg bg-cover bg-clip-border bg-center bg-no-repeat"
      style={{backgroundImage: `url("${banner}")`}}
    ></div>
  );
}
