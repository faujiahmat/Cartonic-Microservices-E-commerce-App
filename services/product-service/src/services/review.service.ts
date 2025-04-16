import Review, { IReview } from '../models/review.model';

export class ReviewService {
  static async addReview(payload: Partial<IReview>) {
    return await Review.create(payload);
  }

  static async getReviews(productId: string) {
    return await Review.find({ productId });
  }

  static async updateReview(
    value: { reviewId: string; userId: string; productId: string },
    payload: Partial<IReview>,
  ) {
    return await Review.findOneAndUpdate(value, payload, {
      new: true,
    });
  }

  static async deleteReview(reviewId: string, userId: string, productId: string) {
    return await Review.findOneAndDelete({ reviewId, userId, productId });
  }
}
