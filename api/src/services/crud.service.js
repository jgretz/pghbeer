import {GraphClient} from '../graph';

export default class CrudService {
  constructor(graphClient, label, partitionKey) {
    this.g = graphClient;
    this.label = label;
    this.partitionKey = partitionKey;
  }

  async findById(id) {
    return await this.g
      .V(this.label)
      .hasId(id)
      .submit();
  }

  async findAll() {
    return await this.g.V(this.label).submit();
  }

  async create(obj) {
    return await this.g
      .addV(this.label)
      .partition(this.partitionKey)
      .multipleProperties(obj)
      .submit();
  }

  async update(id, obj) {
    return await this.g
      .V(this.label)
      .hasId(id)
      .multipleProperties(obj)
      .submit();
  }

  async remove(id) {
    return await this.g
      .V(this.label)
      .hasId(id)
      .drop()
      .submit();
  }
}
