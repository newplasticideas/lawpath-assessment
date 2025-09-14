/**
 * Composes and wires up all core services and use-cases for the server.
 *
 * - Configures repositories for users and verification logs (Elasticsearch).
 * - Sets up security adapters for password hashing and JWT session management.
 * - Provides an address validator using the AusPost REST API.
 * - Returns all use-cases (register, login, verifyAddress) with dependencies injected.
 *
 * @returns An object containing session, hasher, repositories, and use-cases.
 */
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

/**
 * Builds and returns all server-side services and use-cases.
 *
 * @returns {{
 *   session: ReturnType<typeof jwtSession>,
 *   hasher: ReturnType<typeof bcryptHasher>,
 *   users: ReturnType<typeof esUserRepository>,
 *   usecases: {
 *     register: ReturnType<typeof makeRegister>,
 *     login: ReturnType<typeof makeLogin>,
 *     verifyAddress: ReturnType<typeof makeVerifyAddress>
 *   }
 * }}
 */
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

  const session = jwtSession();
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
