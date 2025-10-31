/**
 * Shared types for testimonials across server and client.
 */
export type TestimonialItem = {
  /** Unique identifier for the testimonial */
  id: string;

  /** Display name of the user submitting feedback */
  userName: string;

  /** Optional avatar image URL */
  avatarUrl?: string;

  /** Star rating from 1 to 5 */
  rating: number;

  /** Detailed feedback text */
  feedback: string;

  /** Optional short role/descriptor */
  role?: string;

  /** Submission timestamp in ISO format */
  submittedAt: string;
};

/**
 * Parameters controlling retrieval, filtering, and sorting.
 */
export type ListParams = {
  /** Sort by 'date' or 'rating' */
  sort?: 'date' | 'rating';

  /** Sort order asc or desc */
  order?: 'asc' | 'desc';

  /** Minimum rating threshold */
  minRating?: number;

  /** Pagination page (1-based) */
  page?: number;

  /** Items per page */
  pageSize?: number;
};