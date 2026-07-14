import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import GenericHeader from "../components/layout/GenericHeader";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { MoveRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import { renderFormattedTitle } from "../lib/utils";

export default function Articles() {
  const { lang, t } = useLanguage();
  const { sections } = useSettings();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sections.articles) return;
    const fetchArticles = () => {
      supabase.from("articles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
        if (data) setArticles(data);
        setLoading(false);
      });
    };

    fetchArticles();

    const channel = supabase.channel('articles-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => {
        fetchArticles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sections.articles]);

  if (!sections.articles) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <GenericHeader titleEn="Articles" titleUr="مضامین" />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No articles found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link to={`/articles/${article.slug}`} key={article.id} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img src={article.featured_image || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=1000"} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-sm text-gray-500 mb-2">{new Date(article.created_at).toLocaleDateString()}</p>
                  <h2 className={`text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-700 transition-colors ${lang === 'ur' ? 'font-urdu text-right' : ''}`}>
                    {renderFormattedTitle(lang === "en" ? article.title_en : article.title_ur, lang === "ur")}
                  </h2>
                  <div className="mt-auto text-primary-700 font-medium text-sm flex items-center gap-1">
                    {t("readMore")} <MoveRight className="w-4 h-4 rtl:rotate-180" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
