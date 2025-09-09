import { jwtSession } from '../src/infrastructure/security/jwtSession';

describe('jwtSession', () => {
  const secret = 'test-secret';
  const session = jwtSession(secret);

  it('issues and verifies a JWT', async () => {
    const token = await session.issue('alice');
    const verified = await session.verify(token);
    expect(verified).toEqual({ username: 'alice' });
  });

  it('returns null for invalid token', async () => {
    const verified = await session.verify('not-a-real-token');
    expect(verified).toBeNull();
  });
});
