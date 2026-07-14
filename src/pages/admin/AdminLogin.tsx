import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GenericHeader from "../../components/layout/GenericHeader";
import { useLanguage } from "../../context/LanguageContext";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";

const ADMIN_UID = "28501153-8038-4e13-86cc-8b400a1b92c7";

export default function AdminLogin() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).error) {
      setError((location.state as any).error);
    }
  }, [location]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (session.user?.id === ADMIN_UID) {
          navigate("/admin/dashboard");
        } else {
          supabase.auth.signOut().then(() => {
            setError(
              lang === "en"
                ? "You are not authorized to access the Admin Panel."
                : "آپ کو ایڈمن پینل تک رسائی کی اجازت نہیں ہے۔"
            );
          });
        }
      }
    });
  }, [navigate, lang]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        if (data.user.id === ADMIN_UID) {
          navigate("/admin/dashboard");
        } else {
          await supabase.auth.signOut();
          setError(
            lang === "en"
              ? "You are not authorized to access the Admin Panel."
              : "آپ کو ایڈمن پینل تک رسائی کی اجازت نہیں ہے۔"
          );
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <GenericHeader titleEn="Admin Login" titleUr="ایڈمن لاگ ان" />
      
      <div className="max-w-md mx-auto px-4 py-10">
        {!isSupabaseConfigured && (
          <div className="mb-6 p-5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-sm leading-relaxed shadow-sm">
            <h4 className="font-bold text-amber-950 mb-1 flex items-center gap-1">
              ⚠️ Supabase Config Missing on Vercel
            </h4>
            <p className="mb-2">
              If you already added the variables in Vercel settings, you <strong>MUST deploy/redeploy</strong> your site on Vercel again. 
              Vercel does not dynamically update environment variables without rebuilding the React file bundle.
            </p>
            <p className="mb-2 font-semibold">
              Steps to fix:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Ensure variables are named exactly: <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (with the <code>VITE_</code> prefix).</li>
              <li>Go to Vercel Dashboard &rarr; <strong>Deployments</strong> &rarr; Click <strong>Redeploy</strong> to bundle files with the new variables.</li>
            </ul>
            <div className="border-t border-amber-200 my-3"></div>
            <h4 className="font-bold text-amber-950 mb-1 font-urdu text-right">
              سکیورٹی ویریبلز کی سیٹنگز ⚠️
            </h4>
            <p className="font-urdu text-right leading-loose">
              اگر آپ ورسل (Vercel) پر ویریبل شامل کر چکے ہیں، تو آپ کو ورسل پر ویب سائٹ دوبارہ <strong>Redeploy</strong> کرنی ہوگی۔ ورسل پر جب تک دوبارہ پراجیکٹ بلڈ (Build) نہیں کریں گے تب تک یہ نئے ویریبلز کو ایکٹیو نہیں کرے گا۔ یہ یاد رکھیں کہ ویریبل کے نام بالکل ٹھیک <code>VITE_SUPABASE_URL</code> اور <code>VITE_SUPABASE_ANON_KEY</code> ہونے چاہئیں۔
            </p>
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                 {lang === "en" ? "Email" : "ای میل"}
              </label>
              <input 
                required 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@muftimunirshakir.com"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                 {lang === "en" ? "Password" : "پاس ورڈ"}
              </label>
              <input 
                required 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium bg-red-50 border border-red-200 p-3 rounded text-center">
                {error}
              </div>
            )}
            
            <button type="submit" className="w-full bg-primary-800 text-white font-bold py-3 rounded-md hover:bg-primary-900 transition-colors">
              {lang === "en" ? "Login" : "لاگ ان کریں"}
            </button>
            <p className="text-sm text-center text-gray-500 mt-4">
              {lang === "en" 
                 ? "Note: Secure area restricted to authorized personnel." 
                 : "نوٹ: یہ ایک محفوظ علاقہ ہے، صرف مجاز افراد کے لیے ہے۔"}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
