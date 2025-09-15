const __store = {};

function ensure(index) {
  if (!__store[index])
    __store[index] = { docs: [], settings: null, mappings: null };
}

function __resetEsMock() {
  for (const k of Object.keys(__store)) delete __store[k];
}

class ResponseError extends Error {
  constructor(message, meta) {
    super(message);
    this.meta = meta;
  }
}

const errors = { ResponseError };

class Client {
  constructor() {}

  indices = {
    exists: async ({ index }) =>
      Object.prototype.hasOwnProperty.call(__store, index),
    create: async ({ index, settings, mappings }) => {
      ensure(index);
      __store[index].settings = settings || null;
      __store[index].mappings = mappings || null;
      return { acknowledged: true };
    },
  };

  async search({ index, size = 10, query }) {
    ensure(index);
    let results = __store[index].docs;

    const term = query && query.term;
    if (term) {
      const [field, spec] = Object.entries(term)[0];
      const value = spec && typeof spec === "object" ? spec.value : spec;
      results = results.filter((doc) => doc[field] === value);
    }

    const hits = results.slice(0, size).map((doc, i) => ({
      _index: index,
      _id: String(i + 1),
      _source: doc,
    }));

    return {
      hits: {
        hits,
        total: { value: results.length, relation: "eq" },
      },
    };
  }

  async index({ index, id, document, refresh, op_type }) {
    ensure(index);

    if (op_type === "create" && id) {
      const exists = __store[index].docs.some((d) => d._id === id);
      if (exists) {
        throw new ResponseError("version_conflict_engine_exception", {
          body: { error: { type: "version_conflict_engine_exception" } },
        });
      }
    }

    const toStore = id ? { _id: id, ...document } : document;
    __store[index].docs.push(toStore);

    return {
      _index: index,
      _id: id ?? String(__store[index].docs.length),
      result: "created",
      refresh,
    };
  }
}

module.exports = {
  Client,
  errors,
  __resetEsMock,
  __store,
};
