import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Send } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Contact() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single();
            if (data) setSettings(data);
        };
        fetchSettings();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn">

            <div className="text-center mb-16">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">يسعدنا تواصلك معنا</h1>
                <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                    فريق خدمة العملاء لدينا جاهز دائماً للرد على استفساراتك ومساعدتك في أي وقت.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-1/3 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-right">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">معلومات الاتصال</h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-teal-50 p-3 rounded-full text-teal-600 shrink-0"><MapPin size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">العنوان</h4>
                                    <p className="text-gray-600 font-medium leading-relaxed">{settings?.contact_address || '15 شارع جمال عبدالناصر، القاهرة'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-teal-50 p-3 rounded-full text-teal-600 shrink-0"><Phone size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">رقم الهاتف</h4>
                                    <p className="text-gray-600 font-medium" dir="ltr">{settings?.contact_phone || '+20 100 000 0000'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-teal-50 p-3 rounded-full text-teal-600 shrink-0"><Clock size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">ساعات العمل</h4>
                                    <p className="text-gray-600 font-medium">يومياً من 10 صباحاً حتى 10 مساءً</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-2/3">
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 text-right">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h3>
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-bold text-gray-700 mb-2">الاسم بالكامل</label><input type="text" required className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium" placeholder="أدخل اسمك هنا" /></div>
                                <div><label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label><input type="tel" required className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium" placeholder="مثال: 01012345678" /></div>
                            </div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">موضوع الرسالة</label><input type="text" required className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium" placeholder="عن ماذا تستفسر؟" /></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">تفاصيل الرسالة</label><textarea required rows="5" className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all font-medium resize-none" placeholder="اكتب تفاصيل رسالتك هنا..."></textarea></div>
                            <button type="submit" className="w-full md:w-auto px-8 bg-gray-900 hover:bg-teal-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors">
                                إرسال الرسالة <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}