import React, { useState, useEffect } from "react";
import { useSettings } from "../../context/SettingsContext";
import { uploadImageToStorage, supabase } from "../../lib/supabase";
import { Upload, Check, Loader2, Sparkles, AlertCircle, Info, Type } from "lucide-react";

export default function AdminSettings() {
  const { 
    sections, 
    updateSection, 
    urduFont, 
    setUrduFont,
    englishFont, 
    setEnglishFont,
    arabicFont, 
    setArabicFont
  } = useSettings();

  const [uploadingType, setUploadingType] = useState<"urdu" | "english" | "arabic" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "urdu" | "english" | "arabic") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. max 15MB for fonts)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Font file is too large. Max allowed size is 15MB.");
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ["ttf", "otf", "woff", "woff2"];
    if (!ext || !allowed.includes(ext)) {
      setErrorMsg("Invalid file type. Please upload a .ttf, .otf, .woff, or .woff2 font file.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadingType(type);

    let finalFontUrl = "";
    let isBase64Fallback = false;

    try {
      // 1. Try uploading to Supabase Storage first
      try {
        const customFileName = `font-${type}-${Date.now()}`;
        finalFontUrl = await uploadImageToStorage(file, customFileName);
      } catch (storageErr) {
        console.warn("Supabase Storage upload failed, attempting local fallback...", storageErr);
      }

      // 2. If Supabase fails or returns empty, convert to Base64 (Local Fallback)
      if (!finalFontUrl) {
        if (file.size > 4.5 * 1024 * 1024) {
          throw new Error("Supabase Storage bucket upload fail ho gaya aur font file 4.5MB se badi hai jis wajah se automatic local storage fallback nahi kiya ja sakta. Apne Supabase Storage me public RLS policy enable karein!");
        }

        // Convert file to Base64 URL
        finalFontUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Font file ko read nahi kiya ja saka."));
          reader.readAsDataURL(file);
        });
        isBase64Fallback = true;
      }

      if (!finalFontUrl) {
        throw new Error("Font process/upload karne me koi galti hui.");
      }

      // Save to context
      if (type === "urdu") {
        setUrduFont({
          ...urduFont,
          url: finalFontUrl
        });
        setSuccessMsg(
          isBase64Fallback 
            ? "Urdu Custom Font successfully loaded via offline Base64 fallback (Supabase bucket was bypassed)!" 
            : "Urdu custom font uploaded and registered successfully in Supabase Storage!"
        );
      } else if (type === "english") {
        setEnglishFont({
          ...englishFont,
          url: finalFontUrl
        });
        setSuccessMsg(
          isBase64Fallback 
            ? "English Custom Font successfully loaded via offline Base64 fallback!" 
            : "English custom font uploaded and registered successfully in Supabase Storage!"
        );
      } else if (type === "arabic") {
        setArabicFont({
          ...arabicFont,
          url: finalFontUrl
        });
        setSuccessMsg(
          isBase64Fallback 
            ? "Arabic Quranic Font successfully loaded via offline Base64 fallback!" 
            : "Arabic Quranic font uploaded and registered successfully in Supabase Storage!"
        );
      }
    } catch (e: any) {
      console.error("Font upload error:", e);
      setErrorMsg(e.message || "Failed to process the custom font. Make sure your browser storage space is sufficient.");
    } finally {
      setUploadingType(null);
    }
  };

  const removeFont = (type: "urdu" | "english" | "arabic") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (type === "urdu") {
      setUrduFont({ ...urduFont, url: "" });
    } else if (type === "english") {
      setEnglishFont({ ...englishFont, url: "" });
    } else if (type === "arabic") {
      setArabicFont({ ...arabicFont, url: "" });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-150">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Type className="text-primary-600 w-8 h-8" /> Control Panel Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage website modules, custom typography assets, and content application styling.</p>
        </div>
      </div>

      {/* SUCCESS / ERROR NOTIFICATIONS */}
      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-center gap-3 shadow-sm">
          <Check className="text-emerald-600 w-5 h-5 flex-shrink-0" />
          <span className="text-sm text-emerald-800 font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl flex items-center gap-3 shadow-sm">
          <AlertCircle className="text-rose-600 w-5 h-5 flex-shrink-0" />
          <span className="text-sm text-rose-800 font-medium">{errorMsg}</span>
        </div>
      )}
      
      {/* ADVANCED TYPOGRAPHY DIRECT UPLOADER & SCOPING SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/70">
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-amber-500 w-5 h-5" /> Professional Typography Center
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Directly upload your custom font files (TTF, OTF, WOFF, WOFF2) and specify where they should take effect. No need to paste complex URLs!
          </p>
        </div>
        
        <div className="p-6 space-y-8 divide-y divide-gray-100">
          {/* 1. URDU FONT GROUP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-4 space-y-1">
              <h3 className="text-md font-bold text-gray-800">Urdu Font (اردو فونٹ)</h3>
              <p className="text-xs text-gray-400">Apply a customized elegant font (like Jameel Noori, Alvi, etc.) to Urdu paragraphs and layout headers.</p>
              {urduFont.url && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-800 border border-primary-100 max-w-full truncate">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" /> Loaded Custom Font
                  </span>
                  <button 
                    onClick={() => removeFont("urdu")}
                    className="block text-xs text-rose-600 hover:text-rose-800 font-bold mt-1 hover:underline transition-all"
                  >
                    Remove Font
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col md:flex-row gap-6 items-start">
              {/* UPLOADER */}
              <div className="w-full md:w-1/2">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-250 hover:border-primary-400 rounded-xl p-4 bg-gray-50/50 cursor-pointer transition-all duration-200">
                  {uploadingType === "urdu" ? (
                    <div className="flex flex-col items-center py-4">
                      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                      <span className="text-xs text-gray-500 font-bold mt-2">Uploading Font File...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs font-extrabold text-gray-700">Select Font File (اردو فونٹ)</span>
                      <span className="text-[10px] text-gray-400 mt-1">.ttf, .woff, .woff2 (Max 15MB)</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept=".ttf,.otf,.woff,.woff2" 
                    onChange={(e) => handleFontUpload(e, "urdu")}
                    disabled={uploadingType !== null}
                    className="hidden"
                  />
                </label>
              </div>

              {/* SCOPE SELECTIONS */}
              <div className="w-full md:w-1/2 p-3 bg-gray-52 rounded-xl border border-gray-150 space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Scope Selection</span>
                
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={urduFont.applyToContent}
                    onChange={(e) => setUrduFont({ ...urduFont, applyToContent: e.target.checked })}
                    className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-850">Apply to Urdu Quranic/Content Text</span>
                    <span className="text-[10px] text-gray-500 block">Applies to translation content, articles, and descriptions.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                  <input 
                    type="checkbox"
                    checked={urduFont.applyToTitles}
                    onChange={(e) => setUrduFont({ ...urduFont, applyToTitles: e.target.checked })}
                    className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-850">Apply to Urdu Titles & Headers</span>
                    <span className="text-[10px] text-gray-500 block">Applies to headings, cards titles and banner headers in Urdu.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. ENGLISH FONT GROUP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            <div className="lg:col-span-4 space-y-1">
              <h3 className="text-md font-bold text-gray-800">English Font</h3>
              <p className="text-xs text-gray-400">Upload a beautifully customized English font to apply to general pages and main headers.</p>
              {englishFont.url && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-800 border border-primary-100 max-w-full truncate">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" /> Loaded Custom Font
                  </span>
                  <button 
                    onClick={() => removeFont("english")}
                    className="block text-xs text-rose-600 hover:text-rose-800 font-bold mt-1 hover:underline transition-all"
                  >
                    Remove Font
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col md:flex-row gap-6 items-start">
              {/* UPLOADER */}
              <div className="w-full md:w-1/2">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-250 hover:border-primary-400 rounded-xl p-4 bg-gray-50/50 cursor-pointer transition-all duration-200">
                  {uploadingType === "english" ? (
                    <div className="flex flex-col items-center py-4">
                      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                      <span className="text-xs text-gray-500 font-bold mt-2">Uploading Font File...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs font-extrabold text-gray-700">Select English Font File</span>
                      <span className="text-[10px] text-gray-400 mt-1">.ttf, .woff, .woff2 (Max 15MB)</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept=".ttf,.otf,.woff,.woff2" 
                    onChange={(e) => handleFontUpload(e, "english")}
                    disabled={uploadingType !== null}
                    className="hidden"
                  />
                </label>
              </div>

              {/* SCOPE SELECTIONS */}
              <div className="w-full md:w-1/2 p-3 bg-gray-52 rounded-xl border border-gray-150 space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Scope Selection</span>
                
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={englishFont.applyToContent}
                    onChange={(e) => setEnglishFont({ ...englishFont, applyToContent: e.target.checked })}
                    className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-850">Apply to English Paragraphs & Text</span>
                    <span className="text-[10px] text-gray-500 block">Applies to general body descriptions, biographies and articles.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                  <input 
                    type="checkbox"
                    checked={englishFont.applyToTitles}
                    onChange={(e) => setEnglishFont({ ...englishFont, applyToTitles: e.target.checked })}
                    className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-850">Apply to English Titles & Headers</span>
                    <span className="text-[10px] text-gray-500 block">Applies to navigation menus, cards labels and pages headers in English.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 3. ARABIC QURAN FONT GROUP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            <div className="lg:col-span-4 space-y-1">
              <h3 className="text-md font-bold text-gray-800">Quranic Arabic Font (رسم العثماني)</h3>
              <p className="text-xs text-gray-400">Enhance the beautiful Arabic display of Quranic verses by uploading a custom font (e.g. Amiri, Scheherazade, Me Quran, etc.).</p>
              {arabicFont.url && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-800 border border-primary-100 max-w-full truncate">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" /> Loaded Custom Font
                  </span>
                  <button 
                    onClick={() => removeFont("arabic")}
                    className="block text-xs text-rose-600 hover:text-rose-800 font-bold mt-1 hover:underline transition-all"
                  >
                    Remove Font
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col md:flex-row gap-6 items-start pb-4">
              {/* UPLOADER */}
              <div className="w-full md:w-1/2">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-250 hover:border-primary-400 rounded-xl p-4 bg-gray-50/50 cursor-pointer transition-all duration-200">
                  {uploadingType === "arabic" ? (
                    <div className="flex flex-col items-center py-4">
                      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                      <span className="text-xs text-gray-500 font-bold mt-2">Uploading Font File...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs font-extrabold text-gray-700">Select Arabic Font File</span>
                      <span className="text-[10px] text-gray-400 mt-1">.ttf, .woff, .woff2 (Max 15MB)</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept=".ttf,.otf,.woff,.woff2" 
                    onChange={(e) => handleFontUpload(e, "arabic")}
                    disabled={uploadingType !== null}
                    className="hidden"
                  />
                </label>
              </div>

              {/* SCOPE SELECTIONS */}
              <div className="w-full md:w-1/2 p-3 bg-gray-52 rounded-xl border border-gray-150 space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Scope Selection</span>
                
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={arabicFont.applyToQuran}
                    onChange={(e) => setArabicFont({ ...arabicFont, applyToQuran: e.target.checked })}
                    className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-850">Apply to Quranic Arabic Text</span>
                    <span className="text-[10px] text-gray-500 block">Applies to the original Quranic Ayahs rendered inside the Quran module.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION VISIBILITY MANAGEMENT */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150">
        <div className="p-6 border-b border-gray-100 bg-gray-50/70">
           <h2 className="text-xl font-bold text-gray-800">Enable / Disable Section Modules</h2>
           <p className="text-gray-500 text-sm mt-1">Toggle the switches below to immediately show or hide sections from the public facing portal.</p>
        </div>
        
        <div className="p-6">
           <div className="space-y-4 max-w-xl">
             {Object.entries(sections).map(([key, isEnabled]) => (
                <div key={key} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-primary-500' : 'bg-gray-300'}`} />
                      {key === "home" ? "Main Landing Page" : key}
                    </h3>
                    <p className="text-xs text-gray-500 pl-4">Enable the {key === "home" ? "Main Landing Page" : key} section in navigation and router links.</p>
                  </div>
                  
                  <button 
                    onClick={() => updateSection(key as any, !isEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isEnabled ? 'bg-primary-650 shadow-inner' : 'bg-gray-300'}`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all shadow-md ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
