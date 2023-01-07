import { Schema } from 'ts-json-schema-generator';
import { SchemaCreator, SchemaRepository } from './schemas';

let schemaRepository: SchemaRepository;

const propAsSchema = (schema: Schema, propName: string): Schema => {
  return schema.properties![propName] as Schema;
};

describe('Using user sample project', () => {
  beforeAll(() => {
    const creator = SchemaCreator.fromTsConfig(require.resolve('@apimda/samples-user-api/tsconfig.json'));
    creator.add('user_param', 'User');
    schemaRepository = creator.result;
  });

  test('user and all dependent schema generation', () => {
    const schemas = schemaRepository.copy();
    expect(Object.keys(schemas).length).toBe(4);

    const userParamSchema = schemas['user_param'];
    expect(userParamSchema.$ref).toBe('User');

    const userTypeSchema = schemas['UserType'];
    expect(userTypeSchema.type).toBe('string');
    expect(userTypeSchema.enum).toStrictEqual(['ADMIN', 'USER']);
    expect(userTypeSchema.description).toBeDefined();

    const uuidSchema = schemas['UUID'];
    expect(uuidSchema.type).toBe('string');
    expect(uuidSchema.description).toBeDefined();
    expect(uuidSchema.format).toBe('uuid');
    expect(uuidSchema.examples).toStrictEqual(['52907745-7672-470e-a803-a2f8feb52944']);

    const userSchema = schemas['User'];
    expect(userSchema.type).toBe('object');
    expect(Object.keys(userSchema.properties!)).toHaveLength(6);
    expect(userSchema.additionalProperties).toBe(false);
    expect(userSchema.description).toBeDefined();

    const idProp = propAsSchema(userSchema, 'id');
    expect(idProp.$ref).toBe('UUID');
    expect(idProp.description).toBeDefined();

    const createdAtProp = propAsSchema(userSchema, 'createdAt');
    const updatedAtProp = propAsSchema(userSchema, 'updatedAt');
    for (const dateProp of [createdAtProp, updatedAtProp]) {
      expect(dateProp.type).toBe('string');
      expect(dateProp.format).toBe('date-time');
      expect(dateProp.description).toBeDefined();
    }

    const nameProp = propAsSchema(userSchema, 'name');
    expect(nameProp.type).toBe('string');
    expect(nameProp.description).toBeDefined();

    const emailProp = propAsSchema(userSchema, 'email');
    expect(emailProp.type).toBe('string');
    expect(emailProp.description).toBeDefined();
    expect(emailProp.format).toBe('email');

    const userTypeProp = propAsSchema(userSchema, 'userType');
    expect(userTypeProp.$ref).toBe('UserType');
    expect(userTypeProp.description).toBeDefined();
  });

  test('reference replace function', () => {
    const schemas = schemaRepository.copy(r => '#/components/schemas/' + r);
    expect(schemas['user_param'].$ref).toBe('#/components/schemas/User');
    const userSchema = schemas['User'];
    expect(propAsSchema(userSchema, 'id').$ref).toBe('#/components/schemas/UUID');
    expect(propAsSchema(userSchema, 'userType').$ref).toBe('#/components/schemas/UserType');
  });

  test('only provide schemas needed for specified keys', () => {
    const schemas = schemaRepository.copy(undefined, ['UserType']);
    expect(Object.keys(schemas).length).toBe(1);
    expect(schemas['UserType']).toBeDefined();
  });

  test('remove doc fields', () => {
    const verify = (schema: Schema) => {
      expect(schema.description).toBeUndefined();
      expect(schema.examples).toBeUndefined();
    };
    const schemas = schemaRepository.copy(undefined, undefined, true);
    const userSchema = schemas['User'];
    verify(userSchema);
    for (const propKey in userSchema.properties) {
      const propSchema = userSchema.properties[propKey];
      if (typeof propSchema !== 'boolean') {
        verify(propSchema);
      }
    }
  });
});

describe('Using apimda runtime project', () => {
  beforeAll(() => {
    const creator = SchemaCreator.fromTsConfig(require.resolve('@apimda/runtime/tsconfig.json'));
    creator.add('http_status_code_param', 'HttpStatusCode');
    schemaRepository = creator.result;
  });

  test('sub scheme reference replace function', () => {
    const schemas = schemaRepository.copy(r => '#/components/schemas/' + r);
    const httpStatusCodeSchema = schemas['HttpStatusCode'];

    expect(httpStatusCodeSchema.anyOf).toBeDefined();
    expect(httpStatusCodeSchema.anyOf).toHaveLength(4);
    expect(httpStatusCodeSchema.anyOf).toContainEqual({ $ref: '#/components/schemas/HttpInfoStatusCode' });
    expect(httpStatusCodeSchema.anyOf).toContainEqual({ $ref: '#/components/schemas/HttpSuccessStatusCode' });
    expect(httpStatusCodeSchema.anyOf).toContainEqual({ $ref: '#/components/schemas/HttpRedirectStatusCode' });
    expect(httpStatusCodeSchema.anyOf).toContainEqual({ $ref: '#/components/schemas/HttpErrorStatusCode' });
  });
});
