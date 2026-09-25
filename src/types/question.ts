export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  answer: {
    body: string;
    authorName: string;
    answeredAt: string;
  } | null;
  published: boolean;
}
