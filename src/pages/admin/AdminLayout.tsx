import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { LayoutDashboard, FileText, Video, LogOut, Home, BookOpen, Library, User, Phone, Settings, ListVideo, Book, Gift } from "lucide-react";

const ADMIN_UID = "28501153-8038-4e13-86cc-8b400a1b92c7";

export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (session.user?.id === ADMIN_UID) {
          setSession(session);
        } else {
          supabase.auth.signOut().then(() => {
            navigate("/admin/login", { 
              state: { error: "You are not authorized to access the Admin Panel." } 
            });
          });
        }
      } else {
        navigate("/admin/login");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (session.user?.id === ADMIN_UID) {
          setSession(session);
        } else {
          supabase.auth.signOut().then(() => {
            navigate("/admin/login", { 
              state: { error: "You are not authorized to access the Admin Panel." } 
            });
          });
        }
      } else {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Admin Panel...</div>;
  if (!session) return null; // Will redirect via effect

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Home", path: "/admin/home", icon: <Home size={20} /> },
    { name: "Articles", path: "/admin/articles", icon: <FileText size={20} /> },
    { name: "Playlists", path: "/admin/playlists", icon: <ListVideo size={20} /> },
    { name: "Videos", path: "/admin/videos", icon: <Video size={20} /> },
    { name: "Quran", path: "/admin/quran", icon: <BookOpen size={20} /> },
    { name: "Hadith", path: "/admin/hadith", icon: <Library size={20} /> },
    { name: "Books", path: "/admin/books", icon: <Book size={20} /> },
    { name: "Bio", path: "/admin/bio", icon: <User size={20} /> },
    { name: "Donations", path: "/admin/contact", icon: <Gift size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-primary-900 text-white flex flex-col shadow-xl z-10 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-primary-800 sticky top-0 bg-primary-900">
          <Link to="/" className="text-xl font-bold flex flex-col">
            <span>Admin Panel</span>
            <span className="text-xs font-normal text-primary-200 mt-1">Mufti Munir Shakir</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menu.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.startsWith(item.path) ? "bg-primary-800 text-white font-medium" : "text-primary-100 hover:bg-primary-800 hover:text-white"}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-800 sticky bottom-0 bg-primary-900">
           <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-left text-primary-100 hover:bg-primary-800 hover:text-white rounded-lg transition-colors">
             <LogOut size={20} />
             Logout
           </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 flex flex-col min-h-screen">
        <header className="bg-white px-8 py-4 border-b border-gray-200 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">Control Panel</h1>
        </header>
        <div className="p-8 pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
