import useSWR from 'swr';
import { db } from '../services/database';
import type { PCComponent } from '../types';

// Fetcher functions connected to Supabase
const fetchProducts = () => db.getProducts();
const fetchCategories = () => db.getCategories();

/**
 * Hook to fetch all products with SWR caching
 */
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    'supabase_products',
    fetchProducts,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    products: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch categories
 */
export function useCategories() {
  const { data, error, isLoading } = useSWR(
    'supabase_categories',
    fetchCategories,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    categories: data ?? [],
    isLoading,
    isError: error,
  };
}

/**
 * Hook to fetch PC components for builder
 * Maps standard Products to PCBuilder compatible objects
 */
export function usePCComponents() {
  const { products, isLoading, isError } = useProducts();
  const { categories } = useCategories();

  const components = (products as any[]).map(p => {
    const catName = categories.find(c => c.id === p.category_id)?.name.toLowerCase() || '';

    // Determine type based on category name
    let type = 'other';
    if (catName.includes('processor') || catName.includes('cpu')) type = 'cpu';
    if (catName.includes('graphics') || catName.includes('gpu')) type = 'gpu';
    if (catName.includes('memory') || catName.includes('ram')) type = 'ram';
    if (catName.includes('motherboard')) type = 'motherboard';
    if (catName.includes('storage') || catName.includes('ssd')) type = 'storage';
    if (catName.includes('power') || catName.includes('psu')) type = 'psu';
    if (catName.includes('case')) type = 'case';
    if (catName.includes('cooling') || catName.includes('fan')) type = 'cooler';

    // Parse wattage from specs if possible
    const wattageSpec = p.specs.find((s: string) => s.toUpperCase().includes('W') && /\d/.test(s));
    const wattage = wattageSpec ? parseInt(wattageSpec.match(/\d+/)?.[0] || '0') : 0;

    return {
      id: p.id,
      name: p.name,
      type,
      brand: p.name.split(' ')[0],
      price: p.price,
      image: p.image,
      specs: p.specs,
      wattage,
      compatibility: []
    };
  }).filter(c => c.type !== 'other') as PCComponent[];

  return {
    components,
    isLoading,
    isError,
  };
}

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(id: string) {
  const { products, isLoading } = useProducts();
  const product = products.find(p => p.id === id);
  return { product, isLoading };
}

/**
 * Hook to get featured products
 */
export function useFeaturedProducts(limit?: number) {
  const { products, isLoading } = useProducts();
  const featured = products.filter(p => p.featured).slice(0, limit);
  return { products: featured, isLoading };
}
