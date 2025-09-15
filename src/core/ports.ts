/**
 * Application ports/interfaces for dependency injection.
 */

export type Username = string;

export type User = {
  id: string;
  username: Username;
  passwordHash: string;
  createdAt: string;
};

export type AddressInput = { postcode: string; suburb: string; state: string };
export type AddressValidation = {
  ok: boolean;
  message: string;
  coordinates?: { lat: number; lng: number };
};

/**
 * Interface for address validation.
 */
export interface AddressValidator {
  validate(input: AddressInput): Promise<AddressValidation>;
}

/**
 * Interface for logging verification attempts.
 */
export interface VerificationLogRepository {
  log(entry: {
    username: Username;
    input: AddressInput;
    result: "success" | "failure";
    error?: string;
    ts: string;
  }): Promise<void>;
}

/**
 * Interface for user repository.
 */
export interface UserRepository {
  findByUsername(username: Username): Promise<User | null>;
  create(user: User): Promise<User>;
}

export interface PasswordHasher {
  hash(raw: string): Promise<string>;
  verify(raw: string, hash: string): Promise<boolean>;
}

export interface SessionIssuer {
  issue(username: string): Promise<string>;
  verify(token: string): Promise<{ username: string } | null>;
  sign(claims: object, ttlSec?: number): Promise<string>;
}
