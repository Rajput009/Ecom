import useSWR from 'swr';
import { products, pcComponents, categories } from '../data/products';
import type { Product, PCComponent } from '../types';

// Fetcher functions
const fetchProducts = (): Promise<Product[]> => 
  Promise.resolve(products);

const fetchPCComponents = (): Promise<PCComponent[]> => 
  Promise.resolve(pcComponents);

const fetchCategories = (): Promise<string[]> => 
  Promise.resolve(categories);

// Custom hooks using SWR for automatic caching and deduplication

/**
 * Hook to fetch all products with SWR caching
 * Implements client-swr-dedup best practice
 */
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    'products',
    fetchProducts,
    {
      revalidateOnFocus: false, // Don't refetch when window regains focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
      dedupingInterval: 60000, // Dedupe requests within 1 minute
      suspense: false,
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
 * Hook to fetch a single product by ID
 */
export function useProduct(id: string) {
  const { products } = useProducts();
  
  const product = products.find(p => p.id === id);
  
  return {
    product,
    isLoading: false,
    isError: !product && products.length > 0,
  };
}

/**
 * Hook to search products
 */
export function useProductSearch(query: string) {
  const { products, isLoading } = useProducts();
  
  const filteredProducts = !query.trim() 
    ? products 
    : products.filter(product => {
        const searchTerm = query.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.specs.some(spec => spec.toLowerCase().includes(searchTerm))
        );
      });

  return {
    products: filteredProducts,
    isLoading,
  };
}

/**
 * Hook to fetch PC components for builder
 */
export function usePCComponents() {
  const { data, error, isLoading } = useSWR(
    'pc-components',
    fetchPCComponents,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  return {
    components: data ?? [],
    isLoading,
    isError: error,
  };
}

/**
 * Hook to fetch categories
 */
export function useCategories() {
  const { data, error, isLoading } = useSWR(
    'categories',
    fetchCategories,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
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
 * Hook to filter products by category
 */
export function useProductsByCategory(category: string) {
  const { products, isLoading } = useProducts();
  
  const filteredProducts = category === 'All' 
    ? products 
    : products.filter(p => p.category === category);

  return {
    products: filteredProducts,
    isLoading,
  };
}

/**
 * Hook to get featured products
 */
export function useFeaturedProducts(limit?: number) {
  const { products, isLoading } = useProducts();
  
  const featured = products
    .filter(p => p.featured)
    .slice(0, limit ?? products.length);

  return {
    products: featured,
    isLoading,
  };
}
