import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase, uploadImageToStorage } from "../../lib/supabase";
import { Save, Globe, Youtube, Facebook, Chrome, MessageSquare, AlertCircle, Image as ImageIcon, Loader, X } from "lucide-react";
import { compressImage } from "../../lib/utils";
import TextFormattingToolbar from "../../components/admin/TextFormattingToolbar";
import ImageCropperModal from "../../components/admin/ImageCropperModal";

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  // Image Cropper States
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // 1. General & Contact Settings
  const [general, setGeneral] = useState({
    nameEn: "Mufti Munir Shakir",
    nameUr: "مفتی منیر شاکر",
    email: "ahmadshakir4466@gmail.com",
    phone: "+92 302 4620110",
    addressEn: "Lahore, Pakistan",
    addressUr: "لاہور، پاکستان"
  });

  // 2. Hero Section
  const [hero, setHero] = useState({
    titleEn: "Welcome to the Official Website of\nMufti Munir Shakir",
    titleUr: "آفیشل ویب سائٹ پر خوش آمدید\nمفتی منیر شاکر",
    descEn: "Discover authentic Islamic teachings, listen to inspiring bayans, and stay updated with the latest events and news.",
    descUr: "مستند اسلامی تعلیمات دریافت کریں، متاثر کن بیانات سنیں اور تازہ ترین پروگرامز اور خبروں سے باخبر رہیں۔",
    imgUrl: "https://images.unsplash.com/photo-1564600350352-0ceed9a117cb?auto=format&fit=crop&q=80&w=2000"
  });

  // 3. Footer Text
  const [footerContent, setFooterContent] = useState({
    aboutEn: "Dedicated to spreading the true teachings of Islam, providing spiritual guidance, and serving the community through knowledge.",
    aboutUr: "اسلام کی حقیقی تعلیمات پھیلانے، روحانی رہنمائی فراہم کرنے اور علم کے ذریعے معاشرے کی خدمت کے لیے وقف۔",
    contactEn: "ahmadshakir4466@gmail.com\n+92 302 4620110\nLahore, Pakistan",
    contactUr: "ahmadshakir4466@gmail.com\n+92 302 4620110\nلاہور، پاکستان"
  });

  // 4. Social Media links
  const [socials, setSocials] = useState({
    youtube: "https://www.youtube.com/@muftimunirshakirofficial",
    facebook: "https://www.facebook.com/share/18rkyR6hpM/",
    twitter: "https://x.com/MuftiMunir2025",
    whatsapp: "https://wa.link/vr8sak"
  });

  useEffect(() => {
    async function fetchAllSettings() {
      try {
        const { data, error } = await supabase.from("page_content").select("*");
        if (error) throw error;
        if (data && data.length > 0) {
          // General
          const genRec = data.find(r => r.page_name === "site_general");
          if (genRec) {
            setGeneral(prev => ({
              ...prev,
              nameEn: genRec.title_en || prev.nameEn,
              nameUr: genRec.title_ur || prev.nameUr,
              email: genRec.content_en || prev.email,
              phone: genRec.content_ur || prev.phone
            }));
          }

          // Address
          const adrRec = data.find(r => r.page_name === "site_address");
          if (adrRec) {
            setGeneral(prev => ({
              ...prev,
              addressEn: adrRec.content_en || prev.addressEn,
              addressUr: adrRec.content_ur || prev.addressUr
            }));
          }

          // Socials
          const socRec = data.find(r => r.page_name === "site_socials");
          if (socRec) {
            setSocials(prev => ({
              youtube: socRec.title_en || prev.youtube,
              facebook: socRec.title_ur || prev.facebook,
              twitter: socRec.content_en || prev.twitter,
              whatsapp: socRec.content_ur || prev.whatsapp
            }));
          }

          // Hero
          const heroRec = data.find(r => r.page_name === "home_hero");
          if (heroRec) {
            setHero(prev => ({
              ...prev,
              titleEn: heroRec.title_en || prev.titleEn,
              titleUr: heroRec.title_ur || prev.titleUr,
              descEn: heroRec.content_en || prev.descEn,
              descUr: heroRec.content_ur || prev.descUr
            }));
          }

          const heroImg = data.find(r => r.page_name === "home_hero_image");
          if (heroImg) {
            setHero(prev => ({ ...prev, imgUrl: heroImg.content_en || prev.imgUrl }));
          }

          // Footer
          const ftrAbt = data.find(r => r.page_name === "footer_about");
          if (ftrAbt) {
            setFooterContent(prev => ({
              ...prev,
              aboutEn: ftrAbt.content_en || prev.aboutEn,
              aboutUr: ftrAbt.content_ur || prev.aboutUr
            }));
          }

          const ftrCtc = data.find(r => r.page_name === "footer_contact");
          if (ftrCtc) {
            setFooterContent(prev => ({
              ...prev,
              contactEn: ftrCtc.content_en || prev.contactEn,
              contactUr: ftrCtc.content_ur || prev.contactUr
            }));
          }
        }
      } catch (err: any) {
        console.error("Error fetching homepage configs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllSettings();
  }, []);

  const handleHeroImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropperFile(file);
      setIsCropperOpen(true);
      e.target.value = ""; // Clear input so same file selection triggers event again
    }
  };

  const handleSaveAll = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", text: "" });

    // Save hero image to Supabase Storage if it contains new base64 data
    let finalHeroImgUrl = hero.imgUrl;
    if (hero.imgUrl && hero.imgUrl.startsWith("data:")) {
      finalHeroImgUrl = await uploadImageToStorage(hero.imgUrl, "hero");
      setHero(prev => ({ ...prev, imgUrl: finalHeroImgUrl }));
    }

    const rows = [
      {
        page_name: "site_general",
        title_en: general.nameEn,
        title_ur: general.nameUr,
        content_en: general.email,
        content_ur: general.phone
      },
      {
        page_name: "site_address",
        title_en: "Contact Address",
        title_ur: "رابطہ کا پتہ",
        content_en: general.addressEn,
        content_ur: general.addressUr
      },
      {
        page_name: "site_socials",
        title_en: socials.youtube,
        title_ur: socials.facebook,
        content_en: socials.twitter,
        content_ur: socials.whatsapp
      },
      {
        page_name: "home_hero",
        title_en: hero.titleEn,
        title_ur: hero.titleUr,
        content_en: hero.descEn,
        content_ur: hero.descUr
      },
      {
        page_name: "home_hero_image",
        title_en: "Hero Background Image",
        title_ur: "ہیرو تصویر",
        content_en: finalHeroImgUrl,
        content_ur: ""
      },
      {
        page_name: "footer_about",
        title_en: "Footer About En",
        title_ur: "ہمارے بارے میں فوٹر",
        content_en: footerContent.aboutEn,
        content_ur: footerContent.aboutUr
      },
      {
        page_name: "footer_contact",
        title_en: "Footer Contact En",
        title_ur: "رابطہ معلومات فوٹر",
        content_en: footerContent.contactEn,
        content_ur: footerContent.contactUr
      }
    ];

    try {
      const { error } = await supabase.from("page_content").upsert(rows, { onConflict: "page_name" });
      if (error) throw error;
      
      setStatus({ type: "success", text: "Home page settings successfully saved!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setStatus({ type: "", text: "" }), 5000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to save settings: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
        <Loader className="animate-spin text-primary-800" size={36} />
        <p className="text-sm font-medium">Loading settings dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveAll} className="max-w-5xl space-y-10 pb-24 relative">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Website Customizer</h1>
          <p className="text-gray-500 text-sm mt-1">Manage general credentials, hero headers, footer descriptions, and channels links.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary-800 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-primary-900 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>

      {status.text && (
        <div className={`p-4 rounded-xl font-medium text-sm flex items-start gap-3 border ${status.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{status.text}</span>
        </div>
      )}

      {/* 1. General Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <Globe className="text-primary-800" size={20} />
          <h2 className="text-base font-bold text-gray-800">General Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Scholar Name (English)</label>
            <input
              type="text"
              value={general.nameEn}
              onChange={e => setGeneral({ ...general, nameEn: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div dir="rtl">
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-right">مفتی / نام الشریف (Urdu)</label>
            <input
              type="text"
              value={general.nameUr}
              onChange={e => setGeneral({ ...general, nameUr: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={general.email}
              onChange={e => setGeneral({ ...general, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={general.phone}
              onChange={e => setGeneral({ ...general, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Address (English)</label>
            <input
              type="text"
              value={general.addressEn}
              onChange={e => setGeneral({ ...general, addressEn: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div dir="rtl">
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-right">رابطہ کا پتہ (Urdu)</label>
            <input
              type="text"
              value={general.addressUr}
              onChange={e => setGeneral({ ...general, addressUr: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <ImageIcon className="text-primary-800" size={20} />
          <h2 className="text-base font-bold text-gray-800">Hero Header Details</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-705 mb-1">Hero Title Heading (English)</label>
              <TextFormattingToolbar 
                textareaId="hero_title_en"
                value={hero.titleEn}
                onChange={val => setHero({ ...hero, titleEn: val })}
                lang="en"
              />
              <textarea
                id="hero_title_en"
                value={hero.titleEn}
                onChange={e => setHero({ ...hero, titleEn: e.target.value })}
                rows={3}
                className="w-full border-b border-x border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-705 mb-1 text-right font-urdu" dir="rtl">ہیرو جلی عنوان (Urdu)</label>
              <TextFormattingToolbar 
                textareaId="hero_title_ur"
                value={hero.titleUr}
                onChange={val => setHero({ ...hero, titleUr: val })}
                lang="ur"
              />
              <textarea
                id="hero_title_ur"
                value={hero.titleUr}
                onChange={e => setHero({ ...hero, titleUr: e.target.value })}
                rows={3}
                className="w-full border-b border-x border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-705 mb-1">Hero Description Paragraph (English)</label>
              <TextFormattingToolbar 
                textareaId="hero_desc_en"
                value={hero.descEn}
                onChange={val => setHero({ ...hero, descEn: val })}
                lang="en"
              />
              <textarea
                id="hero_desc_en"
                value={hero.descEn}
                onChange={e => setHero({ ...hero, descEn: e.target.value })}
                rows={4}
                className="w-full border-b border-x border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 text-right font-urdu" dir="rtl">ہیرو مختصر تعارف (Urdu)</label>
              <TextFormattingToolbar 
                textareaId="hero_desc_ur"
                value={hero.descUr}
                onChange={val => setHero({ ...hero, descUr: val })}
                lang="ur"
              />
              <textarea
                id="hero_desc_ur"
                value={hero.descUr}
                onChange={e => setHero({ ...hero, descUr: e.target.value })}
                rows={4}
                className="w-full border-b border-x border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm"
                dir="rtl"
              />
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Configure Hero Background</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex-1">
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Direct Wallpaper Photo Upload</span>
                <input 
                  type="file" 
                  id="hero_image_input"
                  accept="image/*" 
                  onChange={handleHeroImageChange} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-800 file:text-white hover:file:bg-primary-950 cursor-pointer" 
                />
              </div>
              {hero.imgUrl ? (
                <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-300 shadow-inner shrink-0 bg-white group shadow-md shadow-inner">
                  <img src={hero.imgUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setHero(prev => ({ ...prev, imgUrl: "" }));
                      const inp = document.getElementById("hero_image_input") as HTMLInputElement;
                      if (inp) inp.value = "";
                    }} 
                    className="absolute top-1 right-1 bg-red-655 text-white p-1 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-lg cursor-pointer flex items-center justify-center w-5 h-5 z-10"
                    title="Remove Image"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 bg-white text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <Save className="text-primary-800" size={20} />
          <h2 className="text-base font-bold text-gray-800">Footer Columns Content</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-705 mb-1">Footer About Text (English)</label>
            <TextFormattingToolbar 
              textareaId="footer_about_en"
              value={footerContent.aboutEn}
              onChange={val => setFooterContent({ ...footerContent, aboutEn: val })}
              lang="en"
            />
            <textarea
              id="footer_about_en"
              value={footerContent.aboutEn}
              onChange={e => setFooterContent({ ...footerContent, aboutEn: e.target.value })}
              rows={4}
              className="w-full border-b border-x border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-right font-urdu" dir="rtl">تعارف فوٹر (Urdu)</label>
            <TextFormattingToolbar 
              textareaId="footer_about_ur"
              value={footerContent.aboutUr}
              onChange={val => setFooterContent({ ...footerContent, aboutUr: val })}
              lang="ur"
            />
            <textarea
              id="footer_about_ur"
              value={footerContent.aboutUr}
              onChange={e => setFooterContent({ ...footerContent, aboutUr: e.target.value })}
              rows={4}
              className="w-full border-b border-x border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-705 mb-1">Footer Contact Text (English)</label>
            <TextFormattingToolbar 
              textareaId="footer_contact_en"
              value={footerContent.contactEn}
              onChange={val => setFooterContent({ ...footerContent, contactEn: val })}
              lang="en"
            />
            <textarea
              id="footer_contact_en"
              value={footerContent.contactEn}
              onChange={e => setFooterContent({ ...footerContent, contactEn: e.target.value })}
              rows={4}
              className="w-full border-b border-x border-gray-350 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-right font-urdu" dir="rtl">رابطہ کالم فوٹر (Urdu)</label>
            <TextFormattingToolbar 
              textareaId="footer_contact_ur"
              value={footerContent.contactUr}
              onChange={val => setFooterContent({ ...footerContent, contactUr: val })}
              lang="ur"
            />
            <textarea
              id="footer_contact_ur"
              value={footerContent.contactUr}
              onChange={e => setFooterContent({ ...footerContent, contactUr: e.target.value })}
              rows={4}
              className="w-full border-b border-x border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* 4. Social Links */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <Youtube className="text-primary-800" size={20} />
          <h2 className="text-base font-bold text-gray-800">Social Channels URLs</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Youtube size={16} className="text-red-500" /> YouTube Channel Link</label>
            <input
              type="text"
              value={socials.youtube}
              onChange={e => setSocials({ ...socials, youtube: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Facebook size={16} className="text-blue-600" /> Facebook Page Link</label>
            <input
              type="text"
              value={socials.facebook}
              onChange={e => setSocials({ ...socials, facebook: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Chrome size={16} className="text-slate-800" /> Twitter/X Link</label>
            <input
              type="text"
              value={socials.twitter}
              onChange={e => setSocials({ ...socials, twitter: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><MessageSquare size={16} className="text-emerald-500" /> WhatsApp Link/Number</label>
            <input
              type="text"
              value={socials.whatsapp}
              onChange={e => setSocials({ ...socials, socials: e.target.value } as any)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Save Action Frame */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-gray-200 p-4 shrink-0 flex justify-between items-center z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <span className="text-xs md:text-sm text-gray-500 font-medium">Updates are synchronized immediately.</span>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary-800 hover:bg-primary-900 font-bold py-3 px-8 text-sm md:text-base rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>

      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setCropperFile(null);
        }}
        imageFile={cropperFile}
        defaultAspectRatio={16/9} // Hero banner images are wide
        onCrop={(croppedBase64) => {
          setHero(prev => ({ ...prev, imgUrl: croppedBase64 }));
        }}
      />
    </form>
  );
}
