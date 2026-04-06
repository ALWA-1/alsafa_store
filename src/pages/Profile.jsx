import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, User, Mail, Phone, Lock, LogOut, MapPin, Edit2, Save, Package, Ticket, Clock, CheckCircle, Truck, XCircle, ChevronLeft } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // التبويبات (Tabs)
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'orders', 'coupons'

    // بيانات المستخدم والطلبات والكوبونات
    const [myOrders, setMyOrders] = useState([]);
    const [myCoupons, setMyCoupons] = useState([]);

    // حالة تعديل البيانات
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', phone: '', address: '' });

    // بيانات فورم التسجيل/الدخول
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
            setEditData({
                name: currentUser.user_metadata?.full_name || '',
                phone: currentUser.user_metadata?.phone || '',
                address: currentUser.user_metadata?.address || ''
            });
            fetchMyOrders(currentUser.id);
            fetchCoupons(currentUser.user_metadata?.phone); // تمرير رقم الهاتف لجلب المكافآت
        }
        setIsLoading(false);
    };

    const fetchMyOrders = async (userId) => {
        const { data } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) setMyOrders(data);
    };

    const fetchCoupons = async (userPhone) => {
        // جلب الكوبونات الفعالة التي لم تستخدم (سواء كانت عامة أو مخصصة لهذا المستخدم)
        const { data } = await supabase
            .from('coupons')
            .select('*')
            .eq('is_active', true)
            .eq('is_used', false)
            .or(`user_phone.is.null,user_phone.eq.${userPhone}`);
            
        if (data) setMyCoupons(data);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { full_name: formData.name, phone: formData.phone } }
            });
            if (error) throw error;
            checkUser();
        } catch (error) {
            alert('خطأ في التسجيل: تأكد من أن الباسورد 6 أحرف أو أكثر، وأن الإيميل غير مستخدم.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });
            if (error) throw error;
            checkUser();
        } catch (error) {
            alert('بيانات الدخول غير صحيحة!');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateProfile = async () => {
        setIsProcessing(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: editData.name,
                    phone: editData.phone,
                    address: editData.address
                }
            });
            if (error) throw error;
            setIsEditing(false);
            checkUser();
            alert("تم تحديث بياناتك بنجاح!");
        } catch (error) {
            alert("حدث خطأ أثناء التحديث.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { text: 'قيد المراجعة', color: 'text-yellow-600 bg-yellow-50', border: 'border-yellow-200', icon: <Clock size={14} /> };
            case 'processing': return { text: 'جاري التجهيز', color: 'text-blue-600 bg-blue-50', border: 'border-blue-200', icon: <Package size={14} /> };
            case 'shipped': return { text: 'تم الشحن', color: 'text-purple-600 bg-purple-50', border: 'border-purple-200', icon: <Truck size={14} /> };
            case 'delivered': return { text: 'تم الاستلام', color: 'text-green-600 bg-green-50', border: 'border-green-200', icon: <CheckCircle size={14} /> };
            case 'cancelled': return { text: 'ملغي', color: 'text-red-600 bg-red-50', border: 'border-red-200', icon: <XCircle size={14} /> };
            default: return { text: 'قيد الانتظار', color: 'text-gray-600 bg-gray-50', border: 'border-gray-200', icon: <Clock size={14} /> };
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-[70vh] bg-white"><Loader2 className="animate-spin text-gray-300 w-12 h-12" /></div>;

    // ==========================================
    // واجهة المستخدم المسجل الدخول (Luxury Design)
    // ==========================================
    if (user) {
        return (
            <div className="bg-white min-h-screen pt-10 pb-24 animate-fadeIn">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-10 mb-12 gap-6">
                        <div>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mb-3 block">My Account</span>
                            <h1 className="text-4xl font-black text-gray-950 tracking-tighter">مرحباً، {user.user_metadata?.full_name?.split(' ')[0] || 'عميلنا'}</h1>
                            <p className="text-gray-500 font-medium mt-2" dir="ltr">{user.email}</p>
                        </div>
                        <button onClick={handleSignOut} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-red-600 flex items-center gap-2 transition-colors border border-gray-200 px-6 py-3 hover:border-red-200 hover:bg-red-50">
                            تسجيل الخروج <LogOut size={16} />
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                        {/* Sidebar Navigation */}
                        <div className="lg:w-1/4">
                            <div className="sticky top-28 flex flex-col gap-2">
                                <button onClick={() => setActiveTab('info')} className={`text-right px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-r-2 ${activeTab === 'info' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'}`}>
                                    <span className="flex items-center gap-3"><User size={18} /> التفاصيل الشخصية</span>
                                </button>
                                <button onClick={() => setActiveTab('orders')} className={`text-right px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-r-2 ${activeTab === 'orders' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'}`}>
                                    <span className="flex items-center justify-between"><span className="flex items-center gap-3"><Package size={18} /> سجل الطلبات</span> <span className="bg-gray-200 text-gray-600 px-2 py-0.5 text-[10px] rounded-full">{myOrders.length}</span></span>
                                </button>
                                <button onClick={() => setActiveTab('coupons')} className={`text-right px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-r-2 ${activeTab === 'coupons' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'}`}>
                                    <span className="flex items-center gap-3"><Ticket size={18} /> قسائم الخصم (VIP)</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:w-3/4">

                            {/* 1. Personal Info Tab */}
                            {activeTab === 'info' && (
                                <div className="animate-fadeIn">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">بيانات التواصل والشحن</h2>
                                        {!isEditing ? (
                                            <button onClick={() => setIsEditing(true)} className="text-xs font-bold uppercase tracking-widest text-black underline hover:text-gray-500 transition-colors">تعديل البيانات</button>
                                        ) : (
                                            <button onClick={handleUpdateProfile} disabled={isProcessing} className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2">
                                                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} حفظ
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                        <div className="border-b border-gray-200 pb-4">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">الاسم بالكامل</label>
                                            {isEditing ? (
                                                <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-gray-900 p-0" />
                                            ) : (
                                                <p className="font-bold text-gray-900">{user.user_metadata?.full_name || '—'}</p>
                                            )}
                                        </div>
                                        <div className="border-b border-gray-200 pb-4">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">رقم الهاتف</label>
                                            {isEditing ? (
                                                <input type="tel" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-gray-900 p-0" dir="ltr" />
                                            ) : (
                                                <p className="font-bold text-gray-900" dir="ltr">{user.user_metadata?.phone || '—'}</p>
                                            )}
                                        </div>
                                        <div className="border-b border-gray-200 pb-4 md:col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">العنوان الافتراضي</label>
                                            {isEditing ? (
                                                <textarea value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} rows="2" placeholder="المدينة، المنطقة، الشارع..." className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-gray-900 p-0 resize-none"></textarea>
                                            ) : (
                                                <p className="font-bold text-gray-900">{user.user_metadata?.address || <span className="text-gray-300 font-medium text-sm">لم يتم إضافة عنوان. يرجى إضافته لتسريع عملية الدفع.</span>}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">سجل الطلبات</h2>
                                    {myOrders.length === 0 ? (
                                        <div className="text-center py-20 border border-gray-100 bg-gray-50">
                                            <Package size={40} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">لا توجد طلبات سابقة</p>
                                        </div>
                                    ) : (
                                        myOrders.map(order => {
                                            const statusObj = getStatusStyle(order.status);
                                            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

                                            return (
                                                <div key={order.id} className="border border-gray-200 hover:border-black transition-colors duration-300">
                                                    {/* Header */}
                                                    <div className="bg-gray-50 p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-200">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">طلب رقم</p>
                                                            <p className="font-black text-gray-900">#{order.id.split('-')[0]}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">التاريخ</p>
                                                            <p className="font-bold text-gray-900 text-sm">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">الإجمالي</p>
                                                            <p className="font-black text-black">{order.total_amount} ج.م</p>
                                                        </div>
                                                        <div className={`px-3 py-1.5 border rounded-none text-[11px] font-bold flex items-center gap-1.5 ${statusObj.color} ${statusObj.border}`}>
                                                            {statusObj.icon} {statusObj.text}
                                                        </div>
                                                    </div>

                                                    {/* Items */}
                                                    <div className="p-6 divide-y divide-gray-100">
                                                        {items?.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-16 h-20 bg-gray-100 overflow-hidden">
                                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">{item.name}</p>
                                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Size: {item.selectedSize}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm font-black text-gray-900">{item.price} ج.م</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}

                            {/* 3. Coupons Tab */}
                            {activeTab === 'coupons' && (
                                <div className="animate-fadeIn">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                                        هدايا وقسائم خصم <span className="bg-black text-white text-[10px] px-2 py-1 uppercase tracking-widest">VIP</span>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {myCoupons.length === 0 ? (
                                            <div className="md:col-span-2 text-center py-20 border border-gray-100 bg-gray-50">
                                                <Ticket size={40} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
                                                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">لا توجد عروض حالياً</p>
                                            </div>
                                        ) : (
                                            myCoupons.map(coupon => (
                                                <div key={coupon.id} className={`relative bg-white border border-gray-200 p-6 flex flex-col group hover:border-black transition-colors ${coupon.user_phone ? 'border-yellow-400 bg-yellow-50/30' : ''}`}>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                                                            <Ticket size={20} />
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[10px] font-bold tracking-widest uppercase text-green-600 bg-green-50 px-2 py-1">فعال</span>
                                                            {coupon.user_phone && <span className="text-[9px] font-bold tracking-widest uppercase text-yellow-700 bg-yellow-100 px-2 py-1">هدية خاصة بك</span>}
                                                        </div>
                                                    </div>
                                                    <h3 className="text-3xl font-black text-black mb-1">{coupon.discount_amount} ج.م</h3>
                                                    <p className="text-gray-500 text-xs font-bold mb-8">خصم إضافي عند الشراء بمبلغ {coupon.min_order_amount} ج.م</p>

                                                    <div className="mt-auto pt-6 border-t border-dashed border-gray-200 flex justify-between items-center">
                                                        <span className="text-sm font-black tracking-widest text-gray-900">{coupon.code}</span>
                                                        <button onClick={() => { navigator.clipboard.writeText(coupon.code); alert('تم نسخ الكود!'); }} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline">
                                                            نسخ الكود
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // واجهة تسجيل الدخول / إنشاء الحساب (Editorial Look)
    // ==========================================
    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center py-20 px-4 animate-fadeIn">
            <div className="w-full max-w-lg bg-white p-10 md:p-14 shadow-2xl border border-gray-100">

                <div className="text-center mb-10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-3 block">Alsafa Portal</span>
                    <h1 className="text-3xl font-black text-gray-950 tracking-tighter mb-2">
                        {isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب'}
                    </h1>
                </div>

                <form onSubmit={isLoginMode ? handleSignIn : handleSignUp} className="space-y-6">
                    {!isLoginMode && (
                        <>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">الاسم بالكامل</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-0 py-3 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black font-bold text-sm transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">رقم الهاتف</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-0 py-3 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black font-bold text-sm transition-colors" dir="ltr" />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">البريد الإلكتروني</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-0 py-3 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black font-bold text-sm transition-colors text-left" dir="ltr" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">كلمة المرور (6 أحرف على الأقل)</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" className="w-full px-0 py-3 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black font-bold text-sm transition-colors text-left" dir="ltr" />
                    </div>

                    <button type="submit" disabled={isProcessing} className="w-full bg-black hover:bg-gray-800 text-white py-5 font-bold text-xs uppercase tracking-[0.2em] transition-colors flex justify-center items-center gap-3 mt-10 rounded-none shadow-xl">
                        {isProcessing && <Loader2 size={16} className="animate-spin" />}
                        {isProcessing ? 'جاري المعالجة...' : (isLoginMode ? 'تسجيل الدخول' : 'انضمام')}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest border-b border-gray-300 hover:border-black pb-1 transition-all">
                        {isLoginMode ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ تسجيل الدخول"}
                    </button>
                </div>
            </div>
        </div>
    );
}