import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, addToCart }) {
    // استخدمنا ?. لضمان عدم حدوث خطأ إذا لم يكن هناك مقاسات
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');

    return (
        <div className="group relative flex flex-col h-full bg-transparent">

            {product.badge && (
                <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-black text-white text-[8px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1.5 z-10 tracking-widest uppercase">
                    {product.badge}
                </span>
            )}

            <Link to={`/product/${product.id}`} className="relative aspect-[2/3] w-full overflow-hidden mb-3 md:mb-5 block bg-gray-50">
                <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
                />

                {/* التعديل: image_hover بدلاً من imageHover */}
                {product.image_hover && (
                    <img
                        src={product.image_hover}
                        alt={`${product.name} model`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    />
                )}

                <div className="hidden md:block absolute bottom-0 left-0 w-full p-4 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0" onClick={(e) => e.preventDefault()}>
                    <div className="bg-white/95 backdrop-blur-md p-4 shadow-2xl">
                        <div className="flex justify-center gap-3 mb-4">
                            {product.sizes?.map(size => (
                                <button
                                    key={size}
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSelectedSize(size); }}
                                    className={`w-9 h-9 flex items-center justify-center text-xs font-bold transition-all ${selectedSize === size ? 'bg-black text-white' : 'bg-transparent text-gray-500 hover:text-black border border-gray-200 hover:border-black'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); addToCart({ ...product, selectedSize }); }}
                            className="w-full bg-black hover:bg-gray-800 text-white py-3 text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                        >
                            إضافة للسلة
                        </button>
                    </div>
                </div>
            </Link>

            <Link to={`/product/${product.id}`} className="text-right flex flex-col flex-grow">
                <h3 className="text-[11px] md:text-sm font-bold text-gray-900 mb-1 line-clamp-1 hover:text-gray-500 transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center justify-start gap-2 md:gap-3 mb-2 md:mb-0">
                    <span className="text-xs md:text-sm font-black text-black">{product.price} د.ك</span>
                    {/* التعديل: old_price بدلاً من oldPrice */}
                    {product.old_price && (
                        <span className="text-[9px] md:text-xs text-gray-400 line-through">{product.old_price} د.ك</span>
                    )}
                </div>
            </Link>

            <div className="md:hidden mt-auto flex flex-col gap-2 pt-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                    {product.sizes?.map(size => (
                        <button
                            key={size}
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSelectedSize(size); }}
                            className={`flex-1 h-7 flex items-center justify-center text-[10px] font-bold transition-all ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border border-gray-200'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); addToCart({ ...product, selectedSize }); }}
                    className="w-full bg-gray-950 text-white h-8 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center shadow-sm"
                >
                    إضافة للسلة
                </button>
            </div>
        </div>
    );
}
