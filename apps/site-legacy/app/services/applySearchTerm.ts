import type {Beer, IndexLoaderData} from '~/Types';

export function applySearchTerm(searchTerm: string, listData: IndexLoaderData): IndexLoaderData {
  const term = searchTerm.toUpperCase();

  const data = listData.breweries.reduce((acc, brewery) => {
    const beers = listData.data[brewery].filter(
      (beer) =>
        beer.brewery.name.toUpperCase().includes(term) ||
        beer.name.toUpperCase().includes(term) ||
        beer.style.name.toUpperCase().includes(term),
    );

    if (beers.length > 0) {
      acc[brewery] = beers;
    }

    return acc;
  }, {} as Record<string, Beer[]>);

  return {
    breweries: Object.keys(data),
    data,
  };
}
