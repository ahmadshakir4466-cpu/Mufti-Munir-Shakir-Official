import React, { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Plus, Edit, Trash, X, ArrowUp, ArrowDown, GripVertical, 
  ArrowLeft, Video, Film, ListVideo, Check, AlertCircle, PlayCircle, Eye 
} from "lucide-react";
import TextFormattingToolbar from "../../components/admin/TextFormattingToolbar";
import { extractYouTubeId } from "../../lib/utils";
import AdminPreviewModal from "../../components/admin/AdminPreviewModal";

export default function AdminVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Selected playlist state and scroll persistence
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [savedScrollPos, setSavedScrollPos] = useState<number>(0);

  const handleOpenPlaylist = (id: string) => {
    const mainEl = document.querySelector("main");
    const currentScroll = mainEl ? mainEl.scrollTop : 0;
    setSavedScrollPos(currentScroll);
    setSelectedPlaylistId(id);
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  };

  const handleBackToPlaylists = () => {
    setSelectedPlaylistId(null);
    setTimeout(() => {
      const mainEl = document.querySelector("main");
      if (mainEl) {
        mainEl.scrollTop = savedScrollPos;
      }
    }, 50);
  };

  // Form states
  const [descEn, setDescEn] = useState<string>("");
  const [descUr, setDescUr] = useState<string>("");
  const [titleEn, setTitleEn] = useState<string>("");
  const [titleUr, setTitleUr] = useState<string>("");
  const [playlistId, setPlaylistId] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isPinned, setIsPinned] = useState<boolean>(false);

  // Preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Drag and drop states
  const [draggedVideoId, setDraggedVideoId] = useState<string | null>(null);
  const [draggedOverVideoId, setDraggedOverVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      setTitleEn(currentVideo?.title_en || "");
      setTitleUr(currentVideo?.title_ur || "");
      setDescEn(currentVideo?.description_en || "");
      setDescUr(currentVideo?.description_ur || "");
      setPlaylistId(currentVideo?.playlist_id || "");
      setVideoUrl(currentVideo?.video_url || "");
      setIsPinned(currentVideo?.published || false);
    } else {
      setTitleEn("");
      setTitleUr("");
      setDescEn("");
      setDescUr("");
      setPlaylistId(selectedPlaylistId && selectedPlaylistId !== "standalone" ? selectedPlaylistId : "");
      setVideoUrl("");
      setIsPinned(false);
    }
  }, [currentVideo, isEditing, selectedPlaylistId]);

  const fetchPlaylists = async () => {
    const { data } = await supabase.from("playlists").select("*").order("created_at", { ascending: false });
    if (data) setPlaylists(data);
  };

  const fetchVideos = async (showLoadingScreen = false) => {
    if (showLoadingScreen) setLoading(true);
    const { data, error } = await supabase
      .from("bayan")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setVideos(data);
    else if (error) console.error("Error fetching videos:", error);
    if (showLoadingScreen) setLoading(false);
  };

  useEffect(() => {
    fetchVideos(true);
    fetchPlaylists();

    const channel = supabase.channel('bayan-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bayan' }, () => {
        fetchVideos(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Auto-extract thumbnail from YouTube URL
    let thumbnailUrl = "";
    const ytId = extractYouTubeId(videoUrl);
    if (ytId) {
      thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Math.random().toString(36).substring(2, 6);
    };

    const slugValue = currentVideo?.slug || generateSlug(titleEn);

    const payload = {
      title_en: titleEn,
      title_ur: titleUr,
      slug: slugValue,
      description_en: descEn,
      description_ur: descUr,
      video_url: videoUrl,
      thumbnail: thumbnailUrl,
      playlist_id: playlistId || null,
      published: playlistId ? false : isPinned,
    };

    if (currentVideo?.id) {
      const { error } = await supabase.from("bayan").update(payload).eq("id", currentVideo.id);
      if (error) alert("Error updating: " + error.message);
    } else {
      const { error } = await supabase.from("bayan").insert(payload);
      if (error) alert("Error creating: " + error.message);
    }
    
    setIsEditing(false);
    fetchVideos();
  };

  const handleDelete = async (id: string|null) => {
    if (!id) return;
    const { error } = await supabase.from("bayan").delete().eq("id", id);
    if (error) {
      console.error("Error deleting:", error.message);
    } else {
      fetchVideos();
    }
    setDeleteTargetId(null);
  };

  const handleMoveUpInPlaylist = async (item: any, currentPlaylistVideos: any[]) => {
    const index = currentPlaylistVideos.indexOf(item);
    if (index <= 0) return;
    const prevItem = currentPlaylistVideos[index - 1];

    const mainEl = document.querySelector("main");
    const currentScrollY = mainEl ? mainEl.scrollTop : 0;

    await supabase.from("bayan").update({ created_at: prevItem.created_at }).eq("id", item.id);
    await supabase.from("bayan").update({ created_at: item.created_at }).eq("id", prevItem.id);
    
    await fetchVideos(false);

    setTimeout(() => {
      if (mainEl) mainEl.scrollTop = currentScrollY;
    }, 0);
  };

  const handleMoveDownInPlaylist = async (item: any, currentPlaylistVideos: any[]) => {
    const index = currentPlaylistVideos.indexOf(item);
    if (index === -1 || index >= currentPlaylistVideos.length - 1) return;
    const nextItem = currentPlaylistVideos[index + 1];

    const mainEl = document.querySelector("main");
    const currentScrollY = mainEl ? mainEl.scrollTop : 0;

    await supabase.from("bayan").update({ created_at: nextItem.created_at }).eq("id", item.id);
    await supabase.from("bayan").update({ created_at: item.created_at }).eq("id", nextItem.id);
    
    await fetchVideos(false);

    setTimeout(() => {
      if (mainEl) mainEl.scrollTop = currentScrollY;
    }, 0);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedVideoId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedVideoId && draggedVideoId !== id) {
      setDraggedOverVideoId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedVideoId(null);
    setDraggedOverVideoId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedVideoId || draggedVideoId === targetId) return;

    const videoA = videos.find(v => v.id === draggedVideoId);
    const videoB = videos.find(v => v.id === targetId);
    if (!videoA || !videoB || videoA.playlist_id !== videoB.playlist_id) return;

    const groupVideos = videos.filter(v => v.playlist_id === videoA.playlist_id);
    const indexA = groupVideos.findIndex(v => v.id === videoA.id);
    const indexB = groupVideos.findIndex(v => v.id === videoB.id);
    if (indexA === -1 || indexB === -1 || indexA === indexB) return;

    const newGroup = [...groupVideos];
    const [moved] = newGroup.splice(indexA, 1);
    newGroup.splice(indexB, 0, moved);

    const existingTimestamps = groupVideos.map(v => v.created_at);
    const mainEl = document.querySelector("main");
    const currentScrollY = mainEl ? mainEl.scrollTop : 0;

    // Silent state update to DB to prevent jumping/flickering
    for (let i = 0; i < newGroup.length; i++) {
      const item = newGroup[i];
      const newTimestamp = existingTimestamps[i];
      if (item.created_at !== newTimestamp) {
        await supabase.from("bayan").update({ created_at: newTimestamp }).eq("id", item.id);
      }
    }

    await fetchVideos(false);

    setTimeout(() => {
      if (mainEl) mainEl.scrollTop = currentScrollY;
    }, 0);

    setDraggedVideoId(null);
    setDraggedOverVideoId(null);
  };

  // Find active playlist
  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const activeVideos = selectedPlaylistId === "standalone" 
    ? videos.filter(v => !v.playlist_id)
    : videos.filter(v => v.playlist_id === selectedPlaylistId);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      {selectedPlaylistId === null ? (
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Videos & Playlists</h1>
          <p className="text-gray-500 mt-1">Select a playlist card below to view, add, or arrange its videos.</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-6">
          <div className="space-y-2">
            <button 
              onClick={handleBackToPlaylists} 
              className="flex items-center gap-2 text-primary-800 hover:text-primary-900 font-bold text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Playlists
            </button>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm ${selectedPlaylistId === 'standalone' ? 'bg-gray-100 text-gray-700' : 'bg-primary-550/10 text-primary-800 border border-primary-100'}`}>
                {selectedPlaylistId === "standalone" ? "Standalone" : "Playlist"}
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900">
                {selectedPlaylistId === "standalone" ? "Other Videos (Standalone)" : activePlaylist?.title_en}
              </h1>
            </div>
            {selectedPlaylistId !== "standalone" && activePlaylist?.title_ur && (
              <h2 className="text-lg font-bold font-urdu text-gray-600" dir="rtl">
                {activePlaylist.title_ur}
              </h2>
            )}
          </div>

          <button 
            onClick={() => { setCurrentVideo(null); setIsEditing(true); }} 
            className="bg-primary-800 hover:bg-primary-900 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus size={18} /> Add Video
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center text-gray-500">
          <div className="w-10 h-10 border-4 border-primary-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          Loading media database...
        </div>
      ) : (
        <>
          {/* PLAYLISTS GRID (DEFAULT VIEW) */}
          {selectedPlaylistId === null && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist) => {
                  const playlistVideosCount = videos.filter(v => v.playlist_id === playlist.id).length;
                  return (
                    <div 
                      key={playlist.id}
                      onClick={() => handleOpenPlaylist(playlist.id)}
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden cursor-pointer flex flex-col transition-all duration-250 hover:-translate-y-1"
                    >
                      <div className="aspect-video relative overflow-hidden bg-gray-150 shrink-0">
                        <img 
                          src={playlist.thumbnail || "https://images.unsplash.com/photo-1601314002592-b8734b139c43?auto=format&fit=crop&q=80&w=1000"} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors"></div>
                        <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                          <PlayCircle className="w-3.5 h-3.5 text-primary-400" />
                          <span>{playlistVideosCount} Videos</span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                            <span className="text-[10px] font-bold text-primary-700 tracking-wider uppercase">Playlist</span>
                          </div>
                          
                          <h3 className="font-extrabold text-gray-900 group-hover:text-primary-800 transition-colors text-base line-clamp-2 leading-snug">
                            {playlist.title_en}
                          </h3>
                          {playlist.title_ur && (
                            <h3 className="font-bold font-urdu text-right text-gray-700 group-hover:text-primary-800 transition-colors text-sm line-clamp-1 mt-1 leading-relaxed" dir="rtl">
                              {playlist.title_ur}
                            </h3>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {playlist.description_en || "No description provided."}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Standalone Videos Card */}
                {(() => {
                  const standaloneVideosCount = videos.filter(v => !v.playlist_id).length;
                  return (
                    <div 
                      onClick={() => handleOpenPlaylist("standalone")}
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden cursor-pointer flex flex-col transition-all duration-250 hover:-translate-y-1"
                    >
                      <div className="aspect-video relative overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center border-b border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform duration-300">
                          <Film className="w-8 h-8" />
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                          <PlayCircle className="w-3.5 h-3.5 text-gray-400" />
                          <span>{standaloneVideosCount} Videos</span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Standalone</span>
                          </div>
                          
                          <h3 className="font-extrabold text-gray-900 group-hover:text-primary-800 transition-colors text-base line-clamp-2 leading-snug">
                            Other Videos / Standalone
                          </h3>
                          <h3 className="font-bold font-urdu text-right text-gray-700 group-hover:text-primary-800 transition-colors text-sm line-clamp-1 mt-1 leading-relaxed" dir="rtl">
                            دیگر بیانات / متفرقہ ویڈیوز
                          </h3>
                        </div>
                        
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Standalone videos and lectures that are not organized inside a specific playlist.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* DETAILED PLAYLIST VIDEOS TABLE VIEW */}
          {selectedPlaylistId !== null && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-sm">
                    <tr>
                      <th className="p-4 pl-12 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 pr-6 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeVideos.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-12 text-center text-gray-500">
                          <Video className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                          <p className="font-semibold text-gray-700">No videos in this playlist yet.</p>
                          <p className="text-xs text-gray-500 mt-1">Click "Add Video" to add your first video to this list.</p>
                        </td>
                      </tr>
                    ) : (
                      activeVideos.map((item, index) => {
                        const isDragging = draggedVideoId === item.id;
                        const isDraggedOver = draggedOverVideoId === item.id;
                        return (
                          <tr 
                            key={item.id} 
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={(e) => handleDragOver(e, item.id)}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, item.id)}
                            className={`transition-all ${
                              isDragging ? "opacity-30 bg-slate-150 border-2 border-dashed border-primary-300" : ""
                            } ${
                              isDraggedOver ? "bg-primary-50 border-y-2 border-primary-400" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="p-4 pl-6 font-semibold text-gray-900 flex items-center gap-3">
                              <div 
                                className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors shrink-0"
                                title="Hold left-click and drag to move up/down"
                                onDragStart={(e) => e.stopPropagation()}
                              >
                                <GripVertical size={18} />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="truncate max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl font-bold text-gray-900" title={item.title_en}>
                                    {item.title_en}
                                  </span>
                                  {item.published && selectedPlaylistId === "standalone" && (
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-amber-200">
                                      📌 Pinned
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                            <td className="p-4 pr-6 flex justify-end gap-2 shrink-0">
                              <button 
                                onClick={() => handleMoveUpInPlaylist(item, activeVideos)} 
                                disabled={index === 0}
                                className={`p-2 rounded-lg transition-colors ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                title="Move Up"
                              >
                                <ArrowUp size={18} />
                              </button>
                              <button 
                                onClick={() => handleMoveDownInPlaylist(item, activeVideos)} 
                                disabled={index === activeVideos.length - 1}
                                className={`p-2 rounded-lg transition-colors ${index === activeVideos.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                title="Move Down"
                              >
                                <ArrowDown size={18} />
                              </button>
                              <button 
                                onClick={() => { setCurrentVideo(item); setIsEditing(true); }} 
                                className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => setDeleteTargetId(item.id)} 
                                className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL DIALOG POPUP FOR ADD/EDIT VIDEO (ON THE SAME SCREEN) */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-100 transform scale-100 transition-all flex flex-col">
            {/* Modal sticky header */}
            <div className="p-6 border-b border-gray-150 flex justify-between items-center bg-gray-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-2 text-primary-800">
                <Video className="w-5 h-5" />
                <h2 className="text-xl font-extrabold text-gray-900">
                  {currentVideo ? "Edit Video / Bayan Details" : "Add Video / Bayan"}
                </h2>
              </div>
              <button 
                onClick={() => setIsEditing(false)} 
                className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal scrollable form content */}
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
              {/* Form title fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title (English)</label>
                  <TextFormattingToolbar 
                    textareaId="video_title_en" 
                    value={titleEn} 
                    onChange={setTitleEn} 
                    lang="en" 
                  />
                  <textarea 
                    id="video_title_en"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    required 
                    rows={1}
                    className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium bg-white" 
                    placeholder="Enter video title in english..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right font-urdu" dir="rtl">Title (Urdu)</label>
                  <TextFormattingToolbar 
                    textareaId="video_title_ur" 
                    value={titleUr} 
                    onChange={setTitleUr} 
                    lang="ur" 
                  />
                  <textarea 
                    id="video_title_ur"
                    value={titleUr}
                    onChange={(e) => setTitleUr(e.target.value)}
                    required 
                    rows={1}
                    className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm bg-white" 
                    dir="rtl"
                    placeholder="عنوان درج کریں..."
                  />
                </div>
              </div>

              {/* Form playlist and video url fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Playlist Selection</label>
                  <select 
                    value={playlistId} 
                    onChange={(e) => setPlaylistId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                  >
                    <option value="">No Playlist (Standalone Video)</option>
                    {playlists.map(p => (
                      <option key={p.id} value={p.id}>{p.title_en}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL (Embed or Direct)</label>
                  <input 
                    name="video_url" 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white font-mono" 
                    placeholder="https://youtube.com/watch?v=..." 
                  />
                </div>
              </div>

              {/* Pin option for videos - only available for standalone videos */}
              {!playlistId && (
                <div className="flex items-center gap-3 bg-amber-50/50 border border-amber-200/60 p-4 rounded-xl shadow-sm">
                  <input 
                    type="checkbox" 
                    id="pin_video"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-5 h-5 text-primary-800 border-gray-300 rounded focus:ring-primary-600 focus:ring-offset-0 cursor-pointer accent-primary-800"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="pin_video" className="text-sm font-bold text-gray-800 cursor-pointer select-none">
                      📌 Pin this video
                    </label>
                    <span className="text-xs text-gray-500 leading-relaxed">
                      Pinned videos will appear at the very top of the website's video list and also be showcased on the homepage.
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  The high-quality video thumbnail image will be automatically extracted and downloaded from the provided YouTube URL upon saving.
                </p>
              </div>

              {/* Form description fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (English)</label>
                  <TextFormattingToolbar 
                    textareaId="video_desc_en"
                    value={descEn}
                    onChange={val => setDescEn(val)}
                    lang="en"
                  />
                  <textarea 
                    id="video_desc_en"
                    value={descEn} 
                    onChange={(e) => setDescEn(e.target.value)}
                    required 
                    rows={5} 
                    className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-right font-urdu" dir="rtl">تفصیل (Urdu)</label>
                  <TextFormattingToolbar 
                    textareaId="video_desc_ur"
                    value={descUr}
                    onChange={val => setDescUr(val)}
                    lang="ur"
                  />
                  <textarea 
                    id="video_desc_ur"
                    value={descUr} 
                    onChange={(e) => setDescUr(e.target.value)}
                    required 
                    rows={5} 
                    className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm bg-white" 
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Form action buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-150 flex-wrap">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsPreviewOpen(true)} 
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Eye size={16} /> Preview Video
                </button>
                <button 
                  type="submit" 
                  className="bg-primary-800 hover:bg-primary-900 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  {currentVideo ? "Save & Update Video" : "Publish Video"}
                </button>
              </div>
            </form>

            <AdminPreviewModal
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              type="video"
              data={{
                titleEn,
                titleUr,
                descriptionEn: descEn,
                descriptionUr: descUr,
                videoUrl
              }}
            />
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-gray-100 transform scale-100 transition-all">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-extrabold">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Are you sure you want to delete this video? This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setDeleteTargetId(null)} 
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteTargetId)} 
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer"
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
