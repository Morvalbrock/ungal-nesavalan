import type { MailProvider } from "./mail.provider";

// Dev/CI fallback. Logs a compact summary + saves a copy under data/outbox/.
export function createConsoleProvider(): MailProvider {
  return {
    mode: "console",
    async send({ to, subject, html, tags }) {
      // eslint-disable-next-line no-console
      console.log("[mail]", { to, subject, tags, htmlBytes: html.length });
      const id = `console_${Date.now().toString(36)}`;
      try {
        const fs = await import("node:fs/promises");
        const path = await import("node:path");
        const dir = path.join(process.cwd(), "data", "outbox");
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(
          path.join(dir, `${id}.html`),
          `<!-- to:${to} · subject:${subject} -->\n${html}`,
          "utf8"
        );
      } catch {
        /* best-effort */
      }
      return { id, provider: "console" };
    }
  };
}
