interface Props {
  searchTerm: string;
}

export function Empty({searchTerm}: Props) {
  return (
    <div className="container flex h-full flex-col flex-wrap items-center justify-center text-2xl">
      <div className="mb-3 mt-10">No beers matched search term:</div>
      <div className="font-bold">{searchTerm}</div>
    </div>
  );
}
