import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase, uploadImageToStorage } from "../../lib/supabase";
import { 
  Save, Image as ImageIcon, Award, BookOpen, Sparkles, CheckCircle, AlertCircle, 
  Loader, X, Plus, Trash2, Edit2, Bookmark, HelpCircle 
} from "lucide-react";
import { compressImage, getDynamicIcon } from "../../lib/utils";
import TextFormattingToolbar from "../../components/admin/TextFormattingToolbar";
import ImageCropperModal from "../../components/admin/ImageCropperModal";

export default function AdminBio() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", text: "" });

  // Image Cropper States
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const [dynamicChapters, setDynamicChapters] = useState<any[]>([]);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapterName, setEditingChapterName] = useState<string | null>(null);

  const [chapterForm, setChapterForm] = useState({
    titleEn: "",
    titleUr: "",
    contentEn: "",
    contentUr: ""
  });

  const [spotlight, setSpotlight] = useState({
    titleEn: "Scholarly Guidance & Services",
    titleUr: "علمی رہنمائی اور دینی خدمات",
    desc1En: "Mufti Munir Shakir is a highly esteemed Islamic scholar dedicated to teaching classical theology, propagating spiritual purification, and offering authentic jurisprudential counseling to seekers across the globe.",
    desc1Ur: "مفتی منیر شاکر ایک بلند پایہ اور معتبر عالم دین ہیں جو کلاسیکی الہیات کی تدریس، تزکیہ نفس کی ترویج اور دنیا بھر کے مسلمانوں کو فقہی و شرعی رہنمائی فراہم کرنے کے لیے ہمہ وقت کوشاں ہیں۔",
    desc2En: "Through his interactive lectures, detailed Tafseer classes, and extensive Hadith sessions, he strives to foster harmony, spiritual enlightenment, and clear understanding of authentic Islamic values.",
    desc2Ur: "اپنے مکالماتی پروگرامز، تفصیلی قرآنی دروس اور احادیث کے تفصیلی حلقوں کے ذریعے، وہ معاشرے میں بھائی چارے اور دین حنیف کی حقیقی تفہیم کی آبیاری کر رہے ہیں۔",
    stat1EnLabel: "Years of Service",
    stat1UrLabel: "سالہ دینی خدمات",
    stat1Value: "25+",
    stat2EnLabel: "Weekly Audio/Video Bayans",
    stat2UrLabel: "دستیاب اصلاحی بیانات",
    stat2Value: "1000+",
    imgUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800"
  });

  const [bioContent, setBioContent] = useState({
    titleEn: "Biography",
    titleUr: "سوانح حیات",
    contentEn: "Mufti Munir Shakir is a renowned Islamic scholar dedicated to teaching and spreading the light of Islam across the globe.",
    contentUr: "مفتی منیر شاکر ایک نامور اسلامی اسکالر ہیں جو دنیا بھر میں اسلام کی روشنی پھیلانے اور تعلیم دینے کے لیے وقف ہیں۔"
  });

  const [deleteChapterTarget, setDeleteChapterTarget] = useState<{pageName: string, title: string} | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("page_content").select("*");
    if (data) {
      // Spotlight Info
      const abtSpot = data.find(r => r.page_name === "home_about_section");
      if (abtSpot) {
        setSpotlight(prev => ({
          ...prev,
          titleEn: abtSpot.title_en || prev.titleEn,
          titleUr: abtSpot.title_ur || prev.titleUr,
          desc1En: abtSpot.content_en || prev.desc1En,
          desc1Ur: abtSpot.content_ur || prev.desc1Ur
        }));
      }

      const abtSpot2 = data.find(r => r.page_name === "home_about_section_p2");
      if (abtSpot2) {
        setSpotlight(prev => ({
          ...prev,
          desc2En: abtSpot2.content_en || prev.desc2En,
          desc2Ur: abtSpot2.content_ur || prev.desc2Ur
        }));
      }

      const abtImg = data.find(r => r.page_name === "home_about_image");
      if (abtImg) {
        setSpotlight(prev => ({ ...prev, imgUrl: abtImg.content_en || prev.imgUrl }));
      }

      const stat1 = data.find(r => r.page_name === "home_about_stats_1");
      if (stat1) {
        setSpotlight(prev => ({
          ...prev,
          stat1EnLabel: stat1.title_en || prev.stat1EnLabel,
          stat1UrLabel: stat1.title_ur || prev.stat1UrLabel,
          stat1Value: stat1.content_en || prev.stat1Value
        }));
      }

      const stat2 = data.find(r => r.page_name === "home_about_stats_2");
      if (stat2) {
        setSpotlight(prev => ({
          ...prev,
          stat2EnLabel: stat2.title_en || prev.stat2EnLabel,
          stat2UrLabel: stat2.title_ur || prev.stat2UrLabel,
          stat2Value: stat2.content_en || prev.stat2Value
        }));
      }

      // Detailed Bio
      const bio = data.find(r => r.page_name === "bio_page");
      if (bio) {
        setBioContent({
          titleEn: bio.title_en || "Biography",
          titleUr: bio.title_ur || "سوانح حیات",
          contentEn: bio.content_en || "",
          contentUr: bio.content_ur || ""
        });
      }

      // Fetch dynamic chapters / biography sections
      const chapters = data.filter(r => r.page_name.startsWith("dynamic_bio_"));
      chapters.sort((a, b) => a.page_name.localeCompare(b.page_name));
      setDynamicChapters(chapters);
    } else if (error) {
      console.error("Error fetching bio contents:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropperFile(file);
      setIsCropperOpen(true);
      e.target.value = ""; // Clear input
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", text: "" });

    // Save profile image to Supabase Storage if it contains new base64 data
    let finalPortraitUrl = spotlight.imgUrl;
    if (spotlight.imgUrl && spotlight.imgUrl.startsWith("data:")) {
      finalPortraitUrl = await uploadImageToStorage(spotlight.imgUrl, "portrait");
      // Update local state is also nice so UI matches
      setSpotlight(prev => ({ ...prev, imgUrl: finalPortraitUrl }));
    }

    const updates = [
      {
        page_name: "home_about_section",
        title_en: spotlight.titleEn,
        title_ur: spotlight.titleUr,
        content_en: spotlight.desc1En,
        content_ur: spotlight.desc1Ur
      },
      {
        page_name: "home_about_section_p2",
        title_en: "Spotlight paragraph 2",
        title_ur: "تفسیر تعارف پیرا گراف ٢",
        content_en: spotlight.desc2En,
        content_ur: spotlight.desc2Ur
      },
      {
        page_name: "home_about_image",
        title_en: "Spotlight Portrait Photo",
        title_ur: "پورٹریٹ تصویر",
        content_en: finalPortraitUrl,
        content_ur: ""
      },
      {
        page_name: "home_about_stats_1",
        title_en: spotlight.stat1EnLabel,
        title_ur: spotlight.stat1UrLabel,
        content_en: spotlight.stat1Value,
        content_ur: ""
      },
      {
        page_name: "home_about_stats_2",
        title_en: spotlight.stat2EnLabel,
        title_ur: spotlight.stat2UrLabel,
        content_en: spotlight.stat2Value,
        content_ur: ""
      },
      {
        page_name: "bio_page",
        title_en: bioContent.titleEn,
        title_ur: bioContent.titleUr,
        content_en: bioContent.contentEn,
        content_ur: bioContent.contentUr
      }
    ];

    try {
      for (const row of updates) {
        await supabase.from("page_content").upsert(row, { onConflict: "page_name" });
      }
      setStatus({ type: "success", text: "Biography and spotlight settings saved successfully!" });
    } catch (err: any) {
      setStatus({ type: "error", text: "Failed to save: " + err.message });
    }
    setSaving(false);
  };

  const handleSaveChapter = async (e: FormEvent) => {
    e.preventDefault();
    if (!chapterForm.titleEn && !chapterForm.titleUr) {
      setStatus({ type: "error", text: "Please provide an English or Urdu title for the content chapter." });
      return;
    }

    setSaving(true);
    setStatus({ type: "", text: "" });

    // If editing, use the existing page_name; if new, generate a new page_name using Date.now() timestamp
    const key = editingChapterName || `dynamic_bio_${Date.now()}`;

    const payload = {
      page_name: key,
      title_en: chapterForm.titleEn,
      title_ur: chapterForm.titleUr,
      content_en: chapterForm.contentEn,
      content_ur: chapterForm.contentUr
    };

    try {
      const { error } = await supabase.from("page_content").upsert(payload, { onConflict: "page_name" });
      if (error) throw error;

      setStatus({ type: "success", text: `Chapter "${chapterForm.titleEn || chapterForm.titleUr}" saved successfully!` });
      
      // Reset form and show selection
      setChapterForm({ titleEn: "", titleUr: "", contentEn: "", contentUr: "" });
      setShowChapterForm(false);
      setEditingChapterName(null);
      
      // Reload lists
      fetchRecords();
    } catch (err: any) {
      setStatus({ type: "error", text: "Failed to save chapter: " + err.message });
    }
    setSaving(false);
  };

  const handleEditChapter = (chapter: any) => {
    setEditingChapterName(chapter.page_name);
    setChapterForm({
      titleEn: chapter.title_en || "",
      titleUr: chapter.title_ur || "",
      contentEn: chapter.content_en || "",
      contentUr: chapter.content_ur || ""
    });
    setShowChapterForm(true);
    // Smooth scroll to form
    setTimeout(() => {
      document.getElementById("dynamic_chapter_form_anchor")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeleteChapter = async (pageName: string, title: string) => {
    setStatus({ type: "", text: "" });
    try {
      const { error } = await supabase.from("page_content").delete().eq("page_name", pageName);
      if (error) throw error;

      setStatus({ type: "success", text: `Chapter deleted successfully!` });
      setDeleteChapterTarget(null);
      fetchRecords();
    } catch (err: any) {
      setStatus({ type: "error", text: "Failed to delete: " + err.message });
    }
  };

  const handleNewChapter = () => {
    setEditingChapterName(null);
    setChapterForm({ titleEn: "", titleUr: "", contentEn: "", contentUr: "" });
    setShowChapterForm(true);
    setTimeout(() => {
      document.getElementById("dynamic_chapter_form_anchor")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
        <Loader className="animate-spin text-primary-800" size={36} />
        <p className="text-sm font-medium">Loading Biography settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Biography & Spotlight</h1>
          <p className="text-gray-500 text-sm mt-1">Configure the spotlight blocks, stats counters, profile pictures, and biography stories.</p>
        </div>
      </div>

      {status.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle size={22} className="text-emerald-600" /> : <AlertCircle size={22} className="text-red-650" />}
          <span className="font-medium text-sm">{status.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECTION 1: Spotlight Profile Media (File pick upload) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <ImageIcon className="text-[#1b5e20]" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Biography Portrait Photo</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Upload Profile Portrait</label>
              <p className="text-xs text-gray-500">Pick any image file from your machine instead of typing a URL. The system will process and compress it automatically.</p>
              <input 
                type="file" 
                id="portrait_image_input"
                accept="image/*" 
                onChange={handleImageFileChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-800 file:text-white hover:file:bg-primary-950 cursor-pointer" 
              />
            </div>
            {spotlight.imgUrl ? (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary-100 shadow-md bg-white shrink-0 group">
                <img src={spotlight.imgUrl} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => {
                    setSpotlight(prev => ({ ...prev, imgUrl: "" }));
                    const inp = document.getElementById("portrait_image_input") as HTMLInputElement;
                    if (inp) inp.value = "";
                  }} 
                  className="absolute top-2.5 right-2.5 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors shadow-lg cursor-pointer flex items-center justify-center w-6 h-6 z-10"
                  title="Remove Image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 bg-white text-gray-400 text-xs text-center p-4">
                No Photo Uploaded
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Spotlight Text Content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Award className="text-[#1b5e20]" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Scholar Spotlight Highlight Texts</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-750 mb-1">Spotlight Title (English)</label>
              <input
                type="text"
                value={spotlight.titleEn}
                onChange={e => setSpotlight({ ...spotlight, titleEn: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div dir="rtl">
              <label className="block text-sm font-semibold text-gray-750 mb-1 text-right">خصوصی تعارف عنوان (Urdu)</label>
              <input
                type="text"
                value={spotlight.titleUr}
                onChange={e => setSpotlight({ ...spotlight, titleUr: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-urdu text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-750 mb-1">Biography Snippet Paragraph 1 (English)</label>
              <textarea
                value={spotlight.desc1En}
                onChange={e => setSpotlight({ ...spotlight, desc1En: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div dir="rtl">
              <label className="block text-sm font-semibold text-gray-750 mb-1 text-right">خصوصی تعارف پیراگراف ١ (Urdu)</label>
              <textarea
                value={spotlight.desc1Ur}
                onChange={e => setSpotlight({ ...spotlight, desc1Ur: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-urdu text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-750 mb-1">Biography Snippet Paragraph 2 (English)</label>
              <textarea
                value={spotlight.desc2En}
                onChange={e => setSpotlight({ ...spotlight, desc2En: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div dir="rtl">
              <label className="block text-sm font-semibold text-gray-750 mb-1 text-right">خصوصی تعارف پیراگراف ٢ (Urdu)</label>
              <textarea
                value={spotlight.desc2Ur}
                onChange={e => setSpotlight({ ...spotlight, desc2Ur: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-urdu text-right"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Stats Counters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Sparkles className="text-[#1b5e20]" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Achievement Stats Counters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stat 1 */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-4">
              <span className="font-semibold text-xs text-primary-900 block uppercase tracking-wider">Stat Counter 1</span>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Number / Value (e.g. 25+)</label>
                <input
                  type="text"
                  value={spotlight.stat1Value}
                  onChange={e => setSpotlight({ ...spotlight, stat1Value: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">English Label</label>
                  <input
                    type="text"
                    value={spotlight.stat1EnLabel}
                    onChange={e => setSpotlight({ ...spotlight, stat1EnLabel: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white text-xs outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div dir="rtl">
                  <label className="block text-xs text-gray-600 mb-1 text-right">اردو لیبل</label>
                  <input
                    type="text"
                    value={spotlight.stat1UrLabel}
                    onChange={e => setSpotlight({ ...spotlight, stat1UrLabel: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white text-xs font-urdu text-right outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-4">
              <span className="font-semibold text-xs text-primary-900 block uppercase tracking-wider">Stat Counter 2</span>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Number / Value (e.g. 1000+)</label>
                <input
                  type="text"
                  value={spotlight.stat2Value}
                  onChange={e => setSpotlight({ ...spotlight, stat2Value: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">English Label</label>
                  <input
                    type="text"
                    value={spotlight.stat2EnLabel}
                    onChange={e => setSpotlight({ ...spotlight, stat2EnLabel: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white text-xs outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div dir="rtl">
                  <label className="block text-xs text-gray-600 mb-1 text-right">اردو لیبل</label>
                  <input
                    type="text"
                    value={spotlight.stat2UrLabel}
                    onChange={e => setSpotlight({ ...spotlight, stat2UrLabel: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white text-xs font-urdu text-right outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Detailed Biography Editorial Text */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <BookOpen className="text-[#1b5e20]" size={20} />
            <h2 className="text-lg font-bold text-gray-800 font-urdu">تفصیلی سوانح حیات / Detailed biography story</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-750 mb-1">Biography Title (English)</label>
              <input
                type="text"
                value={bioContent.titleEn}
                onChange={e => setBioContent({ ...bioContent, titleEn: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div dir="rtl">
              <label className="block text-sm font-semibold text-gray-750 mb-1 text-right">عنوان سوانح حیات (Urdu)</label>
              <input
                type="text"
                value={bioContent.titleUr}
                onChange={e => setBioContent({ ...bioContent, titleUr: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-urdu text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-750 mb-1"> biography Detailed Text (English)</label>
              <TextFormattingToolbar
                textareaId="bio_detailed_en"
                value={bioContent.contentEn}
                onChange={(val) => setBioContent({ ...bioContent, contentEn: val })}
                lang="en"
              />
              <textarea
                id="bio_detailed_en"
                value={bioContent.contentEn}
                onChange={e => setBioContent({ ...bioContent, contentEn: e.target.value })}
                rows={10}
                className="w-full border border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                placeholder="Type biography text in English here..."
              />
            </div>
            <div dir="rtl">
              <label className="block text-sm font-semibold text-gray-750 mb-1 text-right">تفصیلی سوانح حیات مضمون (Urdu)</label>
              <TextFormattingToolbar
                textareaId="bio_detailed_ur"
                value={bioContent.contentUr}
                onChange={(val) => setBioContent({ ...bioContent, contentUr: val })}
                lang="ur"
              />
              <textarea
                id="bio_detailed_ur"
                value={bioContent.contentUr}
                onChange={e => setBioContent({ ...bioContent, contentUr: e.target.value })}
                rows={10}
                className="w-full border border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-urdu text-right text-xl leading-loose"
                placeholder="تفصیلی سوانح حیات یہاں اردو میں لکھیں..."
              />
            </div>
          </div>
        </div>

        {/* Form Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white font-semibold text-base px-8 py-3.5 rounded-lg transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Publishing updates..." : "Save Biography & Spotlight Changes"}
          </button>
        </div>
      </form>

      {/* DYNAMIC BIOGRAPHY CHAPTERS SECTION */}
      <div className="border-t border-gray-200 pt-10 mt-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bookmark className="text-[#1b5e20]" />
              Biography Chapters & Additional Custom Sections
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Add sub-biographies, publications, travels, lists of teachers or other customized folders.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNewChapter}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1b5e20] hover:bg-green-900 text-white font-semibold text-sm rounded-lg transition-all shadow-md select-none cursor-pointer border-0"
          >
            <Plus size={16} /> Add New Chapter
          </button>
        </div>

        {/* Existing Chapters Table/List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {dynamicChapters.length === 0 ? (
            <div className="p-8 text-center text-gray-400 space-y-2">
              <HelpCircle className="mx-auto text-gray-300" size={32} />
              <p className="font-medium text-sm">No custom chapters added yet.</p>
              <p className="text-xs text-gray-455">Click the "+ Add New Chapter" button to create custom biography segments.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-150">
              {dynamicChapters.map((ch) => {
                const DetectedIcon = getDynamicIcon(ch.title_en, ch.title_ur);
                return (
                  <div key={ch.page_name} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-primary-50 text-[#1b5e20] rounded-xl shrink-0 mt-0.5">
                        <DetectedIcon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-sm">{ch.title_en || "No English Title"}</h3>
                          {ch.title_ur && (
                            <span className="text-xs font-urdu bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
                              {ch.title_ur}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-1">Detected Icon: <span className="font-semibold text-primary-800">{DetectedIcon.name || "Custom"}</span></p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1 max-w-xl">{ch.content_en || ch.content_ur}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleEditChapter(ch)}
                        className="inline-flex items-center gap-1 py-1.5 px-3 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteChapterTarget({ pageName: ch.page_name, title: ch.title_en || ch.title_ur })}
                        className="inline-flex items-center gap-1 py-1.5 px-3 border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 text-red-650 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Chapter Creator/Editor Form */}
        {showChapterForm && (
          <div id="dynamic_chapter_form_anchor" className="bg-white rounded-2xl p-6 shadow-md border border-primary-200 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="text-[#1b5e20]" size={20} />
                <h3 className="font-bold text-lg text-gray-800">
                  {editingChapterName ? "Edit Biography Chapter" : "Create New Biography Chapter"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChapterForm(false);
                  setEditingChapterName(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-750 mb-1">
                    Chapter / Content Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={!chapterForm.titleUr}
                    placeholder="e.g. List of Honourable Teachers"
                    value={chapterForm.titleEn}
                    onChange={(e) => setChapterForm({ ...chapterForm, titleEn: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">This English title helps auto-select custom icons (e.g. Teachers, Travels, Books).</p>
                </div>

                <div dir="rtl">
                  <label className="block text-sm font-semibold text-gray-750 mb-1 text-right">
                    عنوان باب / مواد (Urdu) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={!chapterForm.titleEn}
                    placeholder="مثال: مشائخ و اساتذہ کرام"
                    value={chapterForm.titleUr}
                    onChange={(e) => setChapterForm({ ...chapterForm, titleUr: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-urdu text-right"
                  />
                </div>

                {/* Pre-Visualization Box */}
                {(chapterForm.titleEn || chapterForm.titleUr) && (
                  <div className="col-span-1 md:col-span-2 bg-[#fdfdfd] p-3.5 rounded-xl border border-dashed border-gray-200 flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium">System Selected Icon:</span>
                    <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 py-1.5 px-3 rounded-lg text-primary-900 text-xs font-semibold">
                      {(() => {
                        const PreviewIcon = getDynamicIcon(chapterForm.titleEn, chapterForm.titleUr);
                        return (
                          <>
                            <PreviewIcon className="text-[#1b5e20] shrink-0" size={16} />
                            <span>{PreviewIcon.name || "Auto Detected"}</span>
                          </>
                        );
                      })()}
                    </div>
                    <span className="text-[10px] text-gray-400"> (Will adjust to heading automatically)</span>
                  </div>
                )}

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-750 mb-1">
                      Chapter Content / Write Up (English)
                    </label>
                    <TextFormattingToolbar
                      textareaId="chapter_content_en"
                      value={chapterForm.contentEn}
                      onChange={(val) => setChapterForm({ ...chapterForm, contentEn: val })}
                      lang="en"
                    />
                    <textarea
                      id="chapter_content_en"
                      placeholder="Write your informative essay/content here..."
                      value={chapterForm.contentEn}
                      onChange={(e) => setChapterForm({ ...chapterForm, contentEn: e.target.value })}
                      rows={8}
                      className="w-full border border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                  </div>

                  <div dir="rtl">
                    <label className="block text-sm font-semibold text-gray-750 mb-1 text-right">
                      تفصیلی مواد / مضمون (Urdu)
                    </label>
                    <TextFormattingToolbar
                      textareaId="chapter_content_ur"
                      value={chapterForm.contentUr}
                      onChange={(val) => setChapterForm({ ...chapterForm, contentUr: val })}
                      lang="ur"
                    />
                    <textarea
                      id="chapter_content_ur"
                      placeholder="یہاں اپنا مضمون یا تفصیل لکھیں..."
                      value={chapterForm.contentUr}
                      onChange={(e) => setChapterForm({ ...chapterForm, contentUr: e.target.value })}
                      rows={8}
                      className="w-full border border-gray-300 rounded-b-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-urdu text-right text-xl leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowChapterForm(false);
                    setEditingChapterName(null);
                  }}
                  className="px-5 py-2.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-[#1b5e20] hover:bg-green-900 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader className="animate-spin" size={16} />}
                  Save Content Chapter
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteChapterTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Chapter</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the chapter "{deleteChapterTarget.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteChapterTarget(null)} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteChapter(deleteChapterTarget.pageName, deleteChapterTarget.title)} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setCropperFile(null);
        }}
        imageFile={cropperFile}
        defaultAspectRatio={1} // Spotlight portrait usually square/1:1
        onCrop={(croppedBase64) => {
          setSpotlight(prev => ({ ...prev, imgUrl: croppedBase64 }));
        }}
      />
    </div>
  );
}
