export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: Record<string, string>;
}

export interface MailResult {
  id: string;
  provider: "resend" | "console";
}

export interface MailProvider {
  readonly mode: "resend" | "console";
  send(input: MailInput): Promise<MailResult>;
}
