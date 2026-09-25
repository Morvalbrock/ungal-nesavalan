export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  confirmedAt: string;
  unsubscribedAt: string | null;
}
