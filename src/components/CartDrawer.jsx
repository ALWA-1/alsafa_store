import React, { useState } from 'react';
import { X, Trash2, ShoppingCart, User, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartDrawer({ cart, removeFromCart, isCartOpen, setIsCartOpen, openCheckout, user, appliedCoupon, handleApplyCoupon, couponError, isApplyingCoupon }) {
    const [couponCode, setCouponCode] = useState('');
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);
    const finalTotal = appliedCoupon ? cartTotal - appliedCoupon.discount_amount : cartTotal;

    return (
        <>
            {/* 1. تظليل الخلفية (Deep Blur) */}
            <div
                className={`fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] transition-opacity duration-500 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* 2. نافذة السلة (Minimal, Sharp Edges) */}
            <div
                className={`fixed top-0 left-0 h-full w-full max-w-md bg-white z-[101] flex flex-col transition-transform duration-700 ease-in-out transform ${isCartOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* رأس السلة */}
                <div className="flex items-center justify-between p-7 border-b border-gray-100 bg-white">
                    <h3 className="text-lg font-extrabold text-gray-950 uppercase tracking-widest">السلة ({cart.length})</h3>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-1 text-gray-400 hover:text-black transition-colors"
                    >
                        <X size={26} strokeWidth={1} />
                    </button>
                </div>

                {/* المنتجات داخل السلة (Flat, No Backgrounds) */}
                <div className="flex-1 overflow-y-auto p-7 space-y-6 scrollbar-hide">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingCart size={70} className="mb-6 text-gray-100" strokeWidth={1} />
                            <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">السلة فارغة</p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="mt-10 border border-black text-black hover:bg-black hover:text-white px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all"
                            >
                                العودة للتسوق
                            </button>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="flex items-center gap-5 pb-6 border-b border-gray-100">
                                <img src={item.image} alt={item.name} className="w-20 h-26 object-cover bg-gray-50" />
                                <div className="flex-1 space-y-1.5 text-right">
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                        Size: <span className="text-black">{item.selectedSize}</span>
                                    </p>
                                    <p className="font-extrabold text-base text-black mt-2">{item.price} ج.م</p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(index)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={20} strokeWidth={1.5} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* تذييل السلة ومربع الكوبون */}
                {cart.length > 0 && (
                    <div className="p-7 border-t border-gray-100 bg-white space-y-5">
                        
                        {/* مربع إدخال الكوبون */}
                        <div className="bg-gray-50 p-4 border border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">كود الخصم (إن وجد)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="أدخل الكود هنا..." 
                                    value={couponCode} 
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 text-xs font-bold outline-none focus:border-black uppercase" 
                                    dir="ltr"
                                />
                                <button 
                                    onClick={() => handleApplyCoupon(couponCode)}
                                    disabled={isApplyingCoupon || !couponCode}
                                    className="bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
                                >
                                    {isApplyingCoupon ? <Loader2 size={14} className="animate-spin"/> : 'تطبيق'}
                                </button>
                            </div>
                            {couponError && <p className="text-[10px] text-red-500 font-bold mt-2">{couponError}</p>}
                            {appliedCoupon && <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1"><CheckCircle size={12}/> تم تطبيق خصم {appliedCoupon.discount_amount} ج.م</p>}
                        </div>

                        {/* ملخص الحساب */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Subtotal:</span>
                                <span className={`font-bold ${appliedCoupon ? 'line-through text-gray-300' : 'text-black'}`}>{cartTotal} ج.م</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between items-center text-green-600 font-bold">
                                    <span className="text-xs uppercase tracking-widest">Discount:</span>
                                    <span>-{appliedCoupon.discount_amount} ج.م</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-2">
                                <span className="text-black font-black text-sm uppercase tracking-widest">Total:</span>
                                <span className="text-3xl font-extrabold text-gray-950 tracking-tight">{finalTotal} ج.م</span>
                            </div>
                        </div>

                        {user ? (
                            <button
                                onClick={() => { setIsCartOpen(false); openCheckout(); }}
                                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-5 rounded-none text-sm uppercase tracking-[0.3em] transition-all duration-300 flex justify-center items-center shadow-2xl mt-4"
                            >
                                إتمام الطلب
                            </button>
                        ) : (
                            <Link
                                to="/profile"
                                onClick={() => setIsCartOpen(false)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 rounded-none text-xs md:text-sm uppercase tracking-[0.1em] transition-all duration-300 flex justify-center items-center gap-2 border border-gray-200 mt-4"
                            >
                                <User size={18} /> يرجى تسجيل الدخول لإتمام الطلب
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}