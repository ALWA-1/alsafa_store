import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function About() {
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
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row">

                {/* صورة تعبيرية للمتجر تقرأ من الداش بورد */}
                <div className="md:w-1/2 h-64 md:h-auto relative">
                    <img
                        src={settings?.about_img || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80"}
                        alt="متجر الصفا"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-teal-900/20"></div>
                </div>

                {/* نص "من نحن" يقرأ من الداش بورد */}
                <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center text-right">
                    <span className="text-teal-600 font-bold tracking-widest text-sm uppercase mb-2">قصتنا</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                        {settings?.about_title || 'عن متجر الصفا (Alsafa)'}
                    </h2>
                    
                    {/* استخدام whitespace-pre-line لاحترام النزول لسطر جديد في التيكست إريا */}
                    <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8 whitespace-pre-line">
                        {settings?.about_text || 'نحن في متجر الصفا نؤمن بأن الأناقة لا يجب أن تأتي على حساب الراحة...'}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mt-auto">
                        <div className="border-r-4 border-teal-600 pr-4">
                            <h4 className="text-2xl font-extrabold text-gray-900">100%</h4>
                            <p className="text-gray-500 font-bold">جودة مضمونة</p>
                        </div>
                        <div className="border-r-4 border-teal-600 pr-4">
                            <h4 className="text-2xl font-extrabold text-gray-900">24/7</h4>
                            <p className="text-gray-500 font-bold">خدمة عملاء</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}