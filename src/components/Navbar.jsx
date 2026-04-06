import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User } from 'lucide-react'; // <-- أضفنا استدعاء أيقونة User

export default function Navbar({ cartCount, setIsCartOpen }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed w-full top-0 left-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* 1. اللوجو (أسود بالكامل، خط رفيع وفخم) */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-4xl font-black text-gray-950 tracking-tighter uppercase">
                            Alsafa<span className="font-light">.</span>
                        </Link>
                    </div>

                    {/* 2. روابط التنقل (للشاشات الكبيرة،Minimal) */}
                    <div className="hidden md:flex gap-10 items-center">
                        <Link to="/" className="text-gray-600 hover:text-black font-bold text-xs uppercase tracking-widest transition-colors">الرئيسية</Link>
                        <Link to="/shop" className="text-gray-600 hover:text-black font-bold text-xs uppercase tracking-widest transition-colors">جميع التشكيلات</Link>
                        <Link to="/about" className="text-gray-600 hover:text-black font-bold text-xs uppercase tracking-widest transition-colors">من نحن</Link>
                        <Link to="/contact" className="text-gray-600 hover:text-black font-bold text-xs uppercase tracking-widest transition-colors">اتصل بنا</Link>
                    </div>

                    {/* 3. الإجراءات (Minimal) */}
                    <div className="flex items-center gap-1.5 md:gap-3">

                        {/* زر البحث */}
                        <button className="p-2 text-gray-500 hover:text-black transition-colors">
                            <Search size={20} className="stroke-[1.5]" />
                        </button>

                        {/* <-- أيقونة الحساب (البروفايل) الجديدة --> */}
                        <Link to="/profile" className="p-2 text-gray-500 hover:text-black transition-colors">
                            <User size={22} className="stroke-[1.5]" />
                        </Link>

                        {/* زر السلة مع العداد الفخم */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2.5 text-gray-500 hover:text-black group transition-colors"
                        >
                            <ShoppingCart size={22} className="stroke-[1.5]" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1.5 -mt-1 -mr-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white shadow-sm">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* زر القائمة للموبايل */}
                        <button
                            className="md:hidden p-2 text-gray-600 hover:text-black"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>

                </div>
            </div>

            {/* 4. قائمة الموبايل (كاملة البياض، فخمة) */}
            <div
                className={`md:hidden absolute top-20 left-0 w-full bg-white h-screen border-t border-gray-100 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100 py-10' : 'max-h-0 opacity-0 py-0'
                    }`}
            >
                <div className="flex flex-col px-10 gap-6 text-right">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black text-gray-950 tracking-tighter hover:text-gray-500">الرئيسية</Link>
                    <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black text-gray-950 tracking-tighter hover:text-gray-500">التشكيلات</Link>
                    <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black text-gray-950 tracking-tighter hover:text-gray-500">من نحن</Link>
                    <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black text-gray-950 tracking-tighter hover:text-gray-500">اتصل بنا</Link>

                    {/* <-- رابط الحساب في الموبايل --> */}
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black text-gray-400 tracking-tighter hover:text-black mt-4">حسابي</Link>
                </div>
            </div>
        </nav>
    );
}