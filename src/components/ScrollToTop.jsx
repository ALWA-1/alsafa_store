import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  // بنجيب مسار الصفحة الحالية
  const { pathname } = useLocation();

  // أول ما المسار يتغير، بنأمر المتصفح يطلع لأول الصفحة فوراً
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // المكون ده ملوش شكل مرئي، هو بيشتغل في الخلفية بس
  return null;
}