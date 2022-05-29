import _ = require('lodash');
import { DataSource, Repository } from 'typeorm';
import { Beers, Breweries, Styles } from '../entities';
import { ImportItem } from '../Types';

const syncBeer =
  (
    repository: Repository<Beers>,
    breweries: Array<Breweries>,
    styles: Array<Styles>,
  ) =>
  async (importItem: ImportItem): Promise<Beers> => {
    const brewery = _.find(breweries, (b) => b.name === importItem.Brewery);
    const style = _.find(styles, (s) => s.name === importItem.Style);

    const beer = await repository.findOneBy({
      name: importItem.Beer,
      brewery_id: brewery.id,
    });

    if (beer) {
      return beer;
    }

    console.log(
      `Inserting Beer Named: ${importItem.Beer} from ${importItem.Brewery}`,
    );

    return await repository.save({
      name: importItem.Beer,
      abv: importItem.ABV,
      brewery_id: brewery.id,
      style_id: style.id,
      create_date: new Date(),
      update_date: new Date(),
    });
  };

export const syncBeers = async (
  data: Array<ImportItem>,
  dataSource: DataSource,
  breweries: Array<Breweries>,
  styles: Array<Styles>,
) => {
  console.log('********************************');
  console.log('Synchronizing Beers');
  console.log('********************************');

  const repository = dataSource.getRepository(Beers);

  const requests = data.map((x) => syncBeer(repository, breweries, styles)(x));
  const beers = await Promise.all(requests);

  return beers;
};
