import { LocalDynamoV3 } from 'ts-local-dynamo/dist/v3';
import { UserApiStack } from './deploy/userApiStack';
import { UserType } from './domain';
import { cdkToDynamo, CreateTableCdk } from './dynamoTestUtils';
import { UserController } from './userController';

let dynamo: LocalDynamoV3;
let controller: UserController;

beforeAll(async () => {
  const tableName = 'users';
  const usersTable: CreateTableCdk = {
    tableProps: {
      tableName,
      ...UserApiStack.userTableProps
    }
  };
  dynamo = await LocalDynamoV3.start({ tables: [cdkToDynamo(usersTable)] });
  controller = new UserController(tableName, dynamo.newClient());
});

beforeEach(async () => {
  if (dynamo) await dynamo.recreateTables();
});

afterAll(() => {
  if (dynamo) dynamo.stop();
});

function newUser(userType: UserType = UserType.USER) {
  return {
    name: 'name',
    email: 'email@test.com',
    userType
  };
}

test('GET /users', async () => {
  const userOne = await controller.createUser(newUser());
  const userTwo = await controller.createUser(newUser());
  const admin = await controller.createUser(newUser(UserType.ADMIN));

  const all = await controller.getUsers();
  expect(all.map(u => u.id).sort()).toEqual([userOne, userTwo, admin].map(u => u.id).sort());

  const users = await controller.getUsers(UserType.USER);
  expect(users.map(u => u.id).sort()).toEqual([userOne, userTwo].map(u => u.id).sort());

  const admins = await controller.getUsers(UserType.ADMIN);
  expect(admins.map(u => u.id).sort()).toEqual([admin].map(u => u.id).sort());
});

test('POST /users', async () => {
  const post = newUser();
  const res = await controller.createUser(post);
  expect(res.id).toBeDefined();
  expect(res.name).toBe(post.name);
  expect(res.email).toBe(post.email);
  expect(res.userType).toBe(post.userType);
  expect(res.createdAt).toBeDefined();
  expect(res.updatedAt).toBeDefined();
});

test('GET /users/{userId}', async () => {
  const user = await controller.createUser(newUser());
  const res = await controller.getUser(user.id);
  expect(res).toStrictEqual(user);
});

test('PUT /users/{userId}', async () => {
  const user = await controller.createUser(newUser());
  const put = {
    name: undefined,
    email: 'new@email.com',
    userType: UserType.ADMIN
  };
  const res = await controller.putUser(user.id, put);
  expect(res.id).toBe(user.id);
  expect(res.name).toBe(put.name);
  expect(res.email).toBe(put.email);
  expect(res.userType).toBe(put.userType);
  expect(res.createdAt).toEqual(user.createdAt);
  expect(res.updatedAt.valueOf()).toBeGreaterThanOrEqual(user.updatedAt.valueOf());
});

test('PATCH /users/{userId}', async () => {
  const user = await controller.createUser(newUser());
  const patch = {
    email: 'new@email.com'
  };
  const res = await controller.patchUser(user.id, patch);
  expect(res.id).toBe(user.id);
  expect(res.name).toBe(user.name);
  expect(res.email).toBe(patch.email);
  expect(res.userType).toBe(user.userType);
  expect(res.createdAt).toEqual(user.createdAt);
  expect(res.updatedAt.valueOf()).toBeGreaterThanOrEqual(user.updatedAt.valueOf());
});

test('DELETE /users/{userId}', async () => {
  const user = await controller.createUser(newUser());
  await controller.deleteUser(user.id);
  expect(await controller.getUsers()).toHaveLength(0);
});
