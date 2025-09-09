import { User, UserRepository } from "../../core/ports";

const mem = new Map<string, User>();

export function memoryUserRepository(): UserRepository {
  return {
    async findByUsername(username) { return mem.get(username) ?? null; },
    async create(user) { mem.set(user.username, user); },
  };
}
