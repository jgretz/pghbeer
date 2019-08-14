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

    return await client().submit(q.statement, q.arguments);
  }

  // output
  queryValues() {
    return {
      statement: this.statements.join(''),
      arguments: this.arguments,
    };
  }

  // builder methods
  addKVStatement(method, key, value) {
    const alias = this.generateNewVariableName();

    this.statements.push(`.${method}('${key}', ${alias})`);
    this.arguments[alias] = value;

    return this;
  }

  addMethodStatement(method, value) {
    const alias = this.generateNewVariableName();

    this.statements.push(`.${method}(${alias})`);
    this.arguments[alias] = value;

    return this;
  }

  // add properties
  addProperty(key, value) {
    return this.addKVStatement('property', key, value);
  }

  partition(key) {
    return this.addProperty(PARTITION_KEY, key);
  }

  addProperties(map) {
    Object.keys(map).forEach(key => {
      this.addProperty(key, map[key]);
    });

    return this;
  }

  // add edge
  addE(relationship) {
    return this.addMethodStatement('addE', relationship);
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

  // query / traverse
  has(key, value) {
    return this.addKVStatement('has', key, value);
  }

  hasLabel(value) {
    return this.addMethodStatement('hasLabel', value);
  }

  hasNot(key) {
    return this.addMethodStatement('hasNot', key);
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
