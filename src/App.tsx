/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { LanguageProvider } from "./context/LanguageContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import VideoList from "./pages/VideoList";
import VideoDetail from "./pages/VideoDetail";
import PlaylistDetail from "./pages/PlaylistDetail";
import Quran from "./pages/Quran";
import Hadith from "./pages/Hadith";
import Books from "./pages/Books";
import Donate from "./pages/Donate";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminPlaylists from "./pages/admin/AdminPlaylists";
import AdminQuran from "./pages/admin/AdminQuran";
import AdminHadith from "./pages/admin/AdminHadith";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminBio from "./pages/admin/AdminBio";
import AdminContact from "./pages/admin/AdminContact";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminHome from "./pages/admin/AdminHome";
import AdminFooter from "./pages/admin/AdminFooter";

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <LanguageProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="articles" element={<Articles />} />
                <Route path="articles/:slug" element={<ArticleDetail />} />
                <Route path="videos" element={<VideoList />} />
                <Route path="videos/:slug" element={<VideoDetail />} />
                <Route path="playlists/:slug" element={<PlaylistDetail />} />
                <Route path="quran" element={<Quran />} />
                <Route path="hadith" element={<Hadith />} />
                <Route path="books" element={<Books />} />
                <Route path="donate" element={<Donate />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
              
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="home" element={<AdminHome />} />
                <Route path="articles" element={<AdminArticles />} />
                <Route path="playlists" element={<AdminPlaylists />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="quran" element={<AdminQuran />} />
                <Route path="hadith" element={<AdminHadith />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="bio" element={<AdminBio />} />
                <Route path="contact" element={<AdminContact />} />
                <Route path="footer" element={<AdminFooter />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
