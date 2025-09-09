import { makeVerifyAddress } from '../src/application/verifyAddress';
import type { AddressValidator, VerificationLogRepository } from '../src/core/ports';

const okValidator: AddressValidator = {
  async validate() { return { ok: true, message: 'ok' }; }
};
const badValidator: AddressValidator = {
  async validate() { return { ok: false, message: 'nope' }; }
};

describe('verifyAddress use-case', () => {
  it('logs success', async () => {
    const logs: any[] = [];
    const repo: VerificationLogRepository = { async log(e){ logs.push(e);} };
    const verify = makeVerifyAddress({ validator: okValidator, logs: repo });

    const res = await verify('alice', { postcode:'2000', suburb:'Sydney', state:'NSW' });
    expect(res.ok).toBe(true);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ username:'alice', result:'success' });
  });

  it('logs failure with error', async () => {
    const logs: any[] = [];
    const repo: VerificationLogRepository = { async log(e){ logs.push(e);} };
    const verify = makeVerifyAddress({ validator: badValidator, logs: repo });

    const res = await verify('bob', { postcode:'9999', suburb:'X', state:'NSW' });
    expect(res.ok).toBe(false);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ username:'bob', result:'failure', error:'nope' });
  });
});
