import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // استدعاء قاعدة البيانات

export default function Home({ addToCart, products = [], categories = [] }) {
    const [settings, setSettings] = useState(null);

    // جلب إعدادات الواجهة من الداش بورد
    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single();
            if (data) setSettings(data);
        };
        fetchSettings();
    }, []);

    // 1. الأقسام السريعة (تم التعديل هنا: سيعرض الآن جميع الأقسام بدون حد أقصى)
    const quickCategories = categories;

    // 2. المنتجات المميزة 1 (تقرأ الأرقام المحددة من الداش بورد، وإن لم تجد تعرض أحدث 4 منتجات)
    const feat1Ids = settings?.featured_1_ids || [];
    const selectedFeat1 = products.filter(p => feat1Ids.includes(p.id));
    const displayFeat1 = selectedFeat1.length > 0 ? selectedFeat1 : products.slice(0, 4);

    // 3. المنتجات المميزة 2 (تقرأ الأرقام، وإن لم تجد تعرض 4 منتجات أخرى)
    const feat2Ids = settings?.featured_2_ids || [];
    const selectedFeat2 = products.filter(p => feat2Ids.includes(p.id));
    const displayFeat2 = selectedFeat2.length > 0 ? selectedFeat2 : products.slice(4, 8);

    // 4. التحقق مما إذا كانت الخلفية فيديو أم صورة
    const heroMedia = settings?.hero_media_url || 'https://www.pexels.com/download/video/10620154/';
    const isVideo = heroMedia.match(/\.(mp4|webm|ogg|mov)$/i);

    return (
        <div className="w-full bg-white animate-fadeIn">
            {/* البانر الرئيسي (يدعم صورة أو فيديو ديناميكياً) */}
            <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
                {isVideo ? (
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80">
                        <source src={heroMedia} type="video/mp4" />
                    </video>
                ) : (
                    <img src={heroMedia} alt="Hero Background" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                )}
                
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 text-center px-4 mt-20">
                    <span className="text-white text-xs md:text-sm tracking-[0.4em] uppercase mb-4 block drop-shadow-md font-extrabold">Alsafa Haute Couture</span>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter drop-shadow-lg uppercase">
                        {settings?.hero_title || 'Define Your Style'}
                    </h1>
                    <Link to="/shop" className="inline-block bg-white text-black px-16 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500 shadow-2xl">
                        Explore Collection
                    </Link>
                </div>
            </section>

            {/* الأقسام الديناميكية */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-2 sm:px-4">
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-20 pb-8">
                        {quickCategories.map((cat) => (
                            <Link to={`/shop`} key={cat.id} className="flex flex-col items-center group cursor-pointer w-[28%] sm:w-[30%] md:w-auto md:min-w-[120px]">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 rounded-full overflow-hidden mb-3 md:mb-5 transition-transform duration-700 group-hover:scale-110 shadow-sm group-hover:shadow-2xl">
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" />
                                </div>
                                <span className="font-extrabold text-[10px] md:text-sm text-gray-950 uppercase tracking-widest text-center">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* القسم المميز الأول */}
            <section className="py-20 md:py-28 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <span className="text-gray-400 text-xs tracking-widest uppercase">The Latest</span>
                            <h2 className="text-4xl font-extrabold text-gray-950 mb-1 tracking-tight">
                                {settings?.featured_1_title || 'وصلنا حديثاً'}
                            </h2>
                        </div>
                        <Link to="/shop" className="hidden md:block text-xs font-bold text-gray-900 border-b-2 border-black pb-2 hover:text-gray-500 hover:border-gray-500 transition-colors uppercase tracking-widest">View All</Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-10 md:gap-y-16">
                        {displayFeat1.map(product => (
                            <ProductCard key={product.id} product={product} addToCart={addToCart} />
                        ))}
                    </div>
                </div>
            </section>

            {/* البانر الإعلاني الأول */}
            <section className="w-full h-[60vh] min-h-[500px] relative flex items-center bg-black my-16 overflow-hidden">
                <img src={settings?.banner_1_img || "https://images.unsplash.com/photo-1633655442136-bbc120229009?q=80"} alt="Premium Collection" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transform hover:scale-100 transition-transform duration-[10s]" />
                <div className="relative z-10 max-w-7xl mx-auto px-8 w-full text-right">
                    <span className="text-white/70 text-sm tracking-widest uppercase mb-3 block">
                        {settings?.banner_1_top_text || 'التميز ليس صدفة'}
                    </span>
                    <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tighter max-w-xl ml-auto">
                        {settings?.banner_1_title || 'تشكيلة البدل الكلاسيك'}
                    </h2>
                    <Link to="/shop" className="inline-block bg-white text-black px-12 py-4 text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-white hover:border-white border-2 border-transparent transition-all duration-300 shadow-xl">
                        {settings?.banner_1_btn_text || 'اكتشف المجموعة'}
                    </Link>
                </div>
            </section>

            {/* القسم المميز الثاني */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 space-y-3">
                        <span className="text-gray-400 text-xs tracking-widest uppercase">Iconic Pieces</span>
                        <h2 className="text-4xl font-extrabold text-gray-950 tracking-tight">
                            {settings?.featured_2_title || 'الأكثر مبيعاً'}
                        </h2>
                        <div className="w-16 h-0.5 bg-black mx-auto mt-8"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-10 md:gap-y-16">
                        {displayFeat2.map(product => (
                            <ProductCard key={product.id} product={product} addToCart={addToCart} />
                        ))}
                    </div>
                </div>
            </section>

            {/* البانر الإعلاني الثاني (Lookbook) */}
            <section className="w-full h-[55vh] min-h-[450px] relative flex items-center bg-gray-100 mb-10 overflow-hidden">
                <img src={settings?.banner_2_img || "https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80"} alt="Winter Collection" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-transparent"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-8 w-full text-right">
                    <div className="max-w-xl ml-auto flex flex-col items-end">
                        <span className="text-white/90 text-sm tracking-widest font-light mb-3 block">
                            {settings?.banner_2_top_text || 'استعد للموسم'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tighter leading-tight">
                            {settings?.banner_2_title || 'التشكيلة الشتوية الحصرية'}
                        </h2>
                        <Link to="/shop" className="inline-block bg-white text-black px-12 py-3.5 text-xs font-extrabold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 rounded-none shadow-md">
                            {settings?.banner_2_btn_text || 'تسوق الآن'}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}