import React, { useState, useEffect, FormEvent } from "react";
import { supabase, uploadImageToStorage } from "../../lib/supabase";
import { Plus, Edit, Trash, X, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import TextFormattingToolbar from "../../components/admin/TextFormattingToolbar";
import ImageCropperModal from "../../components/admin/ImageCropperModal";

export default function AdminPlaylists() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [descEn, setDescEn] = useState<string>("");
  const [descUr, setDescUr] = useState<string>("");
  const [titleEn, setTitleEn] = useState<string>("");
  const [titleUr, setTitleUr] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  // Image Cropper States
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Drag and drop states
  const [draggedPlaylistId, setDraggedPlaylistId] = useState<string | null>(null);
  const [draggedOverPlaylistId, setDraggedOverPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      setTitleEn(currentPlaylist?.title_en || "");
      setTitleUr(currentPlaylist?.title_ur || "");
      setDescEn(currentPlaylist?.description_en || "");
      setDescUr(currentPlaylist?.description_ur || "");
      setThumbnailUrl(currentPlaylist?.thumbnail || "");
    } else {
      setTitleEn("");
      setTitleUr("");
      setDescEn("");
      setDescUr("");
      setThumbnailUrl("");
    }
  }, [currentPlaylist, isEditing]);

  const fetchPlaylists = async (showLoadingScreen = false) => {
    if (showLoadingScreen) setLoading(true);
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setPlaylists(data);
    else if (error) console.error("Error fetching playlists:", error);
    if (showLoadingScreen) setLoading(false);
  };

  useEffect(() => {
    fetchPlaylists(true);

    const channel = supabase.channel('playlists-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists' }, () => {
        fetchPlaylists(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperFile(file);
    setIsCropperOpen(true);
    e.target.value = ""; // Clear input so selecting same file works again
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Math.random().toString(36).substring(2, 6);
    };

    const slugValue = currentPlaylist?.slug || generateSlug(titleEn);

    const payload = {
      title_en: titleEn,
      title_ur: titleUr,
      slug: slugValue,
      description_en: descEn,
      description_ur: descUr,
      thumbnail: thumbnailUrl,
    };

    if (currentPlaylist?.id) {
      const { error } = await supabase.from("playlists").update(payload).eq("id", currentPlaylist.id);
      if (error) alert("Error updating: " + error.message);
    } else {
      const { error } = await supabase.from("playlists").insert(payload);
      if (error) alert("Error creating: " + error.message);
    }
    
    setIsEditing(false);
    fetchPlaylists(true);
  };

  const handleDelete = async (id: string|null) => {
    if (!id) return;
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (error) {
      console.error("Error deleting:", error.message);
    } else {
      fetchPlaylists(true);
    }
    setDeleteTargetId(null);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const currentItem = playlists[index];
    const prevItem = playlists[index - 1];

    const currentScrollY = window.scrollY;

    await supabase.from("playlists").update({ created_at: prevItem.created_at }).eq("id", currentItem.id);
    await supabase.from("playlists").update({ created_at: currentItem.created_at }).eq("id", prevItem.id);
    await fetchPlaylists(false);

    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  const handleMoveDown = async (index: number) => {
    if (index === playlists.length - 1) return;
    const currentItem = playlists[index];
    const nextItem = playlists[index + 1];

    const currentScrollY = window.scrollY;

    await supabase.from("playlists").update({ created_at: nextItem.created_at }).eq("id", currentItem.id);
    await supabase.from("playlists").update({ created_at: currentItem.created_at }).eq("id", nextItem.id);
    await fetchPlaylists(false);

    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  // Playlist Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedPlaylistId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedPlaylistId && draggedPlaylistId !== id) {
      setDraggedOverPlaylistId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedPlaylistId(null);
    setDraggedOverPlaylistId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedPlaylistId || draggedPlaylistId === targetId) return;

    const indexA = playlists.findIndex(p => p.id === draggedPlaylistId);
    const indexB = playlists.findIndex(p => p.id === targetId);
    if (indexA === -1 || indexB === -1) return;

    const newPlaylists = [...playlists];
    const [moved] = newPlaylists.splice(indexA, 1);
    newPlaylists.splice(indexB, 0, moved);

    const existingTimestamps = playlists.map(p => p.created_at);
    const currentScrollY = window.scrollY;

    // Save playlist order to DB
    for (let i = 0; i < newPlaylists.length; i++) {
      const item = newPlaylists[i];
      const newTimestamp = existingTimestamps[i];
      if (item.created_at !== newTimestamp) {
        await supabase.from("playlists").update({ created_at: newTimestamp }).eq("id", item.id);
      }
    }

    await fetchPlaylists(false);

    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);

    setDraggedPlaylistId(null);
    setDraggedOverPlaylistId(null);
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{currentPlaylist ? "Edit Playlist" : "New Playlist"}</h1>
          <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800 p-2">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title (English)</label>
                <TextFormattingToolbar 
                  textareaId="playlist_title_en" 
                  value={titleEn} 
                  onChange={setTitleEn} 
                  lang="en" 
                />
                <textarea 
                  id="playlist_title_en"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required 
                  rows={1}
                  className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium" 
                  placeholder="Enter playlist title in english..."
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right font-urdu" dir="rtl">Title (Urdu)</label>
                <TextFormattingToolbar 
                  textareaId="playlist_title_ur" 
                  value={titleUr} 
                  onChange={setTitleUr} 
                  lang="ur" 
                />
                <textarea 
                  id="playlist_title_ur"
                  value={titleUr}
                  onChange={(e) => setTitleUr(e.target.value)}
                  required 
                  rows={1}
                  className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm" 
                  dir="rtl"
                  placeholder="عنوان درج کریں..."
                />
             </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
            <div className="flex items-center gap-4">
              {thumbnailUrl && <img src={thumbnailUrl} alt="Thumbnail preview" className="w-28 aspect-video object-cover rounded shadow-sm border border-gray-200" />}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
                <TextFormattingToolbar 
                  textareaId="playlist_desc_en"
                  value={descEn}
                  onChange={val => setDescEn(val)}
                  lang="en"
                />
                <textarea 
                  id="playlist_desc_en"
                  value={descEn} 
                  onChange={(e) => setDescEn(e.target.value)}
                  rows={5} 
                  className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right font-urdu" dir="rtl">تفصیل (Urdu)</label>
                <TextFormattingToolbar 
                  textareaId="playlist_desc_ur"
                  value={descUr}
                  onChange={val => setDescUr(val)}
                  lang="ur"
                />
                <textarea 
                  id="playlist_desc_ur"
                  value={descUr} 
                  onChange={(e) => setDescUr(e.target.value)}
                  rows={5} 
                  className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right" 
                  dir="rtl"
                />
             </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button type="submit" className="bg-primary-800 hover:bg-primary-900 text-white font-medium px-8 py-3 rounded-md transition-colors">
              {currentPlaylist ? "Update Playlist" : "Create Playlist"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-8 py-3 rounded-md transition-colors">
              Cancel
            </button>
          </div>
        </form>

        <ImageCropperModal
          isOpen={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setCropperFile(null);
          }}
          imageFile={cropperFile}
          defaultAspectRatio={16/9} // Playlists are landscape thumbnails
          onCrop={async (croppedBase64) => {
            try {
              const url = await uploadImageToStorage(croppedBase64, "playlist-thumb");
              if (url) {
                setThumbnailUrl(url);
              }
            } catch (err) {
              console.error("Upload error:", err);
              alert("Failed to upload cropped image.");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Playlists</h1>
        <button 
          onClick={() => { setCurrentPlaylist(null); setIsEditing(true); }} 
          className="bg-primary-800 hover:bg-primary-900 text-white font-medium px-6 py-3 rounded-md flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} /> Add New Playlist
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="p-4 pl-12">Title</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center text-gray-500">Loading playlists...</td></tr>
              ) : playlists.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-gray-500">
                    <p className="mb-2">No playlists found in database.</p>
                    <p className="text-sm">Click "Add New Playlist" to create your first entry.</p>
                  </td>
                </tr>
              ) : (
                playlists.map((item, index) => {
                  const isDragging = draggedPlaylistId === item.id;
                  const isDraggedOver = draggedOverPlaylistId === item.id;
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
                      <td className="p-4 pl-6 font-medium text-gray-900 flex items-center gap-3">
                        <div 
                          className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors shrink-0"
                          title="Hold left-click and drag to move up/down"
                          onDragStart={(e) => e.stopPropagation()}
                        >
                          <GripVertical size={18} />
                        </div>
                        {item.thumbnail && <img src={item.thumbnail} alt="" className="w-16 h-9 object-cover rounded shadow-sm border border-gray-100 shrink-0" />}
                        <span className="truncate max-w-xs md:max-w-md">{item.title_en}</span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="p-4 pr-6 flex justify-end gap-2">
                        <button 
                          onClick={() => handleMoveUp(index)} 
                          disabled={index === 0}
                          className={`p-2 rounded transition-colors ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                          title="Move Up"
                        >
                          <ArrowUp size={18} />
                        </button>
                        <button 
                          onClick={() => handleMoveDown(index)} 
                          disabled={index === playlists.length - 1}
                          className={`p-2 rounded transition-colors ${index === playlists.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                          title="Move Down"
                        >
                          <ArrowDown size={18} />
                        </button>
                        <button 
                          onClick={() => { setCurrentPlaylist(item); setIsEditing(true); }} 
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteTargetId(item.id)} 
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
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

      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-gray-100 transform scale-100 transition-all">
            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            <p className="text-sm text-gray-500">Are you sure you want to delete this playlist? This action cannot be undone and will delete all associated videos.</p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setDeleteTargetId(null)} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteTargetId)} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setCropperFile(null);
        }}
        imageFile={cropperFile}
        defaultAspectRatio={16/9} // Playlists are landscape thumbnails
        onCrop={async (croppedBase64) => {
          try {
            const url = await uploadImageToStorage(croppedBase64, "playlist-thumb");
            if (url) {
              setThumbnailUrl(url);
            }
          } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload cropped image.");
          }
        }}
      />
    </div>
  );
}
