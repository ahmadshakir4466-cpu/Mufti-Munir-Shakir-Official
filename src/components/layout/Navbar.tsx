import { useLanguage } from "../../context/LanguageContext";
import { useSettings } from "../../context/SettingsContext";
import { Link } from "react-router-dom";
import { Menu, X, Home, FileText, Video, BookOpen, Library, User, Phone, Book, Gift } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { sections } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { id: "home", name: t("home"), path: "/", icon: <Home size={18} /> },
    { id: "articles", name: t("articles"), path: "/articles", icon: <FileText size={18} /> },
    { id: "videos", name: t("videos"), path: "/videos", icon: <Video size={18} /> },
    { id: "quran", name: t("quran"), path: "/quran", icon: <BookOpen size={18} /> },
    { id: "hadith", name: t("hadith"), path: "/hadith", icon: <Library size={18} /> },
    { id: "books", name: t("books"), path: "/books", icon: <Book size={18} /> },
    { id: "bio", name: t("bio"), path: "/about", icon: <User size={18} /> },
    { id: "contact", name: t("donate"), path: "/donate", icon: <Gift size={18} /> },
  ].filter(link => sections[link.id as keyof typeof sections]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-800">
              {lang === "en" ? "Mufti Munir Shakir" : "مفتی منیر شاکر"}
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-800 hover:bg-primary-50 transition-colors flex items-center gap-1.5"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4 rtl:ml-0 rtl:mr-4 border-l rtl:border-l-0 rtl:border-r border-gray-200 pl-4 rtl:pl-0 rtl:pr-4">
              <button
                onClick={() => setLang("en")}
                className={cn(
                  "px-2 py-1 text-xs font-semibold rounded cursor-pointer",
                  lang === "en" ? "bg-primary-800 text-white" : "text-gray-500 hover:text-primary-800"
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ur")}
                className={cn(
                  "px-2 py-1 text-xs font-semibold rounded font-urdu cursor-pointer",
                  lang === "ur" ? "bg-primary-800 text-white" : "text-gray-500 hover:text-primary-800"
                )}
              >
                اردو
              </button>
            </div>
          </div>
          
          {/* Header Controls for Mobile (Hamburger Only) */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-primary-800 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary-800 hover:bg-primary-50 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="flex space-x-2 rtl:space-x-reverse px-3 py-4 mt-2 border-t border-gray-100">
              <button
                onClick={() => { setLang("en"); setIsOpen(false); }}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-md flex-1 cursor-pointer",
                  lang === "en" ? "bg-primary-800 text-white" : "text-gray-500 bg-gray-100"
                )}
              >
                English
              </button>
              <button
                onClick={() => { setLang("ur"); setIsOpen(false); }}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-md flex-1 font-urdu cursor-pointer",
                  lang === "ur" ? "bg-primary-800 text-white" : "text-gray-500 bg-gray-100"
                )}
              >
                اردو
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
