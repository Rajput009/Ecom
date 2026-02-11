import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ShoppingCart, Star, Shield, Truck, RotateCcw,
    ChevronRight, Check, AlertTriangle, Cpu, Monitor,
    HardDrive, Zap, Box, Fan, CircuitBoard, MemoryStick
} from 'lucide-react';
import { useProduct, usePCComponents, useCategories } from '../hooks/useProducts';
import { useApp } from '../context/AppContext';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';
import { ProductCard } from '../components/ProductCard';

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { product, isLoading } = useProduct(id || '');
    const { categories } = useCategories();
    const { components } = usePCComponents();
    const { addToCart } = useApp();

    const categoryName = useMemo(() => {
        if (!product || !categories) return 'Product';
        return categories.find(c => c.id === product.category_id)?.name || 'Product';
    }, [product, categories]);

    // Product Schema for Google
    const productSchema = useMemo(() => {
        if (!product) return null;
        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": [product.image],
            "description": product.description,
            "brand": {
                "@type": "Brand",
                "name": product.name.split(' ')[0]
            },
            "offers": {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": "USD",
                "price": product.price,
                "itemCondition": "https://schema.org/NewCondition",
                "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.reviews
            }
        };
    }, [product]);

    // Related products (same category)
    const relatedProducts = useMemo(() => {
        if (!product || !components) return [];
        return components
            .filter(c => c.id !== product.id && c.type.toLowerCase().includes(categoryName.toLowerCase().slice(0, 3)))
            .slice(0, 4);
    }, [product, components, categoryName]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[#27272a] border-t-[#3b82f6] rounded-full animate-spin" />
                    <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">LOADING_PRODUCT...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center pt-20">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-white mb-2">Product Not Found</h1>
                    <Link to="/products" className="text-[#3b82f6] hover:underline font-mono text-sm">RETURN_TO_STORE</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] pt-24 pb-16">
            <SEO
                title={product.name}
                description={product.description.slice(0, 160)}
                image={product.image}
                type="product"
                schema={productSchema}
            />

            <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-8 text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                    <Link to="/" className="hover:text-white transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/products" className="hover:text-white transition-colors">Store</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to={`/products?category=${encodeURIComponent(categoryName)}`} className="hover:text-white transition-colors">
                        {categoryName}
                    </Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#3b82f6] truncate max-w-[150px] sm:max-w-none">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-[#111113] border border-[#27272a] rounded-3xl overflow-hidden group relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {product.featured && (
                                    <span className="px-3 py-1 bg-[#3b82f6] text-white text-[10px] font-bold rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                        FEATURED
                                    </span>
                                )}
                                {product.stock > 0 && product.stock <= 5 && (
                                    <span className="px-3 py-1 bg-[#ef4444] text-white text-[10px] font-bold rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                        LIMITED_STOCK
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-1 bg-[#18181b] border border-[#27272a] text-[#71717a] text-[10px] font-mono rounded-lg">
                                    {categoryName}
                                </span>
                                <div className="flex items-center gap-1 ml-auto">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn("w-3 h-3", i < Math.floor(product.rating) ? "text-[#3b82f6] fill-[#3b82f6]" : "text-[#27272a]")}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-mono text-[#71717a]">{product.rating} ({product.reviews} reviews)</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{product.name}</h1>

                            <div className="flex items-baseline gap-4 mb-6">
                                <span className="text-5xl font-bold text-white font-mono tracking-tighter">
                                    ${product.price.toLocaleString()}
                                </span>
                                {product.original_price && (
                                    <span className="text-2xl text-[#71717a] line-through font-mono">
                                        ${product.original_price.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            <p className="text-[#a1a1aa] leading-relaxed text-lg mb-8">
                                {product.description}
                            </p>

                            <div className="flex items-center gap-4 py-6 border-y border-[#27272a] mb-8">
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono",
                                    product.stock > 0 ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]" : "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
                                )}>
                                    <Check className="w-3 h-3" /> {product.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'}
                                </div>
                                <span className="text-xs font-mono text-[#71717a] uppercase tracking-widest px-2">
                                    {product.stock} Units left
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock === 0}
                                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-[#3b82f6] text-white font-bold rounded-2xl hover:bg-[#2563eb] transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] active:scale-[0.98] disabled:bg-[#18181b] disabled:text-[#3f3f46] disabled:border-[#27272a] disabled:shadow-none"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {product.stock > 0 ? 'ADD_TO_RIG' : 'RESTOCKING_SOON'}
                                </button>
                            </div>
                        </div>

                        {/* Features Bar */}
                        <div className="grid grid-cols-3 gap-2 py-4">
                            {[
                                { icon: Shield, label: '3-Year Warranty' },
                                { icon: Truck, label: 'Fast Delivery' },
                                { icon: RotateCcw, label: 'Easy Returns' },
                            ].map((f) => (
                                <div key={f.label} className="bg-[#111113] border border-[#27272a] p-3 rounded-2xl flex flex-col items-center gap-2 text-center">
                                    <f.icon className="w-4 h-4 text-[#3b82f6]" />
                                    <span className="text-[10px] text-[#71717a] font-mono leading-none">{f.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Specs */}
                        <div className="space-y-4 pt-8 border-t border-[#27272a]">
                            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                                <Box className="w-5 h-5 text-[#3b82f6]" /> TECHNICAL_SPECIFICATIONS
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {product.specs.map((spec, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-[#111113] border border-[#27272a] rounded-2xl">
                                        <div className="w-8 h-8 bg-[#18181b] rounded-lg flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-[#22c55e]" />
                                        </div>
                                        <span className="text-sm text-[#a1a1aa] font-medium">{spec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Components */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-[0.2em]">Compatibility</span>
                                <h2 className="text-2xl font-bold text-white mt-1">Recommended for this {categoryName}</h2>
                            </div>
                            <Link to="/products" className="text-sm text-[#3b82f6] hover:text-[#60a5fa] font-mono">BROWSE_ALL</Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p as any} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
