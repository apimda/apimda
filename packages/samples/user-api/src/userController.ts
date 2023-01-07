import { Body, Controller, Delete, Env, Get, HttpError, Patch, Path, Post, Put, Query, Tags } from '@apimda/runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { User, UserPatch, UserPost, UserPut, UserType, UUID } from './domain';

function key(userId: UUID) {
  return {
    pk: `user#${userId}`,
    sk: `user#`
  };
}

function toItem(user: User) {
  return {
    ...user,
    ...key(user.id),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

function fromItem(item: Record<string, any>): User {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    userType: item.userType,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt)
  };
}

/**
 * User Controller
 */
@Tags('users')
@Controller('/users')
export class UserController {
  private documentClient: DynamoDBDocument;

  constructor(
    @Env('TABLE_NAME') public tableName: string,
    public dynamoClient: DynamoDBClient = new DynamoDBClient({})
  ) {
    const config = { marshallOptions: { removeUndefinedValues: true } };
    this.documentClient = DynamoDBDocument.from(dynamoClient, config);
  }

  /**
   * Get all users in the system, with optional filter by user type
   * @summary Get all users
   * @param userType optional type of user to return
   * @return array of all users, filtered by user type if specified
   */
  @Get()
  async getUsers(@Query() userType?: UserType): Promise<User[]> {
    // don't scan in production...
    const res = await this.documentClient.scan({ TableName: this.tableName });
    return (res.Items || []).map(i => fromItem(i)).filter(u => (userType ? u.userType === userType : true));
  }

  /**
   * Get a user by ID
   * @summary Get user by ID
   * @param userId user identifier
   * @return user with specified ID
   */
  @Get('/{userId}')
  async getUser(@Path() userId: UUID): Promise<User> {
    return this.findUserOrThrow(userId);
  }

  /**
   * Create a new user
   * @summary Create user
   * @param user user to create
   * @return created user
   */
  @Post()
  async createUser(@Body() user: UserPost): Promise<User> {
    const date = new Date();
    const result: User = {
      ...user,
      id: randomUUID(),
      createdAt: date,
      updatedAt: date
    };
    await this.documentClient.put({
      TableName: this.tableName,
      Item: toItem(result)
    });
    return result;
  }

  /**
   * Replace (put) an existing user
   * @summary Put user
   * @param userId user identifier
   * @param user user to put
   * @return updated user
   */
  @Put('/{userId}')
  async putUser(@Path() userId: UUID, @Body() user: UserPut): Promise<User> {
    return await this.putOrPatchUser(userId, user);
  }

  /**
   * Patch an existing user
   * @summary Patch user
   * @param userId user identifier
   * @param user user to patch
   * @return updated user
   */
  @Patch('/{userId}')
  async patchUser(@Path() userId: UUID, @Body() user: UserPatch): Promise<User> {
    return await this.putOrPatchUser(userId, user);
  }

  /**
   * Delete a user
   * @summary Delete user
   * @param userId user identifier
   */
  @Delete('/{userId}')
  async deleteUser(@Path() userId: UUID) {
    await this.findUserOrThrow(userId);
    await this.documentClient.delete({
      TableName: this.tableName,
      Key: key(userId)
    });
  }

  private async findUserOrThrow(userId: UUID) {
    const res = await this.documentClient.get({
      TableName: this.tableName,
      Key: key(userId)
    });
    if (!res.Item) {
      throw new HttpError(404);
    }
    return fromItem(res.Item);
  }

  private async putOrPatchUser(userId: UUID, user: UserPut | UserPatch) {
    const existing = await this.findUserOrThrow(userId);
    const result: User = {
      ...existing,
      ...user,
      updatedAt: new Date()
    };
    await this.documentClient.put({
      TableName: this.tableName,
      Item: toItem(result)
    });
    return result;
  }
}
