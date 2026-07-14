import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Footer() {
  const { lang, t } = useLanguage();
  const { sections } = useSettings();

  const [footerAboutEn, setFooterAboutEn] = useState("Dedicated to spreading the true teachings of Islam, providing spiritual guidance, and serving the community through knowledge.");
  const [footerAboutUr, setFooterAboutUr] = useState("اسلام کی حقیقی تعلیمات پھیلانے، روحانی رہنمائی فراہم کرنے اور علم کے ذریعے معاشرے کی خدمت کے لیے وقف۔");

  const [contactEn, setContactEn] = useState("ahmadshakir4466@gmail.com\n+92 302 4620110\nLahore, Pakistan");
  const [contactUr, setContactUr] = useState("ahmadshakir4466@gmail.com\n+92 302 4620110\nلاہور، پاکستان");

  const [scholarNameEn, setScholarNameEn] = useState("Mufti Munir Shakir");
  const [scholarNameUr, setScholarNameUr] = useState("مفتی منیر شاکر");

  const [socials, setSocials] = useState({
    youtube: "https://www.youtube.com/@muftimunirshakirofficial",
    facebook: "https://www.facebook.com/share/18rkyR6hpM/",
    twitter: "https://x.com/MuftiMunir2025",
    whatsapp: "https://wa.link/vr8sak"
  });

  const fetchFooterData = async () => {
    try {
      const { data } = await supabase.from("page_content").select("*");
      if (data && data.length > 0) {
        // Footer About
        const ftrAbt = data.find(r => r.page_name === "footer_about");
        if (ftrAbt) {
          setFooterAboutEn(ftrAbt.content_en || footerAboutEn);
          setFooterAboutUr(ftrAbt.content_ur || footerAboutUr);
        }

        // Footer Contact
        const ftrCtc = data.find(r => r.page_name === "footer_contact");
        if (ftrCtc) {
          setContactEn(ftrCtc.content_en || contactEn);
          setContactUr(ftrCtc.content_ur || contactUr);
        }

        // Scholar Name
        const genRec = data.find(r => r.page_name === "site_general");
        if (genRec) {
          setScholarNameEn(genRec.title_en || scholarNameEn);
          setScholarNameUr(genRec.title_ur || scholarNameUr);
        }

        // Socials
        const socRec = data.find(r => r.page_name === "site_socials");
        if (socRec) {
          setSocials({
            youtube: socRec.title_en || socials.youtube,
            facebook: socRec.title_ur || socials.facebook,
            twitter: socRec.content_en || socials.twitter,
            whatsapp: socRec.content_ur || socials.whatsapp
          });
        }
      }
    } catch (err) {
      console.error("Error loading footer content:", err);
    }
  };

  useEffect(() => {
    fetchFooterData();
    const ch = supabase.channel('footer-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'page_content' }, fetchFooterData).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return (
    <footer className="bg-gray-900 text-white mt-auto pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-400">
              {lang === "en" ? scholarNameEn : scholarNameUr}
            </h3>
            <div className="text-gray-400 text-sm leading-relaxed mb-6 whitespace-pre-line">
              {lang === "en" ? footerAboutEn : footerAboutUr}
            </div>
            
            <h4 className="font-bold mb-3">{lang === "en" ? "Follow Us" : "ہمیں فالو کریں"}</h4>
            <div className="flex gap-4">
              {socials.youtube && (
                <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="X (Twitter)">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                </a>
              )}
              {socials.whatsapp && (
                <a href={socials.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </a>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {sections.bio && <li><Link to="/about" className="hover:text-primary-400">{t("bio")}</Link></li>}
              {sections.articles && <li><Link to="/articles" className="hover:text-primary-400">{t("articles")}</Link></li>}
              {sections.videos && <li><Link to="/videos" className="hover:text-primary-400">{t("videos")}</Link></li>}
              {sections.quran && <li><Link to="/quran" className="hover:text-primary-400">{t("quran")}</Link></li>}
              {sections.hadith && <li><Link to="/hadith" className="hover:text-primary-400">{t("hadith")}</Link></li>}
              {sections.books && <li><Link to="/books" className="hover:text-primary-400">{t("books")}</Link></li>}
              {sections.contact && <li><Link to="/donate" className="hover:text-primary-400">{t("donate")}</Link></li>}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t("contactUs")}</h3>
            <div className="space-y-2 text-sm text-gray-400 whitespace-pre-line leading-loose">
              {lang === "en" ? contactEn : contactUr}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {lang === "en" ? `${scholarNameEn} Official Website` : `${scholarNameUr} آفیشل ویب سائٹ`}. {t("allRightsReserved")}.</p>
        </div>
      </div>
    </footer>
  );
}
