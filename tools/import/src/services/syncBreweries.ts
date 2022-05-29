import _ = require('lodash');
import { DataSource, Repository } from 'typeorm';
import { Breweries } from '../entities';
import { ImportItem } from '../Types';

const syncBrewery =
  (repository: Repository<Breweries>) =>
  async (name: string): Promise<Breweries> => {
    const brewery = await repository.findOneBy({ name });

    if (brewery) {
      return brewery;
    }

    console.log(`Inserting Brewery Named: ${name}`);
    return await repository.save({
      name,
      create_date: new Date(),
      update_date: new Date(),
    });
  };

export const syncBreweries = async (
  data: Array<ImportItem>,
  dataSource: DataSource,
) => {
  console.log('********************************');
  console.log('Synchronizing Breweries');
  console.log('********************************');

  const repository = dataSource.getRepository(Breweries);

  const allNames = data.map((x) => x.Brewery);
  const names = _.uniq(allNames);

  const requests = names.map((x) => syncBrewery(repository)(x));
  const breweries = await Promise.all(requests);

  return breweries;
};
