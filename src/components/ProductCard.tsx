import { Star, Heart, ShoppingCart, Info } from 'lucide-react';
import { Product, Category } from '../types';
import { useApp } from '../context/AppContext';
import { useState, useCallback, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import { generateSlug } from '../utils/seo';

interface ProductCardProps {
  product: Product;
  category?: Category;
}

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

export const ProductCard = memo(function ProductCard({ product, category }: ProductCardProps) {
  const { addToCart } = useApp();
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const discount = useMemo(() => {
    if (!product.original_price) return 0;
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }, [product.original_price, product.price]);

  const slug = useMemo(() => generateSlug(product.name), [product.name]);
  const productUrl = `/product/${product.id}/${slug}`;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 800);
  }, [addToCart, product]);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(prev => !prev);
  }, []);

  return (
    <Link
      to={productUrl}
      className="group bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden hover:border-[#3b82f6] transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] block"
    >
      <div className="relative aspect-square bg-[#18181b] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent opacity-60" />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && <span className="px-2 py-1 bg-[#ef4444] text-white text-[10px] font-bold rounded font-mono">-{discount}%</span>}
          {product.featured && <span className="px-2 py-1 bg-[#3b82f6] text-white text-[10px] font-bold rounded font-mono">FEATURED</span>}
        </div>

        <button
          onClick={handleLike}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 z-10",
            isLiked ? "bg-[#ef4444] text-white" : "bg-[#18181b]/80 text-[#71717a] opacity-0 group-hover:opacity-100 hover:text-white"
          )}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </button>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
          <span className="px-4 py-2 bg-white text-black font-bold rounded-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Info className="w-4 h-4" /> VIEW_SPECS
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider mb-1">
          {category?.name || 'Product'}
        </p>

        <h3 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-[#3b82f6] transition-colors min-h-[40px]">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs font-mono text-[#71717a]">{product.reviews}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white font-mono">${product.price.toLocaleString()}</span>
            {product.original_price && <span className="text-xs text-[#71717a] line-through font-mono">${product.original_price.toLocaleString()}</span>}
          </div>
          <StockBadge stock={product.stock} />
        </div>

        <button
          onClick={handleAddToCart}
          className={cn(
            "w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all",
            isAdding ? "bg-[#22c55e] text-white" : "bg-[#18181b] text-white border border-[#27272a] hover:bg-[#3b82f6] hover:border-[#3b82f6]"
          )}
        >
          {isAdding ? 'ADDED_TO_RIG' : <><ShoppingCart className="w-3 h-3" /> ADD_TO_CART</>}
        </button>
      </div>
    </Link>
  );
});
