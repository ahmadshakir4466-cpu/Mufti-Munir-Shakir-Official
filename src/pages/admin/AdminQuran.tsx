import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Edit, Trash, X, BookOpen, Layers, Compass, PlusCircle, Trash2 } from "lucide-react";
import TextFormattingToolbar from "../../components/admin/TextFormattingToolbar";

export default function AdminQuran() {
  const [quranEntries, setQuranEntries] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Rich-field states
  const [verses, setVerses] = useState<any[]>([]);
  const [introEn, setIntroEn] = useState("");
  const [introUr, setIntroUr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleUr, setTitleUr] = useState("");
  const [activeTab, setActiveTab] = useState<"metadata" | "verses">("metadata");

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quran")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setQuranEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();

    const channel = supabase.channel('quran-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quran' }, () => {
        fetchEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize form fields and verses on entry select
  useEffect(() => {
    if (currentEntry) {
      setTitleEn(currentEntry.title_en || "");
      setTitleUr(currentEntry.title_ur || "");
      let vList: any[] = [];
      let iEn = currentEntry.description_en || "";
      let iUr = currentEntry.description_ur || "";

      if (currentEntry.description_en && currentEntry.description_en.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(currentEntry.description_en);
          if (parsed && parsed.type === "surah_rich_data") {
            vList = parsed.verses || [];
            iEn = parsed.introduction_en || "";
            iUr = parsed.introduction_ur || "";
          }
        } catch (e) {
          // Fallback if JSON parse fails
        }
      }
      setVerses(vList);
      setIntroEn(iEn);
      setIntroUr(iUr);
    } else {
      setTitleEn("");
      setTitleUr("");
      setVerses([]);
      setIntroEn("");
      setIntroUr("");
    }
    setActiveTab("metadata");
  }, [currentEntry]);

  const handleAddVerse = () => {
    const nextNum = verses.length > 0 ? Math.max(...verses.map(v => v.number || 0)) + 1 : 1;
    setVerses([
      ...verses,
      {
        number: nextNum,
        arabic: "",
        translation_ur: "",
        translation_en: "",
        tafseer: "",
        tafseer_en: ""
      }
    ]);
  };

  const handleUpdateVerseField = (index: number, field: string, value: any) => {
    const updated = [...verses];
    updated[index] = { ...updated[index], [field]: value };
    setVerses(updated);
  };

  const handleDeleteVerse = (index: number) => {
    const updated = verses.filter((_, idx) => idx !== index);
    const resequenced = updated.map((v, i) => ({ ...v, number: i + 1 }));
    setVerses(resequenced);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      title_en: titleEn,
      title_ur: titleUr,
      audio_url: formData.get("audio_url"),
      description_ur: introUr,
      description_en: JSON.stringify({
        type: "surah_rich_data",
        introduction_en: introEn,
        introduction_ur: introUr,
        verses: verses
      }),
    };

    if (currentEntry?.id) {
      const { error } = await supabase.from("quran").update(payload).eq("id", currentEntry.id);
      if (error) alert("Error updating: " + error.message);
    } else {
      const { error } = await supabase.from("quran").insert(payload);
      if (error) alert("Error creating: " + error.message);
    }
    
    setIsEditing(false);
    fetchEntries();
  };

  const handleDelete = async (id: string|null) => {
    if (!id) return;
    const { error } = await supabase.from("quran").delete().eq("id", id);
    if (error) {
      console.error("Error deleting:", error.message);
    } else {
      fetchEntries();
    }
    setDeleteTargetId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-primary-800" />
            Manage Quran Section
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure audio recitations, chapter metadata, and verses with Urdu/English translation and Tafseer.</p>
        </div>
        <button
          onClick={() => {
            setCurrentEntry(null);
            setIsEditing(true);
          }}
          className="bg-primary-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-900 shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          Add Surah / Recitation
        </button>
      </div>

      {isEditing && (
        <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 mb-8 relative animate-fade-in">
          <button 
            onClick={() => setIsEditing(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
          <h2 className="text-xl font-bold text-gray-850 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Layers className="text-primary-700" size={20} />
            {currentEntry ? `Edit Surah: ${currentEntry.title_en}` : "Create New Surah Entry"}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Elegant Tab Switcher */}
            <div className="flex border-b border-gray-150 mb-6 gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("metadata")}
                className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer ${
                  activeTab === "metadata" 
                    ? "text-primary-800 border-b-2 border-primary-800" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                1. General Info & Translation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("verses")}
                className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer flex items-center gap-2 ${
                  activeTab === "verses" 
                    ? "text-primary-800 border-b-2 border-primary-800" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                2. Verse-by-Verse Details & Tafseer
                <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  {verses.length}
                </span>
              </button>
            </div>

            {/* TAB 1: METADATA */}
            {activeTab === "metadata" && (
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Surah Title (English)</label>
                    <TextFormattingToolbar 
                      textareaId="quran_title_en" 
                      value={titleEn} 
                      onChange={setTitleEn} 
                      lang="en" 
                    />
                    <textarea 
                      id="quran_title_en"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      required 
                      rows={1}
                      className="w-full border-b border-x border-gray-250 rounded-b-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400 transition-colors text-sm font-medium" 
                      placeholder="e.g. Surah Al-Fatiha" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right font-urdu" dir="rtl">عنوان (Urdu)</label>
                    <TextFormattingToolbar 
                      textareaId="quran_title_ur" 
                      value={titleUr} 
                      onChange={setTitleUr} 
                      lang="ur" 
                    />
                    <textarea 
                      id="quran_title_ur"
                      value={titleUr}
                      onChange={(e) => setTitleUr(e.target.value)}
                      required 
                      rows={1}
                      className="w-full border-b border-x border-gray-250 rounded-b-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right hover:border-gray-400 transition-colors text-sm" 
                      dir="rtl"
                      placeholder="سورۃ الفاتحہ" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Audio MP3 Recitation Link (optional)</label>
                  <input 
                    name="audio_url" 
                    defaultValue={currentEntry?.audio_url} 
                    className="w-full border border-gray-250 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none hover:border-gray-400 transition-colors" 
                    placeholder="e.g. https://server8.mp3quran.net/afs/001.mp3" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Surah Introduction (English)</label>
                    <TextFormattingToolbar 
                      textareaId="quran_intro_en" 
                      value={introEn} 
                      onChange={(val) => setIntroEn(val)} 
                      lang="en"
                    />
                    <textarea 
                      id="quran_intro_en"
                      value={introEn} 
                      onChange={(e) => setIntroEn(e.target.value)}
                      className="w-full border-b border-x border-gray-250 rounded-b-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none min-h-[140px] hover:border-gray-400 transition-colors" 
                      placeholder="Write brief description of the Surah..."
                      rows={5} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right font-urdu" dir="rtl">سورت کا تعارف (Urdu)</label>
                    <TextFormattingToolbar 
                      textareaId="quran_intro_ur" 
                      value={introUr} 
                      onChange={(val) => setIntroUr(val)} 
                      lang="ur"
                    />
                    <textarea 
                      id="quran_intro_ur"
                      value={introUr} 
                      onChange={(e) => setIntroUr(e.target.value)}
                      className="w-full border-b border-x border-gray-250 rounded-b-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right min-h-[140px] hover:border-gray-400 transition-colors" 
                      placeholder="سورۃ مبارکہ کے فضائل اور اہمیت کی تفصیل تحریر کریں..."
                      rows={5} 
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VERSES & TAFSEER */}
            {activeTab === "verses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <div className="text-xs text-gray-500">
                    Keep your verses arranged sequentially. Use Arabic characters with diacritics for elegant presentation.
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVerse}
                    className="bg-primary-50 text-primary-850 hover:bg-primary-800 hover:text-white px-4 py-2 border border-primary-200 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    Add Verse
                  </button>
                </div>

                {verses.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
                     No verses added to this Surah yet. Click "Add Verse" to begin building.
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 border-l-2 border-primary-100 pl-4">
                    {verses.map((verse, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 relative">
                        <button
                          type="button"
                          onClick={() => handleDeleteVerse(index)}
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Verse"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="flex gap-4 items-center">
                          <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 text-xs font-extrabold flex items-center justify-center">
                            #{verse.number}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Verse Customization Panel
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                              Arabic Script (الآية)
                            </label>
                            <textarea
                              value={verse.arabic}
                              onChange={(e) => handleUpdateVerseField(index, "arabic", e.target.value)}
                              rows={2}
                              className="w-full border border-gray-250 rounded-xl p-2.5 text-right font-semibold text-lg focus:ring-1 focus:ring-primary-500 outline-none"
                              placeholder="مكتوبة بالتشكيل..."
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                              Tafseer / commentary (تفسیر و تشریح)
                            </label>
                            <TextFormattingToolbar 
                              textareaId={`tafseer_${index}`}
                              value={verse.tafseer}
                              onChange={(val) => handleUpdateVerseField(index, "tafseer", val)}
                              lang="ur"
                            />
                            <textarea
                              id={`tafseer_${index}`}
                              value={verse.tafseer}
                              onChange={(e) => handleUpdateVerseField(index, "tafseer", e.target.value)}
                              rows={3}
                              className="w-full border-b border-x border-gray-250 rounded-b-xl p-2.5 font-urdu text-right text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                              placeholder="مجموعہ تفسیری نوٹس تحریر لکھیں..."
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                              Tafseer / Commentary (English)
                            </label>
                            <TextFormattingToolbar 
                              textareaId={`tafseer_en_${index}`}
                              value={verse.tafseer_en}
                              onChange={(val) => handleUpdateVerseField(index, "tafseer_en", val)}
                              lang="en"
                            />
                            <textarea
                              id={`tafseer_en_${index}`}
                              value={verse.tafseer_en}
                              onChange={(e) => handleUpdateVerseField(index, "tafseer_en", e.target.value)}
                              rows={3}
                              className="w-full border-b border-x border-gray-250 rounded-b-xl p-2.5 text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                              placeholder="English Commentary..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                              Urdu Translation (اردو ترجمہ)
                            </label>
                            <input
                              type="text"
                              value={verse.translation_ur}
                              onChange={(e) => handleUpdateVerseField(index, "translation_ur", e.target.value)}
                              className="w-full border border-gray-250 rounded-xl p-2.5 font-urdu text-right text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                              placeholder="آیت مبارکہ کا اردو ترجمہ..."
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                              English Translation
                            </label>
                            <input
                              type="text"
                              value={verse.translation_en}
                              onChange={(e) => handleUpdateVerseField(index, "translation_en", e.target.value)}
                              className="w-full border border-gray-250 rounded-xl p-2.5 text-sm font-semibold text-gray-700 focus:ring-1 focus:ring-primary-500 outline-none"
                              placeholder="English Translation text..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-primary-800 text-white px-7 py-2.5 rounded-xl font-semibold hover:bg-primary-950 transition-colors cursor-pointer shadow-md"
              >
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
            <span>Uploading records database...</span>
          </div>
        ) : quranEntries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No Custom Quran entries found. Click "Add Surah" to create one.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider w-1/3">Title (English)</th>
                <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider w-1/3 text-right">Title (Urdu)</th>
                <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider text-center">Audio</th>
                <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider text-center">Verses Count</th>
                <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quranEntries.map((item) => {
                let versesCount = 0;
                if (item.description_en && item.description_en.trim().startsWith("{")) {
                  try {
                    const parsed = JSON.parse(item.description_en);
                    if (parsed && parsed.verses) {
                      versesCount = parsed.verses.length;
                    }
                  } catch (e) {}
                }
                return (
                  <tr key={item.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="p-5 font-bold text-gray-900">{item.title_en}</td>
                    <td className="p-5 font-urdu text-right text-gray-900 text-base">{item.title_ur}</td>
                    <td className="p-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.audio_url ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-400"}`}>
                        {item.audio_url ? "Mp3 Active" : "No Audio"}
                      </span>
                    </td>
                    <td className="p-5 text-center font-bold text-gray-700">
                      {versesCount > 0 ? (
                        <span className="bg-primary-50 text-primary-800 px-2.5 py-1 rounded-full text-xs">
                          {versesCount} Verses
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs font-normal">None</span>
                      )}
                    </td>
                    <td className="p-5 text-right whitespace-nowrap">
                      <button 
                        onClick={() => { setCurrentEntry(item); setIsEditing(true); }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-1.5 cursor-pointer"
                        title="Edit Surah Details"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteTargetId(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Surah Entry"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in animate-backdrop-blur">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-gray-150 transform scale-100 transition-all">
            <h3 className="text-lg font-bold text-gray-950">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Are you sure you want to delete this Quran entry? This will permanently remove its audio link, English/Urdu translations, and verse annotations.</p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setDeleteTargetId(null)} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteTargetId)} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
