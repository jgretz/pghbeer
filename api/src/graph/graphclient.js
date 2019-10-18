import {Injectable} from '@nestjs/common';
import gremlin from 'gremlin';

import {AZURE_CONFIG} from '../constants';
import generateNewVariableName from './generateNewVariableName';

const client = () => {
  const authenticator = new gremlin.driver.auth.PlainTextSaslAuthenticator(
    `/dbs/${AZURE_CONFIG.database}/colls/${AZURE_CONFIG.collection}`,
    AZURE_CONFIG.primaryKey,
  );

  return new gremlin.driver.Client(AZURE_CONFIG.endpoint, {
    authenticator,
    traversalsource: 'g',
    rejectUnauthorized: true,
    mimeType: 'application/vnd.gremlin-v2.0+json',
  });
};

const PARTITION_KEY = 'partitionKey';

class V {
  constructor(initialize) {
    this.generateNewVariableName = generateNewVariableName();

    const setup = initialize(this.generateNewVariableName());

    this.statements = [setup.statement];
    this.arguments = setup.arguments;
  }

  // submit
  async submit() {
    const q = this.queryValues();
    const clientInstance = client();

    try {
      const results = await clientInstance.submit(q.statement, q.arguments);
      return results;
    } finally {
      clientInstance.close();
    }
  }

  // output
  queryValues() {
    return {
      statement: this.statements.join(''),
      arguments: this.arguments,
    };
  }

  // builder methods
  kvPairStatement(method, key, value) {
    const alias = this.generateNewVariableName();

    this.statements.push(`.${method}('${key}', ${alias})`);
    this.arguments[alias] = value;

    return this;
  }

  noParamMethodStatement(method) {
    this.statements.push(`.${method}()`);

    return this;
  }

  singleParamMethodStatement(method, value) {
    const alias = this.generateNewVariableName();

    this.statements.push(`.${method}(${alias})`);
    this.arguments[alias] = value;

    return this;
  }

  // add properties
  property(key, value) {
    return this.kvPairStatement('property', key, value);
  }

  multipleProperties(map) {
    Object.keys(map).forEach(key => {
      this.property(key, map[key]);
    });

    return this;
  }

  partition(key) {
    return this.property(PARTITION_KEY, key);
  }

  properties(property) {
    return property
      ? this.singleParamMethodStatement('properties', properties)
      : this.noParamMethodStatement('properties');
  }

  // add edge
  addE(relationship) {
    return this.singleParamMethodStatement('addE', relationship);
  }

  to(target) {
    if (target instanceof V) {
      const query = target.queryValues();

      this.statements.push(`.to(${query.statement})`);
      this.arguments = {
        ...this.arguments,
        ...query.arguments,
      };
    } else {
      const alias = this.generateNewVariableName();

      this.statements.push(`.to(g.V(${alias}))`);
      this.arguments[alias] = target;
    }

    return this;
  }

  // drop
  drop() {
    return this.noParamMethodStatement('drop');
  }

  // query / traverse
  has(key, value) {
    return this.kvPairStatement('has', key, value);
  }

  hasId(id) {
    return this.singleParamMethodStatement('hasId', id);
  }

  hasLabel(value) {
    return this.singleParamMethodStatement('hasLabel', value);
  }

  hasNot(key) {
    return this.singleParamMethodStatement('hasNot', key);
  }
}

@Injectable()
export default class GraphClient {
  addV(label) {
    return new V(alias => ({
      statement: `g.addV(${alias})`,
      arguments: {[alias]: label},
    }));
  }

  V(label) {
    const v = new V(() => ({
      statement: 'g.V()',
      arguments: {},
    }));

    return label ? v.hasLabel(label) : v;
  }
}
