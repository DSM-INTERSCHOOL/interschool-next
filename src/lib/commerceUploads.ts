/**
 * Product pictures/thumbnails are stored as root-relative paths
 * (e.g. "/uploads/7/products/abc.jpg") served directly by the Commerce API
 * origin, not by this Next app or by the interschool-core communication
 * origin -- resolve them against NEXT_PUBLIC_API_COMMERCE_ORIGIN.
 */
export const buildCommerceUploadUrl = (path: string): string =>
  `${process.env.NEXT_PUBLIC_API_COMMERCE_ORIGIN}${path}`;
