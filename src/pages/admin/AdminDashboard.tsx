import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { FileText, Video, BookOpen, Quote, Book, FolderOpen } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    articles: 0,
    playlists: 0,
    videos: 0,
    quran: 0,
    hadith: 0,
    books: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [
        { count: articlesCount },
        { count: playlistsCount },
        { count: videosCount },
        { count: quranCount },
        { count: hadithCount },
        booksResponse
      ] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("playlists").select("*", { count: "exact", head: true }),
        supabase.from("bayan").select("*", { count: "exact", head: true }),
        supabase.from("quran").select("*", { count: "exact", head: true }),
        supabase.from("hadith").select("*", { count: "exact", head: true }),
        supabase.from("page_content").select("*").eq("page_name", "books_data").maybeSingle()
      ]);

      let booksCount = 0;
      if (booksResponse.data && booksResponse.data.content_en) {
        try {
          const parsed = JSON.parse(booksResponse.data.content_en);
          if (Array.isArray(parsed)) {
            booksCount = parsed.length;
          }
        } catch (e) {
          console.error("Failed to parse books JSON data:", e);
        }
      }

      setStats({
        articles: articlesCount || 0,
        playlists: playlistsCount || 0,
        videos: videosCount || 0,
        quran: quranCount || 0,
        hadith: hadithCount || 0,
        books: booksCount,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const articlesChannel = supabase.channel('dashboard-articles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => {
        fetchStats();
      })
      .subscribe();

    const playlistsChannel = supabase.channel('dashboard-playlists')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists' }, () => {
        fetchStats();
      })
      .subscribe();

    const videosChannel = supabase.channel('dashboard-videos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bayan' }, () => {
        fetchStats();
      })
      .subscribe();

    const quranChannel = supabase.channel('dashboard-quran')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quran' }, () => {
        fetchStats();
      })
      .subscribe();

    const hadithChannel = supabase.channel('dashboard-hadith')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hadith' }, () => {
        fetchStats();
      })
      .subscribe();

    const pageContentChannel = supabase.channel('dashboard-page-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_content', filter: 'page_name=eq.books_data' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(articlesChannel);
      supabase.removeChannel(playlistsChannel);
      supabase.removeChannel(videosChannel);
      supabase.removeChannel(quranChannel);
      supabase.removeChannel(hadithChannel);
      supabase.removeChannel(pageContentChannel);
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Total Articles */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Total Articles</h3>
            <p className="text-4xl font-bold text-primary-800 mt-2">
              {loading ? "..." : stats.articles}
            </p>
          </div>
          <div className="p-3 bg-primary-50 rounded-xl text-primary-700">
            <FileText size={24} />
          </div>
        </div>

        {/* Total Playlists */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Total Playlists</h3>
            <p className="text-4xl font-bold text-teal-800 mt-2">
              {loading ? "..." : stats.playlists}
            </p>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl text-teal-700">
            <FolderOpen size={24} />
          </div>
        </div>
        
        {/* Total Videos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Total Videos</h3>
            <p className="text-4xl font-bold text-blue-800 mt-2">
              {loading ? "..." : stats.videos}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <Video size={24} />
          </div>
        </div>

        {/* Total Quranic Surahs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Total Quranic Surahs</h3>
            <p className="text-4xl font-bold text-emerald-800 mt-2">
              {loading ? "..." : stats.quran}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Total Hadith */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Total Hadith</h3>
            <p className="text-4xl font-bold text-indigo-800 mt-2">
              {loading ? "..." : stats.hadith}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
            <Quote size={24} />
          </div>
        </div>

        {/* Total Books */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Total Books</h3>
            <p className="text-4xl font-bold text-amber-800 mt-2">
              {loading ? "..." : stats.books}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
            <Book size={24} />
          </div>
        </div>
      </div>
      
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to Admin Panel</h2>
        <p className="text-gray-600 leading-relaxed">
          From this panel, you have full access to add, update, and delete all records for the website. 
          Use the sidebar on the left to navigate to different sections. Currently, you can manage Articles, Playlists, Videos, Quran, Hadith, Books, and Bio information. 
          As you add real data to your Supabase tables, they will automatically appear here and on the public website.
        </p>
      </div>
    </div>
  );
}
