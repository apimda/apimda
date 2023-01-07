/**
 * UUID v4
 * See [RFC 4112](https://tools.ietf.org/html/rfc4122)
 * @format uuid
 * @examples ["52907745-7672-470e-a803-a2f8feb52944"]
 */
export type UUID = string;

/**
 * Generic database entity information.
 */
export interface DomainEntity {
  /**
   * Entity identifier
   */
  id: UUID;

  /**
   * Timestamp entity was created
   */
  createdAt: Date;

  /**
   * Timestamp entity was last updated
   */
  updatedAt: Date;
}

/**
 * User information
 */
export interface User extends DomainEntity {
  /**
   * Full name
   */
  name?: string;

  /**
   * Email address
   * @format email
   */
  email: string;

  /**
   * User type
   */
  userType: UserType;
}

/**
 * User type enum
 */
export enum UserType {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

/**
 * Request body for POST requests
 */
export type UserPost = Omit<User, keyof DomainEntity>;

/**
 * Request body for PUT requests
 */
export type UserPut = Omit<User, keyof DomainEntity>;

/**
 * Request body for PATCH requests
 */
export type UserPatch = Partial<Omit<User, keyof DomainEntity>>;
