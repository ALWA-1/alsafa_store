// هذا السكربت يعمل في خلفية السيرفر (Node.js) وقت البناء فقط
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// تعريف __dirname في بيئة ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ خطأ: لم يتم العثور على روابط Supabase في ملف .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAndSaveData() {
    console.log("⏳ جاري سحب المنتجات والأقسام من Supabase وقت البناء...");

    try {
        const { data: products, error: pErr } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (pErr) throw pErr;

        const { data: categories, error: cErr } = await supabase
            .from('categories')
            .select('*, sub_categories(*)')
            .order('created_at', { ascending: true });
            
        if (cErr) throw cErr;

        const publicDir = path.join(__dirname, 'public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }

        fs.writeFileSync(path.join(publicDir, 'products.json'), JSON.stringify(products || []));
        fs.writeFileSync(path.join(publicDir, 'categories.json'), JSON.stringify(categories || []));

        console.log("✅ تم حفظ المنتجات والأقسام بنجاح في مجلد public!");

    } catch (error) {
        console.error("❌ حدث خطأ أثناء سحب البيانات:", error.message);
        process.exit(1);
    }
}

fetchAndSaveData();