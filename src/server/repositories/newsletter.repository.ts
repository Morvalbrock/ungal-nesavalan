import type { NewsletterSubscriber } from "@/types/newsletter";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface NewsletterRepository {
  list(): Promise<NewsletterSubscriber[]>;
  findByEmail(email: string): Promise<NewsletterSubscriber | null>;
  subscribe(input: { email: string; source: string }): Promise<{ subscriber: NewsletterSubscriber; created: boolean }>;
  unsubscribe(email: string): Promise<boolean>;
}

const COLLECTION = "newsletter-subscribers";

function normalise(email: string): string {
  return email.trim().toLowerCase();
}

export const jsonNewsletterRepo: NewsletterRepository = {
  async list() {
    const rows = await readCollection<NewsletterSubscriber>(COLLECTION);
    return rows.slice().sort((a, b) => b.confirmedAt.localeCompare(a.confirmedAt));
  },
  async findByEmail(email) {
    const rows = await readCollection<NewsletterSubscriber>(COLLECTION);
    const key = normalise(email);
    return rows.find((r) => r.email === key) ?? null;
  },
  async subscribe(input) {
    const email = normalise(input.email);
    let created = false;
    let out: NewsletterSubscriber | null = null;
    await mutateCollection<NewsletterSubscriber>(COLLECTION, [], (rows) => {
      const existing = rows.find((r) => r.email === email);
      if (existing) {
        if (existing.unsubscribedAt) {
          out = { ...existing, unsubscribedAt: null, confirmedAt: nowIso() };
          return rows.map((r) => (r.email === email ? out! : r));
        }
        out = existing;
        return rows;
      }
      created = true;
      out = {
        id: newId("nls"),
        email,
        source: input.source,
        confirmedAt: nowIso(),
        unsubscribedAt: null
      };
      return [...rows, out];
    });
    return { subscriber: out!, created };
  },
  async unsubscribe(email) {
    const key = normalise(email);
    let changed = false;
    await mutateCollection<NewsletterSubscriber>(COLLECTION, [], (rows) =>
      rows.map((r) => {
        if (r.email !== key || r.unsubscribedAt) return r;
        changed = true;
        return { ...r, unsubscribedAt: nowIso() };
      })
    );
    return changed;
  }
};
