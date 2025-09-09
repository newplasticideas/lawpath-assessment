import { graphql } from 'graphql';
import { makeSchema } from '../app/api/verify/graphql/schema';

// Tiny fake use-case: echoes args and enforces simple rule
function fakeVerify(username: string, args: { postcode: string; suburb: string; state: string }) {
  if (!username) throw new Error('no auth');
  if (!/^\d{4}$/.test(args.postcode)) return Promise.resolve({ ok:false, message: 'Postcode must be 4 digits.' });
  return Promise.resolve({ ok:true, message:'ok' });
}

describe('GraphQL validate schema', () => {
  const schema = makeSchema(fakeVerify as any);

  it('returns validation error message', async () => {
    const query = `query($pc:String!,$s:String!,$st:String!){
      validate(postcode:$pc, suburb:$s, state:$st){ ok message }
    }`;
    const res = await graphql({
      schema,
      source: query,
      variableValues: { pc:'12', s:'Sydney', st:'NSW' },
      contextValue: { username: 'alice' }
    });
    expect(res.errors).toBeUndefined();
    expect(res.data?.validate.ok).toBe(false);
    expect(res.data?.validate.message).toMatch(/4 digits/i);
  });

  it('succeeds when valid', async () => {
    const query = `query{
      validate(postcode:"2000", suburb:"Sydney", state:"NSW"){ ok message }
    }`;
    const res = await graphql({
      schema,
      source: query,
      contextValue: { username: 'alice' }
    });
    expect(res.errors).toBeUndefined();
    expect(res.data?.validate.ok).toBe(true);
    expect(res.data?.validate.message).toBe('ok');
  });

  it('blocks when no username in context', async () => {
    const schemaWithAuthGate = makeSchema(async (u: string) => {
      if (!u) return { ok:false, message:'Unauthorized' };
      return { ok:true, message:'ok' };
    });
    const res = await graphql({
      schema: schemaWithAuthGate,
      source: `query{ validate(postcode:"2000", suburb:"Sydney", state:"NSW"){ ok message } }`,
      contextValue: { /* no username */ }
    });
    expect(res.errors).toBeUndefined();
    expect(res.data?.validate.ok).toBe(false);
    expect(res.data?.validate.message).toMatch(/unauthorized/i);
  });
});
