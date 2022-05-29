import _ = require('lodash');
import { DataSource, Repository } from 'typeorm';
import { Eventbeerlist, Beers, Breweries } from '../entities';
import { ImportItem } from '../Types';

const syncEventBeerListItem =
  (
    repository: Repository<Eventbeerlist>,
    beers: Array<Beers>,
    breweries: Array<Breweries>,
  ) =>
  async (importItem: ImportItem): Promise<Eventbeerlist> => {
    const brewery = _.find(breweries, (b) => b.name === importItem.Brewery);
    const beer = _.find(
      beers,
      (b) => b.name === importItem.Beer && b.brewery_id === brewery.id,
    );

    const eventItem = await repository.findOneBy({
      event_id: importItem.Event,
      beer_id: beer.id,
    });

    if (eventItem) {
      return eventItem;
    }

    console.log(
      `Inserting Event Beer List Item For: ${beer.name} at ${importItem.Event}`,
    );

    return await repository.save({
      event_id: importItem.Event,
      beer_id: beer.id,
      create_date: new Date(),
      update_date: new Date(),
    });
  };

export const syncEventBeerListItems = async (
  data: Array<ImportItem>,
  dataSource: DataSource,
  beers: Array<Beers>,
  breweries: Array<Breweries>,
) => {
  console.log('********************************');
  console.log('Synchronizing Event Beer List Items');
  console.log('********************************');

  const repository = dataSource.getRepository(Eventbeerlist);

  const requests = data.map((x) =>
    syncEventBeerListItem(repository, beers, breweries)(x),
  );
  const eventBeerListItems = await Promise.all(requests);

  return eventBeerListItems;
};
