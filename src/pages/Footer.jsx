import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Footer() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single();
            if (data) setSettings(data);
        };
        fetchSettings();
    }, []);

    // تهيئة رابط الواتس اب ليكون صحيحاً برمجياً
    const whatsappLink = `https://wa.me/${settings?.contact_whatsapp || '201000000000'}`;

    return (
        <footer className="bg-black text-white pt-24 pb-12 border-t border-gray-800 text-right">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mb-20">

                    <div>
                        <h2 className="text-4xl font-black mb-6 tracking-tighter uppercase">
                            Alsafa<span className="font-light text-white/50">.</span>
                        </h2>
                        <p className="text-gray-400 font-medium leading-relaxed max-w-sm text-sm">
                            {settings?.store_description || 'وجهتك الأولى للأناقة والجودة في مصر. تسوق أحدث صيحات الموضة العالمية المصممة بعناية فائقة.'}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold mb-8 text-white uppercase tracking-widest">معلومات</h3>
                        <ul className="space-y-4 font-bold text-gray-400 text-xs uppercase tracking-widest">
                            <li><a href="#" className="hover:text-white transition-colors">الاسترجاع والاستبدال</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">طرق الدفع والشحن</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold mb-8 text-white uppercase tracking-widest">تواصل</h3>
                        <ul className="space-y-6 font-medium text-gray-400 text-sm">
                            <li className="flex items-start gap-4">
                                <MapPin className="text-white/70 shrink-0 mt-1" size={20} strokeWidth={1} />
                                <span className="leading-relaxed">{settings?.contact_address || 'القاهرة، مصر'}</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="text-white/70 shrink-0" size={20} strokeWidth={1} />
                                <span dir="ltr">{settings?.contact_phone || '+20 100 000 0000'}</span>
                            </li>
                            <li>
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-3 bg-white hover:bg-transparent hover:text-white border border-transparent hover:border-white text-black px-6 py-3 rounded-none text-xs font-bold uppercase tracking-widest transition-all shadow-xl mt-3"
                                >
                                    <MessageCircle size={18} />
                                    WhatsApp Support
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-10 text-center text-gray-600 font-medium text-xs tracking-widest uppercase">
                    <p>© {new Date().getFullYear()} Alsafa Haute Couture. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}