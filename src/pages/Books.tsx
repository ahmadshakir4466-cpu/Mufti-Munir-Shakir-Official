import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import GenericHeader from "../components/layout/GenericHeader";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { supabase } from "../lib/supabase";
import { BookOpen, Download, ExternalLink, Loader2 } from "lucide-react";
import { renderFormattedTitle } from "../lib/utils";

interface Book {
  id: string;
  title_en: string;
  title_ur: string;
  description_en: string;
  description_ur: string;
  cover_image: string;
  pdf_url: string;
  created_at: string;
}

export default function Books() {
  const { lang, t } = useLanguage();
  const { sections } = useSettings();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sections.books) return;

    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_name", "books_data")
          .maybeSingle();

        if (error) throw error;

        if (data && data.content_en) {
          try {
            const parsed = JSON.parse(data.content_en);
            setBooks(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setBooks([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();

    // Setup real-time updates
    const channel = supabase.channel('public-books-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_content', filter: "page_name=eq.books_data" }, fetchBooks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sections.books]);

  // If books section is disabled in admin settings, redirect to home page
  if (!sections.books) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <GenericHeader titleEn="Books Library" titleUr="کتب خانہ" />
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-3">
            <Loader2 className="w-10 h-10 text-primary-700 animate-spin" />
            <span className="text-gray-500 font-medium text-sm">Loading books library...</span>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-350 mx-auto mb-4" />
            <h3 className={`text-xl font-bold text-gray-800 ${lang === 'ur' ? 'font-urdu' : ''}`}>
              {lang === "en" ? "No Books Available" : "کوئی کتاب دستیاب نہیں ہے"}
            </h3>
            <p className={`text-gray-500 text-sm mt-1 max-w-sm mx-auto leading-relaxed ${lang === 'ur' ? 'font-urdu' : ''}`}>
              {lang === "en" 
                ? "Our scholarly library is being updated. Please check back later." 
                : "ہمارا علمی کتب خانہ فی الحال اپڈیٹ کیا جا رہا ہے۔ براہ کرم کچھ دیر بعد دوبارہ چیک کریں۔"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => {
              const title = lang === "en" ? book.title_en : book.title_ur;
              const desc = lang === "en" ? book.description_en : book.description_ur;
              
              return (
                <div 
                  key={book.id} 
                  className="group bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Book Cover */}
                  <div className="aspect-[3/4] overflow-hidden relative bg-gray-100 flex-shrink-0 border-b border-gray-100">
                    <img 
                      src={book.cover_image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600"} 
                      alt={lang === 'en' ? book.title_en : book.title_ur} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className={`font-bold text-gray-900 group-hover:text-primary-800 transition-colors ${lang === 'ur' ? 'font-urdu text-lg !leading-[1.7] text-right' : 'text-md leading-snug'}`}>
                        {renderFormattedTitle(title || (lang === 'en' ? book.title_ur : book.title_en), lang === "ur")}
                      </h3>
                      {desc && (
                        <p className={`text-gray-500 text-xs line-clamp-3 ${lang === 'ur' ? 'font-urdu !leading-[1.8] text-right' : 'leading-relaxed'}`}>
                          {renderFormattedTitle(desc, lang === "ur")}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
                      {/* Read Online Button */}
                      <a 
                        href={book.pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-750 hover:bg-primary-800 text-white text-xs font-semibold shadow-sm transition-all"
                        style={{ backgroundColor: '#1b5e20' }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{lang === "en" ? "Read Online" : "آن لائن پڑھیں"}</span>
                      </a>

                      {/* Download Button */}
                      <a 
                        href={book.pdf_url} 
                        download={`${title || 'Islamic-Book'}.pdf`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-250 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-gray-500" />
                        <span>{lang === "en" ? "Download PDF" : "ڈاؤن لوڈ کریں"}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
