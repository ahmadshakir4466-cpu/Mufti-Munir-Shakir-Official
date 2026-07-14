import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { LayoutDashboard, FileText, Video, LogOut, Home, BookOpen, Library, User, Phone, Settings, ListVideo, Book, Gift, Menu, X } from "lucide-react";

const ADMIN_UID = "28501153-8038-4e13-86cc-8b400a1b92c7";

export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Automatically close sidebar when route changes on mobile
    setSidebarOpen(false);
  }, [location.pathname]);

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
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed drawer on mobile, static on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-primary-900 text-white flex flex-col shadow-xl z-30 
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:h-screen lg:overflow-y-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-primary-800 flex items-center justify-between sticky top-0 bg-primary-900 z-10">
          <Link to="/" className="text-xl font-bold flex flex-col">
            <span>Admin Panel</span>
            <span className="text-xs font-normal text-primary-200 mt-1">Mufti Munir Shakir</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-primary-200 hover:text-white rounded-lg hover:bg-primary-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menu.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${location.pathname.startsWith(item.path) ? "bg-primary-800 text-white font-medium" : "text-primary-100 hover:bg-primary-800 hover:text-white"}`}
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

      {/* Main Content Pane */}
      <main className="flex-1 bg-gray-50 flex flex-col min-h-screen min-w-0">
        <header className="bg-white px-6 md:px-8 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center gap-4 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Control Panel</h1>
        </header>
        <div className="p-4 md:p-8 pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
