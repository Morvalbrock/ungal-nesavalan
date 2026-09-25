import type { MailProvider } from "./mail.provider";
import { createConsoleProvider } from "./console.provider";
import { createResendProvider } from "./resend.provider";

let cached: MailProvider | null = null;

export function getMailProvider(): MailProvider {
  if (cached) return cached;
  cached = process.env.RESEND_API_KEY ? createResendProvider() : createConsoleProvider();
  return cached;
}

// Test helper: allow tests to reset the cached provider.
export function _resetMailProviderForTest() {
  cached = null;
}

export type { MailProvider } from "./mail.provider";
