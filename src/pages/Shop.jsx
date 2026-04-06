import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';

// نستقبل products و categories من App.jsx
export default function Shop({ addToCart, products = [], categories = [] }) {
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [activeSubCategory, setActiveSubCategory] = useState('الكل');

    // 1. استخراج أسماء الأقسام الرئيسية من قاعدة البيانات وإضافة "الكل" في البداية
    const mainCategories = ['الكل', ...categories.map(c => c.name)];

    // 2. دالة ذكية للحصول على الأقسام الفرعية للقسم النشط حالياً
    const getActiveSubCategories = () => {
        if (activeCategory === 'الكل') return [];
        const category = categories.find(c => c.name === activeCategory);
        if (category && category.sub_categories && category.sub_categories.length > 0) {
            return ['الكل', ...category.sub_categories.map(sub => sub.name)];
        }
        return []; // لو القسم ملوش أقسام فرعية، نرجع مصفوفة فارغة
    };

    const activeSubCats = getActiveSubCategories();

    // 3. دالة لتغيير القسم الرئيسي وتصفير القسم الفرعي
    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setActiveSubCategory('الكل');
    };

    // 4. فلترة المنتجات المزدوجة (رئيسي ثم فرعي)
    let filteredProducts = products;

    if (activeCategory !== 'الكل') {
        filteredProducts = filteredProducts.filter(p => p.category === activeCategory);

        if (activeSubCategory !== 'الكل') {
            // نستخدم sub_category بالشرطة السفلية ليتطابق مع قاعدة البيانات
            filteredProducts = filteredProducts.filter(p => p.sub_category === activeSubCategory);
        }
    }

    return (
        <div className="w-full bg-white min-h-screen pt-10 pb-24 animate-fadeIn">

            {/* رأس الصفحة (Header) - تصميم Editorial */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <span className="text-gray-400 text-xs tracking-[0.3em] uppercase mb-4 block font-bold">
                    Discover The Collection
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-950 mb-4 tracking-tighter">
                    أحدث التشكيلات
                </h1>
                <p className="text-gray-500 font-medium text-sm">
                    {filteredProducts.length} منتج متاح
                </p>
            </div>

            {/* منطقة الفلاتر */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 flex flex-col items-center">

                {/* الفلاتر الرئيسية */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-10 border-b border-gray-200 pb-1 w-full">
                    <div className="hidden md:flex items-center text-gray-400 pb-4">
                        <Filter size={18} strokeWidth={1.5} />
                    </div>
                    {mainCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`pb-4 text-xs md:text-sm font-bold tracking-widest uppercase transition-all duration-300 border-b-2 ${activeCategory === cat
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-black hover:border-gray-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* الفلاتر الفرعية (تظهر فقط لو القسم الرئيسي له أقسام فرعية) */}
                {activeSubCats.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6 animate-fadeIn w-full">
                        {activeSubCats.map(subCat => (
                            <button
                                key={subCat}
                                onClick={() => setActiveSubCategory(subCat)}
                                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all duration-300 ${activeSubCategory === subCat
                                    ? 'bg-black text-white shadow-md'
                                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-black hover:text-black'
                                    }`}
                            >
                                {subCat}
                            </button>
                        ))}
                    </div>
                )}

            </div>

            {/* شبكة المنتجات */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-10 md:gap-y-16">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} addToCart={addToCart} />
                        ))}
                    </div>
                ) : (
                    // رسالة "لا توجد منتجات" بتصميم فخم
                    <div className="text-center py-32 bg-gray-50 border border-gray-100 flex flex-col items-center justify-center">
                        <span className="text-gray-300 mb-4 block">
                            <Filter size={48} strokeWidth={1} />
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">لا توجد قطع مطابقة</h2>
                        <p className="text-gray-500 font-medium text-sm">حاول تصفح قسم فرعي آخر أو العودة للكل.</p>
                        <button
                            onClick={() => handleCategoryChange('الكل')}
                            className="mt-8 border-b-2 border-black pb-1 text-xs font-bold text-black uppercase tracking-widest hover:text-gray-500 hover:border-gray-500 transition-colors"
                        >
                            العودة للكل
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}