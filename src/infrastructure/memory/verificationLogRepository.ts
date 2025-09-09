import { VerificationLogRepository } from "../../core/ports";

const logs: any[] = [];

export function memoryVerificationLogRepository(): VerificationLogRepository {
  return {
    async log(entry) { logs.push(entry); /* keep in RAM for now */ },
  };
}
