import { makeRegister } from "../application/register";
import { makeLogin } from "../application/login";
import { makeVerifyAddress } from "../application/verifyAddress";

// Security adapters
import { bcryptHasher } from "../infrastructure/security/bcryptHasher";
import { jwtSession } from "../infrastructure/security/jwtSession";

// adapters (Elasticsearch + AusPost)
import { esUserRepository } from "../infrastructure/es/userRepository";
import { esVerificationLogRepository } from "../infrastructure/es/verificationLogRepository";
import { makeAusPostRestAdapter } from "../infrastructure/auspost/restAdapter";

export function buildServerServices() {
  const first = "nick";
  const last = "johnson";
  const USERS_INDEX = `${first}-${last}-users`;
  const VERIF_PREFIX = `${first}-${last}-verifications`;

  const users = esUserRepository({
    node: process.env.ELASTICSEARCH_NODE!,
    apiKey: process.env.ELASTICSEARCH_API_KEY!,
    index: USERS_INDEX,
  });

  const logs = esVerificationLogRepository({
    node: process.env.ELASTICSEARCH_NODE!,
    apiKey: process.env.ELASTICSEARCH_API_KEY!,
    prefix: VERIF_PREFIX,
  });

  const validator = makeAusPostRestAdapter({
    baseUrl: process.env.AUSPOST_BASE_URL!,
    apiKey: process.env.AUSPOST_API_KEY!,
  });

  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  const session = jwtSession(secret);
  const hasher = bcryptHasher();

  return {
    session,
    hasher,
    users,
    usecases: {
      register: makeRegister({ users, hasher, session }),
      login: makeLogin({ users, hasher, session }),
      verifyAddress: makeVerifyAddress({ validator, logs }),
    },
  };
}
