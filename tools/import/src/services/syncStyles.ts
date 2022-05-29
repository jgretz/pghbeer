import _ = require('lodash');
import { DataSource, Repository } from 'typeorm';
import { Styles } from '../entities';
import { ImportItem } from '../Types';

const syncStyle =
  (repository: Repository<Styles>) =>
  async (name: string): Promise<Styles> => {
    const style = await repository.findOneBy({ name });

    if (style) {
      return style;
    }

    console.log(`Inserting Style Named: ${name}`);
    return await repository.save({
      name,
      create_date: new Date(),
      update_date: new Date(),
    });
  };

export const syncStyles = async (
  data: Array<ImportItem>,
  dataSource: DataSource,
) => {
  console.log('********************************');
  console.log('Synchronizing Styles');
  console.log('********************************');

  const repository = dataSource.getRepository(Styles);

  const allNames = data.map((x) => x.Style);
  const names = _.uniq(allNames);

  const requests = names.map((x) => syncStyle(repository)(x));
  const styles = await Promise.all(requests);

  return styles;
};
