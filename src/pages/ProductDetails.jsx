import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, AlertCircle } from 'lucide-react';

// التعديل 1: نستقبل products من الـ App.jsx ونحذف الاعتماد على initialProducts
export default function ProductDetails({ addToCart, products = [] }) {
    const { id } = useParams();

    // البحث عن المنتج الحقيقي (استخدمنا toString() لضمان تطابق نوع الـ ID)
    const product = products.find(p => p.id.toString() === id);

    const [selectedSize, setSelectedSize] = useState('');
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        if (product) {
            // نبحث عن أول مقاس متوفر في المخزن ليكون هو المختار افتراضياً
            const firstAvailableSize = product.sizes?.find(size => (product.stock?.[size] ?? 1) > 0);

            setSelectedSize(firstAvailableSize || product.sizes?.[0] || '');
            setMainImage(product.image || '');
        }
    }, [product]);

    if (!product) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center bg-white animate-fadeIn">
                <h2 className="text-4xl font-black text-gray-950 mb-6 uppercase tracking-tight">Product<span className="font-light">Not</span>Found</h2>
                <Link to="/shop" className="border-b-2 border-black text-black text-sm font-bold uppercase tracking-widest pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">العودة للكتالوج</Link>
            </div>
        );
    }

    // التحقق مما إذا كان المنتج مباع بالكامل (جميع المقاسات صفر)
    const isCompletelyOutOfStock = product.sizes?.every(size => (product.stock?.[size] ?? 0) <= 0);

    return (
        <div className="bg-white min-h-screen animate-fadeIn font-tajawal">
            <div className="flex flex-col lg:flex-row">

                {/* =========================================
                    القسم الأيمن: معرض الصور
                ========================================= */}
                <div className="lg:w-7/12 relative flex flex-col lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] overflow-hidden bg-gray-50">

                    <Link
                        to="/shop"
                        className="absolute top-4 right-4 md:top-6 md:right-6 z-20 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg text-gray-900 hover:bg-black hover:text-white transition-all duration-300"
                    >
                        <ArrowRight size={20} strokeWidth={2.5} />
                    </Link>

                    {/* الصورة الأساسية */}
                    <div className="w-full h-[65vh] lg:h-full overflow-hidden">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isCompletelyOutOfStock ? 'grayscale opacity-70' : ''}`}
                        />
                        {isCompletelyOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-10">
                                <span className="bg-black text-white px-8 py-3 text-xl font-black uppercase tracking-[0.2em] shadow-2xl -rotate-12">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    {/* شريط المصغرات */}
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto flex justify-center md:justify-start gap-2 md:gap-3 z-10 bg-white/80 backdrop-blur-xl p-2 md:p-3 shadow-lg border border-white/20">

                        <button onClick={() => setMainImage(product.image)} className={`w-14 h-16 md:w-16 md:h-20 overflow-hidden transition-all duration-300 ${mainImage === product.image ? 'border-2 border-black scale-105' : 'border border-gray-200 opacity-70 hover:opacity-100'}`}>
                            <img src={product.image} alt="Thumbnail 1" className="w-full h-full object-cover" />
                        </button>

                        {/* التعديل: استخدمنا أسماء المتغيرات الحقيقية image_hover و image_3 */}
                        {product.image_hover && (
                            <button onClick={() => setMainImage(product.image_hover)} className={`w-14 h-16 md:w-16 md:h-20 overflow-hidden transition-all duration-300 ${mainImage === product.image_hover ? 'border-2 border-black scale-105' : 'border border-gray-200 opacity-70 hover:opacity-100'}`}>
                                <img src={product.image_hover} alt="Thumbnail 2" className="w-full h-full object-cover" />
                            </button>
                        )}

                        {product.image_3 && (
                            <button onClick={() => setMainImage(product.image_3)} className={`w-14 h-16 md:w-16 md:h-20 overflow-hidden transition-all duration-300 ${mainImage === product.image_3 ? 'border-2 border-black scale-105' : 'border border-gray-200 opacity-70 hover:opacity-100'}`}>
                                <img src={product.image_3} alt="Thumbnail 3" className="w-full h-full object-cover" />
                            </button>
                        )}
                    </div>
                </div>

                {/* =========================================
                    القسم الأيسر: تفاصيل المنتج
                ========================================= */}
                <div className="lg:w-5/12 p-6 md:p-12 lg:p-24 flex flex-col bg-white z-10">

                    <span className="text-gray-400 font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2 block">
                        {product.category} {product.sub_category ? `/ ${product.sub_category}` : ''}
                    </span>

                    <h1 className="text-3xl md:text-5xl font-black text-gray-950 mb-4 md:mb-6 tracking-tight leading-tight">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-8 md:mb-12 pb-6 border-b border-gray-100">
                        <span className="text-2xl md:text-3xl font-bold text-black">{product.price} ج.م</span>
                        {product.old_price && <span className="text-lg md:text-xl text-gray-400 line-through font-medium">{product.old_price} ج.م</span>}
                    </div>

                    {/* المقاسات مع نظام المخزون الحقيقي */}
                    <div className="mb-10 md:mb-12">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-gray-950 tracking-wide text-xs md:text-sm">
                                المقاس المختار: <span className="text-gray-500 ml-2">{selectedSize || 'غير محدد'}</span>
                            </span>
                            <button className="text-[10px] md:text-xs text-gray-400 underline hover:text-black tracking-widest uppercase">دليل المقاسات</button>
                        </div>

                        <div className="flex gap-2 md:gap-3 flex-wrap">
                            {product.sizes?.map(size => {
                                // جلب كمية هذا المقاس من قاعدة البيانات (إذا لم نجد المخزون نعتبره 1 لكي يعمل قديماً)
                                const stockQty = product.stock ? (product.stock[size] ?? 0) : 1;
                                const isOutOfStock = stockQty <= 0;

                                return (
                                    <button
                                        key={size}
                                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                                        disabled={isOutOfStock}
                                        title={isOutOfStock ? 'نفدت الكمية' : `متاح (${stockQty})`}
                                        className={`min-w-[3.5rem] md:min-w-[4rem] h-12 md:h-14 flex flex-col items-center justify-center font-bold transition-all duration-300 
                                            ${isOutOfStock
                                                ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                                                : selectedSize === size
                                                    ? 'bg-black text-white border-2 border-black'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-black hover:text-black'
                                            }`}
                                    >
                                        <span className={`text-xs md:text-sm ${isOutOfStock ? 'line-through' : ''}`}>{size}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* رسالة تنبيه لو المقاس المختار خلص */}
                        {selectedSize && product.stock && (product.stock[selectedSize] ?? 0) <= 0 && !isCompletelyOutOfStock && (
                            <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 mt-4 bg-red-50 p-2 rounded">
                                <AlertCircle size={14} /> للأسف، هذا المقاس نفد من المخزون مؤخراً.
                            </p>
                        )}
                    </div>

                    {/* زر الإضافة للسلة (يتعطل إذا كان المنتج مباع بالكامل) */}
                    <button
                        disabled={isCompletelyOutOfStock || !selectedSize || (product.stock && product.stock[selectedSize] <= 0)}
                        onClick={() => addToCart({ ...product, selectedSize })}
                        className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 md:py-5 font-bold text-xs md:text-sm flex items-center justify-center transition-all duration-300 uppercase tracking-[0.3em] mb-8 md:mb-12 shadow-2xl hover:shadow-none rounded-none"
                    >
                        {isCompletelyOutOfStock ? 'نفدت الكمية' : 'إضافة إلى السلة'}
                    </button>

                    {/* مميزات سريعة */}
                    <div className="mt-auto space-y-4 md:space-y-6 pt-6 md:pt-10 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-gray-600 group">
                            <Truck className="text-black shrink-0 transition-transform group-hover:scale-110" size={22} strokeWidth={1.5} />
                            <div className="flex flex-col">
                                <span className="text-xs md:text-sm font-bold text-gray-900">شحن سريع وموثوق</span>
                                <span className="text-[10px] md:text-xs text-gray-500 mt-1">يصلك طلبك خلال 2 إلى 4 أيام عمل</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600 group">
                            <ShieldCheck className="text-black shrink-0 transition-transform group-hover:scale-110" size={22} strokeWidth={1.5} />
                            <div className="flex flex-col">
                                <span className="text-xs md:text-sm font-bold text-gray-900">سياسة استرجاع مرنة</span>
                                <span className="text-[10px] md:text-xs text-gray-500 mt-1">استرجاع واستبدال مجاني خلال 14 يوم</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}