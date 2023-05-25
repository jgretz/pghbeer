import banner from '../../images/botb_long.jpg';

export default function Header() {
  return (
    <div
      className="container h-28 w-full bg-cover bg-clip-border bg-center bg-no-repeat"
      style={{backgroundImage: `url("${banner}")`}}
    ></div>
  );
}
