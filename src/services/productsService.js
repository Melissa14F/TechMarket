import { PRODUCTS, BANNERS } from '../data/products';

export function getProducts() {
  return PRODUCTS;
}

export function getBanners() {
  return BANNERS;
}

export function getFeaturedProducts(count = 4) {
  return PRODUCTS.slice(0, count);
}

export function getBestSellers(count = 4) {
  return [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, count);
}

export function getRecommendedProducts(count = 4) {
  return [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, count);
}
