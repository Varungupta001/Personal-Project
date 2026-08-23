export type ApiReview = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

export type RestaurantPageData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: ApiReview | null;
  reviews: ApiReview[];
};
