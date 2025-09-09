import { makeRegister } from '../src/application/register';
import { makeLogin } from '../src/application/login';
import type { PasswordHasher, SessionIssuer, User, UserRepository } from '../src/core/ports';

function memUsers(): UserRepository {
  const m = new Map<string, User>();
  return {
    async findByUsername(u) { return m.get(u) ?? null; },
    async create(user) { m.set(user.username, user); }
  };
}

const fakeHasher: PasswordHasher = {
  async hash(raw) { return 'h:'+raw; },
  async verify(raw, hash) { return hash === 'h:'+raw; },
};

const fakeSession: SessionIssuer = {
  async issue(u) { return 't:'+u; },
  async verify(t) { return t.startsWith('t:') ? { username: t.slice(2) } : null; },
};

describe('register/login use-cases', () => {
  it('registers new user and logs in', async () => {
    const users = memUsers();
    const register = makeRegister({ users, hasher: fakeHasher, session: fakeSession });
    const login = makeLogin({ users, hasher: fakeHasher, session: fakeSession });

    await register('alice', 'pw');
    const { token } = await login('alice', 'pw');
    expect(token).toBe('t:alice');
  });

  it('prevents duplicate usernames', async () => {
    const users = memUsers();
    const register = makeRegister({ users, hasher: fakeHasher, session: fakeSession });
    await register('bob', 'pw');
    await expect(register('bob', 'pw2')).rejects.toThrow(/taken/i);
  });

  it('rejects invalid credentials', async () => {
    const users = memUsers();
    const register = makeRegister({ users, hasher: fakeHasher, session: fakeSession });
    const login = makeLogin({ users, hasher: fakeHasher, session: fakeSession });

    await register('chris', 'secret');
    await expect(login('chris', 'bad')).rejects.toThrow(/invalid/i);
    await expect(login('nobody', 'pw')).rejects.toThrow(/invalid/i);
  });
});
