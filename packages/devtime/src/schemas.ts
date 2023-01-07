import { deepStrictEqual } from 'assert';
import { JSONSchema7Definition } from 'json-schema';
import { createGenerator, Schema, SchemaGenerator } from 'ts-json-schema-generator';
import { toRecord } from './utils';

const primitives = new Map<string, Schema>([
  ['string', { type: 'string' }],
  ['number', { type: 'number' }],
  ['boolean', { type: 'boolean' }],
  ['Date', { type: 'string', format: 'date-time' }]
]);

function extractArrayItemType(symbol: string): string | undefined {
  if (symbol.endsWith('[]')) {
    return symbol.substring(0, symbol.length - 2);
  }
  const genericArrayPrefixes = ['Array<', 'Set<', 'Iterable<', 'IterableIterator<']; // these serialize as JSON arrays
  const genericPrefix = genericArrayPrefixes.find(p => symbol.startsWith(p));
  if (genericPrefix) {
    return symbol.substring(genericPrefix.length, symbol.length - 1); // remove Set<>
  }
  return undefined;
}

type SchemaVisitor = (schema: Schema) => void;

function visitSchemas(schema: Schema, visitor: SchemaVisitor) {
  visitor(schema);
  const visitDef = (def: JSONSchema7Definition) => {
    if (typeof def !== 'boolean') {
      visitSchemas(def, visitor);
    }
  };

  const subSchemas = schema.anyOf ?? schema.allOf ?? schema.oneOf;

  if (subSchemas) {
    for (const subSchemeItem of subSchemas) {
      visitDef(subSchemeItem);
    }
  }

  if (schema.properties) {
    for (const propKey in schema.properties) {
      visitDef(schema.properties[propKey]);
    }
  }
  if (schema.items) {
    if (Array.isArray(schema.items)) {
      for (const itemSchema of schema.items) {
        visitDef(itemSchema);
      }
    } else {
      visitDef(schema.items);
    }
  }
}

export type RefUpdateFunction = (refVal: string) => string;

function updateRefs(schemas: Record<string, Schema>, updateFn: RefUpdateFunction) {
  for (const key in schemas) {
    visitSchemas(schemas[key], s => {
      if (s.$ref) {
        s.$ref = updateFn(s.$ref);
      }
    });
  }
}

function stripDocFields(schemas: Record<string, Schema>) {
  for (const key in schemas) {
    visitSchemas(schemas[key], s => {
      delete s.description;
      delete s.examples;
    });
  }
}

function findRefs(schema: Schema): string[] {
  const result: string[] = [];
  visitSchemas(schema, s => {
    if (s.$ref) {
      result.push(s.$ref);
    }
  });
  return result;
}

/**
 * Generates schemas for arrays, primitives, and custom types.
 */
export class SchemaCreator {
  private readonly schemaMap = new Map<string, Schema>();

  public static fromTsConfig(tsconfig: string) {
    const generator = createGenerator({
      tsconfig: tsconfig,
      type: '*',
      skipTypeCheck: false
    });
    return new SchemaCreator(generator);
  }

  constructor(private readonly generator: SchemaGenerator) {}

  private addSchema(key: string, schema: Schema) {
    const existing = this.schemaMap.get(key);
    if (existing) {
      deepStrictEqual(schema, existing);
    } else {
      this.schemaMap.set(key, schema);
    }
  }

  private generate(symbol: string): Schema {
    const arrayItemType = extractArrayItemType(symbol);
    if (arrayItemType) {
      if (arrayItemType === '') {
        return { type: 'array' };
      }
      const itemSchema = this.generate(arrayItemType);
      return { type: 'array', items: itemSchema };
    }
    if (primitives.has(symbol)) {
      return primitives.get(symbol)!;
    }
    const schema = this.generator.createSchema(symbol);

    for (const refKey in schema.definitions) {
      const refSchema = schema.definitions[refKey];
      if (typeof refSchema === 'boolean') {
        throw new Error('Boolean schema definition makes no sense?');
      }
      this.addSchema(refKey, refSchema);
    }
    delete schema['definitions'];
    delete schema['$schema'];
    return schema;
  }

  public add(key: string, symbol: string) {
    this.addSchema(key, this.generate(symbol));
  }

  public get result(): SchemaRepository {
    const schemasById = JSON.parse(JSON.stringify(toRecord(this.schemaMap))) as Record<string, Schema>;
    const defPrefixLen = '#/definitions/'.length;
    updateRefs(schemasById, r => r.substring(defPrefixLen));
    return new SchemaRepository(schemasById);
  }
}

/**
 * Repository of schemas, providing only copies (along with ability to update $ref values) to users.
 */
export class SchemaRepository {
  constructor(private readonly schemasById: Record<string, Schema>) {}

  /**
   * Get a deep copy of schemas by their ID, optionally running the specified function to update $ref values and
   * returning only schemas required for the specified keys.
   */
  copy(refUpdateFn?: RefUpdateFunction, keys?: string[], stripDocs?: boolean): Record<string, Schema> {
    const result = JSON.parse(JSON.stringify(this.schemasById)) as Record<string, Schema>;
    for (const key in result) {
      // transforming from/to JSON (to do deep copy) will undo URI encoding that the schema generator does
      const encoded = encodeURIComponent(key);
      if (encoded !== key) {
        result[encoded] = result[key];
        delete result[key];
      }
    }

    if (refUpdateFn) {
      updateRefs(result, refUpdateFn);
    }
    if (stripDocs) {
      stripDocFields(result);
    }
    if (keys) {
      const queue = new Array(...keys);
      const requiredKeys = new Set<string>();
      while (queue.length > 0) {
        const key = queue.pop()!;
        if (!requiredKeys.has(key)) {
          requiredKeys.add(key);
          queue.push(...findRefs(result[key]));
        }
      }
      for (const key in result) {
        if (!requiredKeys.has(key)) {
          delete result[key];
        }
      }
    }
    return result;
  }
}
