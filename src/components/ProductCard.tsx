import { Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { useState, useCallback, memo, useMemo } from 'react';
import { cn } from '../utils/cn';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

// StarRating component to prevent re-renders of all stars
const StarRating = memo(function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3 h-3",
            i < Math.floor(rating)
              ? "text-[#3b82f6] fill-[#3b82f6]"
              : "text-[#27272a]"
          )}
        />
      ))}
    </div>
  );
});

// StockBadge component
const StockBadge = memo(function StockBadge({ stock }: { stock: number }) {
  const badgeClass = useMemo(() => {
    if (stock > 10) return "bg-[#22c55e]/10 text-[#22c55e]";
    if (stock > 0) return "bg-[#f59e0b]/10 text-[#f59e0b]";
    return "bg-[#ef4444]/10 text-[#ef4444]";
  }, [stock]);

  const label = useMemo(() => {
    if (stock > 10) return 'IN STOCK';
    if (stock > 0) return `${stock} LEFT`;
    return 'OUT OF STOCK';
  }, [stock]);

  return (
    <span className={cn("text-[10px] font-mono px-2 py-1 rounded", badgeClass)}>
      {label}
    </span>
  );
});

// Discount calculation outside component
const calculateDiscount = (originalPrice: number | undefined, price: number): number => {
  if (!originalPrice) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const ProductCard = memo(function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addToCart } = useApp();
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Memoized calculations
  const discount = useMemo(() => 
    calculateDiscount(product.originalPrice, product.price),
    [product.originalPrice, product.price]
  );

  const priceFormatted = useMemo(() => 
    product.price.toLocaleString(),
    [product.price]
  );

  const originalPriceFormatted = useMemo(() => 
    product.originalPrice?.toLocaleString(),
    [product.originalPrice]
  );

  // Memoized callbacks
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product);
    
    // Use RAF for smoother UI updates
    requestAnimationFrame(() => {
      setTimeout(() => setIsAdding(false), 800);
    });
  }, [addToCart, product]);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(prev => !prev);
  }, []);

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(product);
  }, [onViewDetails, product]);

  // Memoized specs to show
  const visibleSpecs = useMemo(() => 
    product.specs?.slice(0, 2) ?? [],
    [product.specs]
  );

  return (
    <div
      onClick={handleViewDetails}
      className="group bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden hover:border-[#3b82f6] transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-[#18181b] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent opacity-60" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="px-2 py-1 bg-[#ef4444] text-white text-[10px] font-bold rounded font-mono">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-1 bg-[#3b82f6] text-white text-[10px] font-bold rounded font-mono flex items-center gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleLike}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
            isLiked
              ? "bg-[#ef4444] text-white"
              : "bg-[#18181b]/80 text-[#71717a] opacity-0 group-hover:opacity-100 hover:text-white"
          )}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </button>

        {/* Quick Add */}
        <button
          onClick={handleAddToCart}
          className={cn(
            "absolute bottom-3 left-3 right-3 py-2 rounded-lg font-medium text-xs transition-all duration-300",
            isAdding
              ? "bg-[#22c55e] text-white"
              : "bg-[#3b82f6] text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:bg-[#2563eb]"
          )}
          aria-label={isAdding ? "Added to cart" : "Add to cart"}
        >
          {isAdding ? 'Added!' : 'Add to Cart'}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider mb-1">
          {product.category}
        </p>
        
        {/* Name */}
        <h3 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-[#3b82f6] transition-colors min-h-[40px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs font-mono text-[#71717a]">
            {product.reviews}
          </span>
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white font-mono">
              ${priceFormatted}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#71717a] line-through font-mono">
                ${originalPriceFormatted}
              </span>
            )}
          </div>
          <StockBadge stock={product.stock} />
        </div>

        {/* Spec Tags */}
        {visibleSpecs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-[#27272a]">
            {visibleSpecs.map((spec) => (
              <span key={spec} className="text-[9px] font-mono text-[#71717a] bg-[#18181b] px-2 py-0.5 rounded">
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
