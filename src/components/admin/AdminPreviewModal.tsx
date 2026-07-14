import React, { useState } from "react";
import { X, Calendar, Eye, Users, Monitor, Smartphone, Globe, AlertCircle, PlayCircle, Clock } from "lucide-react";
import { renderFormattedText, renderFormattedTitle } from "../../lib/utils";

interface AdminPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "article" | "video";
  data: {
    titleEn: string;
    titleUr: string;
    contentEn?: string;
    contentUr?: string;
    descriptionEn?: string;
    descriptionUr?: string;
    featuredImage?: string;
    videoUrl?: string;
  };
}

export default function AdminPreviewModal({ isOpen, onClose, type, data }: AdminPreviewModalProps) {
  const [previewLang, setPreviewLang] = useState<"en" | "ur">("en");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

  if (!isOpen) return null;

  // Process video URL
  let embedUrl: string | null = null;
  let videoId: string | null = null;
  if (type === "video" && data.videoUrl) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = data.videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
      embedUrl = `https://www.youtube.com/embed/${match[2]}`;
    } else {
      embedUrl = data.videoUrl;
    }
  }

  const isUrdu = previewLang === "ur";
  const title = isUrdu ? data.titleUr : data.titleEn;
  const contentText = type === "article" 
    ? (isUrdu ? data.contentUr : data.contentEn) 
    : (isUrdu ? data.descriptionUr : data.descriptionEn);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-slate-200 overflow-hidden transform scale-100 transition-all">
        
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              Frontend Preview: <span className="font-medium text-slate-500 capitalize">{type}</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Device frame switcher */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200 text-slate-600">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  deviceMode === "desktop" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                }`}
                title="Desktop View"
              >
                <Monitor size={14} />
                <span className="hidden md:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  deviceMode === "mobile" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                }`}
                title="Mobile View"
              >
                <Smartphone size={14} />
                <span className="hidden md:inline">Mobile</span>
              </button>
            </div>

            {/* Language Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setPreviewLang("en")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  previewLang === "en" ? "bg-white text-primary-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English Preview
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang("ur")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold font-urdu transition-all cursor-pointer ${
                  previewLang === "ur" ? "bg-white text-primary-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                اردو پیش نظارہ
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border-b border-amber-200/60 px-6 py-2 flex items-center gap-2 text-amber-850 text-xs font-medium shrink-0">
          <AlertCircle size={14} className="shrink-0 text-amber-700" />
          <span>This is an interactive simulation of the live frontend layout. Save your changes to apply them to the public website.</span>
        </div>

        {/* Preview viewport wrapper */}
        <div className="flex-1 overflow-y-auto bg-slate-200/40 p-4 sm:p-8 flex justify-center items-start">
          <div 
            className={`bg-white transition-all duration-300 rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${
              deviceMode === "mobile" ? "max-w-[390px] w-full" : "w-full max-w-4xl"
            }`}
          >
            {/* Header of the simulated website */}
            <div className="bg-primary-900 text-white px-6 py-4 border-b border-primary-950 flex justify-between items-center shrink-0">
              <span className="font-extrabold text-sm tracking-wider uppercase">Mufti Munir Shakir</span>
              <span className={`text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? "پیش نظارہ" : "PREVIEW MODE"}
              </span>
            </div>

            {/* Content area based on type */}
            {type === "article" ? (
              <article className="pb-12">
                {/* Cover Featured Image */}
                <div className="relative h-[200px] sm:h-[320px] w-full bg-slate-150">
                  <img
                    src={data.featuredImage || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=1000"}
                    alt={title || "Featured Image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Date Badge */}
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 text-white bg-black/40 backdrop-blur-md py-1.5 px-3.5 rounded-full text-[11px] font-medium">
                    <Calendar size={12} />
                    <span>
                      {new Date().toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                {/* Interactive Stats Dashboard Strip */}
                <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-150 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 py-1.5 px-3 rounded-full text-slate-700 shadow-sm">
                      <Eye size={13} className="text-emerald-600 animate-pulse" />
                      <span>{isUrdu ? "124 مجموعی مشاہدات" : "124 total views"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 py-1.5 px-3 rounded-full text-green-700 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                      <span>{isUrdu ? "5 صارف پڑھ رہے ہیں" : "5 reading right now"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">{isUrdu ? "مضمون نگار" : "Author"}</span>
                    <span className={`font-bold text-slate-800 ${isUrdu ? "font-urdu text-sm" : ""}`}>
                      {isUrdu ? "مفتی منیر شاکر" : "Mufti Munir Shakir"}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Article Title */}
                  <div className="border-b border-slate-150 pb-4">
                    <h1 className={`text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight ${isUrdu ? "font-urdu text-right leading-snug" : ""}`}>
                      {renderFormattedTitle(title || (isUrdu ? "بغیر عنوان مضمون" : "Untitled Article"), isUrdu)}
                    </h1>
                  </div>

                  {/* Markdown content */}
                  <div className="max-w-none prose prose-slate">
                    {contentText ? (
                      renderFormattedText(contentText, isUrdu)
                    ) : (
                      <p className={`text-slate-400 italic text-sm ${isUrdu ? "text-right font-urdu" : ""}`}>
                        {isUrdu ? "ابھی تک کوئی مواد نہیں لکھا گیا ہے..." : "No content written yet..."}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ) : (
              /* Video Preview */
              <div className="pb-12">
                {/* Video Player */}
                {embedUrl ? (
                  <div className="aspect-video w-full bg-black relative">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video player preview"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-slate-900 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    {videoId ? (
                      <img 
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                        alt="Video Thumbnail placeholder" 
                        className="w-full h-full object-cover opacity-60 absolute inset-0"
                      />
                    ) : (
                      <PlayCircle size={48} className="text-slate-500 mb-2 animate-pulse" />
                    )}
                    <span className="text-sm font-bold z-10">{isUrdu ? "یوٹیوب ویڈیو لوڈ ہو رہی ہے" : "YouTube Video Player Preview"}</span>
                    <span className="text-xs text-slate-500 mt-1 max-w-sm z-10">
                      {data.videoUrl ? data.videoUrl : (isUrdu ? "براہ کرم اوپر فارم میں یوٹیوب لنک درج کریں" : "Please insert a valid YouTube URL in the form above")}
                    </span>
                  </div>
                )}

                {/* Video Header Stats */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 py-1.5 px-3 rounded-full text-slate-700 shadow-sm">
                      <Clock size={13} className="text-primary-600" />
                      <span>{isUrdu ? "آج اپ لوڈ کیا گیا" : "Uploaded Today"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 py-1.5 px-3 rounded-full text-green-700 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                      <span>{isUrdu ? "12 صارفین دیکھ رہے ہیں" : "12 active viewers"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">{isUrdu ? "مقرر" : "Speaker"}</span>
                    <span className={`font-bold text-slate-800 ${isUrdu ? "font-urdu text-sm" : ""}`}>
                      {isUrdu ? "مفتی منیر شاکر" : "Mufti Munir Shakir"}
                    </span>
                  </div>
                </div>

                {/* Title and details */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="border-b border-slate-150 pb-4">
                    <h1 className={`text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight ${isUrdu ? "font-urdu text-right leading-snug" : ""}`}>
                      {title || (isUrdu ? "بغیر عنوان ویڈیو بیان" : "Untitled Video")}
                    </h1>
                  </div>

                  {/* Description Markdown text */}
                  <div className="max-w-none prose prose-slate">
                    {contentText ? (
                      renderFormattedText(contentText, isUrdu)
                    ) : (
                      <p className={`text-slate-400 italic text-sm ${isUrdu ? "text-right font-urdu" : ""}`}>
                        {isUrdu ? "ابھی تک کوئی تفصیل نہیں لکھی گئی ہے..." : "No description written yet..."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
