export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  authorName: string;
  verified: true;
  createdAt: string;
}

export interface ReviewAggregate {
  productId: string;
  avg: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
