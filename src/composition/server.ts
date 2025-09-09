import { makeRegister } from "../application/register";
import { makeLogin } from "../application/login";
import { makeVerifyAddress } from "../application/verifyAddress";

// Security adapters
import { bcryptHasher } from "../infrastructure/security/bcryptHasher";
import { jwtSession } from "../infrastructure/security/jwtSession";

// In-memory adapters
import { memoryUserRepository } from "../infrastructure/memory/userRepository";
import { memoryVerificationLogRepository } from "../infrastructure/memory/verificationLogRepository";
import { memoryAddressValidator } from "../infrastructure/memory/addressValidator";

export function buildServerServices() {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  const session = jwtSession(secret);
  const hasher = bcryptHasher();

  const users = memoryUserRepository();
  const logs = memoryVerificationLogRepository();
  const validator = memoryAddressValidator();

  return {
    session,
    usecases: {
      register: makeRegister({ users, hasher, session }),
      login: makeLogin({ users, hasher, session }),
      verifyAddress: makeVerifyAddress({ validator, logs }),
    },
  };
}
