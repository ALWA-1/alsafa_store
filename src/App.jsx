import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CheckCircle, X } from 'lucide-react';

import { supabase } from './supabaseClient';

import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Footer from "./pages/Footer";
import ProductDetails from './pages/ProductDetails';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import Profile from './pages/Profile';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [dbProducts, setDbProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const fetchAndLoadData = async () => {
      try {
        let fetchedProducts = [];
        let fetchedCategories = [];

        try {
          // 1. المحاولة الأولى: سحب البيانات بسرعة الصاروخ من ملفات Netlify/Vercel
          const [prodRes, catRes] = await Promise.all([
            fetch('/products.json').then(res => res.ok ? res.json() : null),
            fetch('/categories.json').then(res => res.ok ? res.json() : null)
          ]);

          if (prodRes && catRes) {
            fetchedProducts = prodRes;
            fetchedCategories = catRes;
          } else {
            throw new Error("ملفات JSON غير موجودة، جاري التبديل لقاعدة البيانات...");
          }
        } catch (e) {
          // 2. خطة الطوارئ: (لبيئة التطوير Localhost) السحب من Supabase
          const [pRes, cRes] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('categories').select('*, sub_categories(*)').order('created_at', { ascending: true })
          ]);
          fetchedProducts = pRes.data || [];
          fetchedCategories = cRes.data || [];
        }

        setDbProducts(fetchedProducts);
        setDbCategories(fetchedCategories);

        const criticalImages = [
          'https://images.unsplash.com/photo-1633655442136-bbc120229009?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1600&q=80'
        ];

        fetchedProducts.forEach((p) => { if (p.image) criticalImages.push(p.image); });
        fetchedCategories.forEach((c) => { if (c.image_url) criticalImages.push(c.image_url); });

        const preloadImage = (url) => new Promise((resolve) => {
          const img = new Image(); img.src = url; img.onload = resolve; img.onerror = resolve;
        });

        const imagePromises = criticalImages.map(url => preloadImage(url));
        const minTime = new Promise(resolve => setTimeout(resolve, 1500));
        const maxTime = new Promise(resolve => setTimeout(resolve, 7000));

        await Promise.race([
          Promise.all([Promise.all(imagePromises), minTime]),
          maxTime
        ]);
      } catch (error) {
        console.error("Error loading DB assets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndLoadData();
    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const addToCart = (product) => {
    setCart([...cart, product]);
    showNotification(`تم إضافة ${product.name} (مقاس ${product.selectedSize}) للسلة!`);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApplyCoupon = async (code) => {
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        setCouponError("كود غير صالح أو غير مفعل");
        setAppliedCoupon(null);
        return;
      }

      if (data.is_auto_generated && data.is_used) {
        setCouponError("تم استخدام هذا الكود من قبل");
        return;
      }

      const userPhone = user?.user_metadata?.phone;
      if (data.user_phone && data.user_phone !== userPhone) {
        setCouponError("عذراً، هذا الكود مخصص لعميل آخر");
        return;
      }

      const cartTotal = cart.reduce((total, item) => total + item.price, 0);
      if (data.min_order_amount && cartTotal < data.min_order_amount) {
        setCouponError(`الحد الأدنى لاستخدام الكود هو ${data.min_order_amount} د.ك`);
        return;
      }

      setAppliedCoupon(data);
    } catch (err) { 
      setCouponError("حدث خطأ في التحقق من الكود"); 
    } finally { 
      setIsApplyingCoupon(false); 
    }
  };

  // 🤖 دالة إرسال الإشعار لتليجرام
  const sendTelegramNotification = async (orderData) => {
    // جلب المتغيرات من Vercel (ملاحظة: إذا كنت تختبر على جهازك تأكد من إضافتها لملف .env)
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("تنبيه: إعدادات بوت التليجرام مفقودة.");
      return;
    }

    // تجميع أسماء المنتجات لتظهر في الرسالة
    const itemsList = orderData.items.map(item => `- ${item.name} (مقاس: ${item.selectedSize}) | السعر: ${item.price} د.ك`).join('\n');

    const message = `
🛍️ *طلب جديد من متجر الصفا!* 🛍️

👤 *اسم العميل:* ${orderData.customer_name}
📞 *رقم الهاتف:* ${orderData.phone}
📞 *رقم بديل:* ${orderData.customer_phone_2 || 'لا يوجد'}
📍 *العنوان:* ${orderData.address}

📦 *تفاصيل المنتجات:*
${itemsList}

💰 *إجمالي الطلب:* ${orderData.total_amount} د.ك
${orderData.coupon_code ? `🏷️ *كوبون مستخدم:* ${orderData.coupon_code} (خصم ${orderData.discount_amount} د.ك)` : ''}
📝 *ملاحظات:* ${orderData.notes || 'لا يوجد'}

🔗 *لمراجعة التفاصيل، يرجى فتح لوحة التحكم.*
    `;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      console.log("تم إرسال إشعار التليجرام بنجاح!");
    } catch (error) {
      console.error("خطأ في إرسال إشعار التليجرام:", error);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    const phoneVal = e.target.elements[0].value;
    const addressVal = e.target.elements[1].value;
    const phone2Val = e.target.elements[2].value;
    const notesVal = e.target.elements[3].value;

    try {
      const cartTotal = cart.reduce((total, item) => total + item.price, 0);
      const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
      const finalTotal = cartTotal - discount;

      const orderData = {
        user_id: user?.id || null,
        customer_name: user?.user_metadata?.full_name || 'عميل المتجر',
        phone: phoneVal,
        customer_phone: phoneVal,
        address: addressVal,
        customer_address: addressVal,
        customer_phone_2: phone2Val,
        notes: notesVal,
        items: cart,
        total_amount: finalTotal,
        coupon_code: appliedCoupon?.code || null,
        discount_amount: discount,
        status: 'pending'
      };

      // 1. تسجيل الطلب في قاعدة البيانات
      const { error } = await supabase.from('orders').insert([orderData]);
      if (error) throw error;

      // 2. إرسال الإشعار إلى بوت التليجرام
      await sendTelegramNotification(orderData);

      if (appliedCoupon && appliedCoupon.is_auto_generated) {
        await supabase.from('coupons').update({ is_used: true }).eq('id', appliedCoupon.id);
      }

      if (user) {
        const { data: pastOrders } = await supabase.from('orders').select('total_amount').eq('customer_phone', phoneVal);
        const totalLifetimeSpend = (pastOrders || []).reduce((sum, o) => sum + Number(o.total_amount), 0) + finalTotal;

        const { data: tiers } = await supabase.from('loyalty_tiers').select('*');
        
        if (tiers) {
          for (let tier of tiers) {
            if (totalLifetimeSpend >= tier.spend_threshold) {
              const rewardCode = `VIP-${tier.spend_threshold}-${phoneVal.slice(-4)}`;
              
              const { data: existing } = await supabase.from('coupons').select('id').eq('code', rewardCode).single();
              
              if (!existing) {
                await supabase.from('coupons').insert([{
                  code: rewardCode,
                  discount_amount: tier.reward_amount,
                  min_order_amount: tier.spend_threshold / 2,
                  user_phone: phoneVal,
                  is_auto_generated: true,
                  is_active: true,
                  is_used: false
                }]);
              }
            }
          }
        }
      }

      setIsOrderSubmitted(true);
      setTimeout(() => {
        setIsCheckoutModalOpen(false);
        setIsOrderSubmitted(false);
        setCart([]);
        setAppliedCoupon(null);
      }, 4000);

    } catch (error) {
      console.error('Error saving order:', error);
      alert(`عذراً، لم يتم الطلب. رسالة السيرفر: ${error.message}`);
    }
  };

  return (
    <Router>
      <ScrollToTop />

      <div className={`fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-center animate-pulse">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-4">
            Alsafa<span className="font-light text-white/50">.</span>
          </h1>
          <p className="text-white/60 text-xs md:text-sm tracking-[0.4em] uppercase">Loading The Collection...</p>
        </div>
      </div>

      <div dir="rtl" className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-gray-200 selection:text-gray-900">

        {notification && (
          <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-xl flex items-center gap-3 font-bold shadow-2xl z-[200] animate-bounce-in">
            <CheckCircle size={22} className="text-white" />
            {notification}
          </div>
        )}

        <Navbar cartCount={cart.length} setIsCartOpen={setIsCartOpen} />

        <CartDrawer
          cart={cart}
          removeFromCart={removeFromCart}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          openCheckout={() => setIsCheckoutModalOpen(true)}
          user={user}
          appliedCoupon={appliedCoupon}
          handleApplyCoupon={handleApplyCoupon}
          couponError={couponError}
          isApplyingCoupon={isApplyingCoupon}
        />

        {isCheckoutModalOpen && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-[200] p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg p-6 md:p-8 rounded-none shadow-2xl relative animate-scale-up border border-gray-100 my-auto">
              <button className="absolute top-4 left-4 p-2 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors rounded-none" onClick={() => setIsCheckoutModalOpen(false)}>
                <X size={20} />
              </button>

              {!isOrderSubmitted ? (
                <>
                  <h2 className="text-3xl font-black text-gray-950 mb-2 uppercase tracking-tighter">تأكيد الطلب</h2>
                  <p className="text-gray-500 text-xs font-bold mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">أكمل بيانات الشحن والملاحظات</p>

                  <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">رقم الهاتف الأساسي</label>
                      <input type="tel" required defaultValue={user?.user_metadata?.phone || ''} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black transition-all font-bold text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-950 mb-1.5 uppercase tracking-widest">العنوان بالتفصيل (مطلوب)</label>
                      <textarea required placeholder="المحافظة، المدينة، اسم الشارع، رقم العمارة..." rows="2" defaultValue={user?.user_metadata?.address || ''} className="w-full px-4 py-3 bg-white border border-gray-300 focus:outline-none focus:border-black transition-all resize-none font-bold text-sm"></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">رقم هاتف آخر للتواصل <span className="text-gray-400 font-normal">(اختياري)</span></label>
                      <input type="tel" placeholder="رقم بديل للمندوب..." className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-black transition-all font-bold text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">ملاحظات مع الطلب <span className="text-gray-400 font-normal">(اختياري)</span></label>
                      <textarea placeholder="مثال: يرجى التوصيل بعد الساعة 5 مساءً، أو ملاحظة بخصوص المقاس..." rows="2" className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-black transition-all resize-none text-sm"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 shadow-xl transition-colors mt-2 uppercase tracking-[0.2em] rounded-none">تأكيد الطلب الآن</button>
                  </form>
                </>
              ) : (
                <div className="text-center py-10">
                  <CheckCircle size={80} className="mx-auto text-black mb-6" strokeWidth={1} />
                  <h2 className="text-3xl font-black text-gray-950 mb-3 tracking-tighter">تم استلام طلبك!</h2>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">شكراً لثقتك في Alsafa. سنتواصل معك لتأكيد الشحن.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <main className="flex-grow pt-20 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} products={dbProducts} categories={dbCategories} />} />
            <Route path="/shop" element={<Shop addToCart={addToCart} products={dbProducts} categories={dbCategories} />} />
            <Route path="/about" element={<About />} />
            <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} products={dbProducts} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
