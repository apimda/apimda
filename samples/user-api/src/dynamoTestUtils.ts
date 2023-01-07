import {
  AttributeDefinition,
  CreateTableInput,
  GlobalSecondaryIndex,
  KeySchemaElement,
  LocalSecondaryIndex,
  Projection,
  ProvisionedThroughput
} from '@aws-sdk/client-dynamodb';
import {
  Attribute,
  GlobalSecondaryIndexProps,
  LocalSecondaryIndexProps,
  SecondaryIndexProps,
  TableProps
} from 'aws-cdk-lib/aws-dynamodb';

function attToDynamo(att: Attribute): AttributeDefinition {
  return {
    AttributeName: att.name,
    AttributeType: att.type
  };
}

function siToDynamo(si: SecondaryIndexProps): Projection {
  return {
    ProjectionType: si.projectionType,
    NonKeyAttributes: si.nonKeyAttributes
  };
}

type CdkProvisionedThroughput = {
  writeCapacity?: number;
  readCapacity?: number;
};

function throughputToDynamo(pt: CdkProvisionedThroughput): ProvisionedThroughput {
  return {
    WriteCapacityUnits: pt.writeCapacity || 1,
    ReadCapacityUnits: pt.readCapacity || 1
  };
}

type CdkKeys = {
  partitionKey?: Attribute;
  sortKey?: Attribute;
};

/**
 * Makes tableName required in TableProps.  It's recommended to let CDK create the tableName, so this property shouldn't
 * usually be defined in your CDK code.  But it is needed in dynamo client CreateTableInput, so we make it mandatory.
 */
export interface CreateTableProps extends TableProps {
  tableName: string;
}

/**
 * Represents data needed from CDK props to construct CreateTableInput for use with dynamo client.
 */
export interface CreateTableCdk {
  tableProps: CreateTableProps;
  globalSecondaryIndexes?: GlobalSecondaryIndexProps[];
  localSecondaryIndexes?: LocalSecondaryIndexProps[];
}

/**
 * Transform CDK dynamo props into CreateTableInput for use with dynamo client.
 */
export function cdkToDynamo(cdk: CreateTableCdk): CreateTableInput {
  const attributes: Attribute[] = [];

  function keysToDynamo(keys: CdkKeys): KeySchemaElement[] {
    const result: KeySchemaElement[] = [];

    if (keys.partitionKey) {
      attributes.push(keys.partitionKey);
      result.push({
        KeyType: 'HASH',
        AttributeName: keys.partitionKey.name
      });
    }
    if (keys.sortKey) {
      attributes.push(keys.sortKey);
      result.push({
        KeyType: 'RANGE',
        AttributeName: keys.sortKey.name
      });
    }
    return result;
  }

  function gsiToDynamo(gsi: GlobalSecondaryIndexProps): GlobalSecondaryIndex {
    return {
      IndexName: gsi.indexName,
      KeySchema: keysToDynamo(gsi),
      Projection: siToDynamo(gsi),
      ProvisionedThroughput: throughputToDynamo(gsi)
    };
  }

  function lsiToDynamo(gsi: LocalSecondaryIndexProps): LocalSecondaryIndex {
    return {
      IndexName: gsi.indexName,
      KeySchema: keysToDynamo(gsi),
      Projection: siToDynamo(gsi)
    };
  }

  const keySchema = keysToDynamo(cdk.tableProps);
  const gsiArray = cdk.globalSecondaryIndexes?.map(gsiToDynamo);
  const lsiArray = cdk.localSecondaryIndexes?.map(lsiToDynamo);

  return {
    TableName: cdk.tableProps.tableName,
    KeySchema: keySchema,
    AttributeDefinitions: attributes.map(a => attToDynamo(a)),
    ProvisionedThroughput: throughputToDynamo(cdk.tableProps),
    GlobalSecondaryIndexes: gsiArray,
    LocalSecondaryIndexes: lsiArray
  };
}
