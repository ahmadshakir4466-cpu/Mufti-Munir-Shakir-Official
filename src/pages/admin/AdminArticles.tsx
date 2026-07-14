import React, { useState, useEffect, FormEvent } from "react";
import { supabase, uploadImageToStorage } from "../../lib/supabase";
import { Plus, Edit, Trash, X, ArrowUp, ArrowDown, GripVertical, Eye } from "lucide-react";
import { compressImage } from "../../lib/utils";
import TextFormattingToolbar from "../../components/admin/TextFormattingToolbar";
import ImageCropperModal from "../../components/admin/ImageCropperModal";
import AdminPreviewModal from "../../components/admin/AdminPreviewModal";

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [contentEn, setContentEn] = useState<string>("");
  const [contentUr, setContentUr] = useState<string>("");
  const [titleEn, setTitleEn] = useState<string>("");
  const [titleUr, setTitleUr] = useState<string>("");

  // Image Cropper States
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Preview States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Drag and drop states
  const [draggedArticleId, setDraggedArticleId] = useState<string | null>(null);
  const [draggedOverArticleId, setDraggedOverArticleId] = useState<string | null>(null);

  // Sync state with current article editing targets
  useEffect(() => {
    if (isEditing) {
      setTitleEn(currentArticle?.title_en || "");
      setTitleUr(currentArticle?.title_ur || "");
      setContentEn(currentArticle?.content_en || "");
      setContentUr(currentArticle?.content_ur || "");
    } else {
      setTitleEn("");
      setTitleUr("");
      setContentEn("");
      setContentUr("");
    }
  }, [currentArticle, isEditing]);

  const fetchArticles = async (showLoadingScreen = false) => {
    if (showLoadingScreen) setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setArticles(data);
    else if (error) console.error("Error fetching articles:", error);
    if (showLoadingScreen) setLoading(false);
  };

  useEffect(() => {
    fetchArticles(true);

    const channel = supabase.channel('articles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => {
        fetchArticles(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/[\s_-]+/g, '-')  // replace spaces/underscores with hyphen
      .replace(/^-+|-+$/g, '')  // trim hyphens
      + '-' + Math.random().toString(36).substring(2, 6); // Add simple unique suffix
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Auto-generate slug if it doesn't exist
    const slugValue = currentArticle?.slug || generateSlug(titleEn);

    // Save featured image to Supabase Storage if it contains new base64 data
    let finalImageUrl = featuredImage;
    if (featuredImage && featuredImage.startsWith("data:")) {
      finalImageUrl = await uploadImageToStorage(featuredImage, "article");
    }

    const payload = {
      title_en: titleEn,
      title_ur: titleUr,
      slug: slugValue,
      content_en: contentEn,
      content_ur: contentUr,
      featured_image: finalImageUrl,
    };

    if (currentArticle?.id) {
      const { error } = await supabase.from("articles").update(payload).eq("id", currentArticle.id);
      if (error) alert("Error updating: " + error.message);
    } else {
      const { error } = await supabase.from("articles").insert(payload);
      if (error) alert("Error creating: " + error.message);
    }
    
    setIsEditing(false);
    fetchArticles(true);
  };

  const handleDelete = async (id: string|null) => {
    if (!id) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      console.error("Error deleting:", error.message);
    } else {
      fetchArticles(true);
    }
    setDeleteTargetId(null);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const currentItem = articles[index];
    const prevItem = articles[index - 1];

    const currentScrollY = window.scrollY;

    await supabase.from("articles").update({ created_at: prevItem.created_at }).eq("id", currentItem.id);
    await supabase.from("articles").update({ created_at: currentItem.created_at }).eq("id", prevItem.id);
    await fetchArticles(false);

    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  const handleMoveDown = async (index: number) => {
    if (index === articles.length - 1) return;
    const currentItem = articles[index];
    const nextItem = articles[index + 1];

    const currentScrollY = window.scrollY;

    await supabase.from("articles").update({ created_at: nextItem.created_at }).eq("id", currentItem.id);
    await supabase.from("articles").update({ created_at: currentItem.created_at }).eq("id", nextItem.id);
    await fetchArticles(false);

    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedArticleId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedArticleId && draggedArticleId !== id) {
      setDraggedOverArticleId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedArticleId(null);
    setDraggedOverArticleId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedArticleId || draggedArticleId === targetId) return;

    const indexA = articles.findIndex(p => p.id === draggedArticleId);
    const indexB = articles.findIndex(p => p.id === targetId);
    if (indexA === -1 || indexB === -1) return;

    const newArticles = [...articles];
    const [moved] = newArticles.splice(indexA, 1);
    newArticles.splice(indexB, 0, moved);

    const existingTimestamps = articles.map(p => p.created_at);
    const currentScrollY = window.scrollY;

    // Save article order to DB
    for (let i = 0; i < newArticles.length; i++) {
      const item = newArticles[i];
      const newTimestamp = existingTimestamps[i];
      if (item.created_at !== newTimestamp) {
        await supabase.from("articles").update({ created_at: newTimestamp }).eq("id", item.id);
      }
    }

    await fetchArticles(false);

    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);

    setDraggedArticleId(null);
    setDraggedOverArticleId(null);
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{currentArticle ? "Edit Article" : "New Article"}</h1>
          <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800 p-2">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title (English)</label>
                <TextFormattingToolbar 
                  textareaId="article_title_en" 
                  value={titleEn} 
                  onChange={setTitleEn} 
                  lang="en" 
                />
                <textarea 
                  id="article_title_en"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required 
                  rows={2}
                  className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium" 
                  placeholder="Enter english title..."
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right font-urdu" dir="rtl">عنوان (Urdu)</label>
                <TextFormattingToolbar 
                  textareaId="article_title_ur" 
                  value={titleUr} 
                  onChange={setTitleUr} 
                  lang="ur" 
                />
                <textarea 
                  id="article_title_ur"
                  value={titleUr}
                  onChange={(e) => setTitleUr(e.target.value)}
                  required 
                  rows={2}
                  className="w-full border-b border-x border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-right text-sm" 
                  dir="rtl"
                  placeholder="عنوان درج کریں..."
                />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <input 
                type="file" 
                id="featured_image_input"
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCropperFile(file);
                    setIsCropperOpen(true);
                    e.target.value = ""; // Clear input
                  }
                }} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-800 file:text-white hover:file:bg-primary-950 cursor-pointer" 
              />
              {featuredImage ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 shadow-inner shrink-0 bg-white">
                  <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setFeaturedImage("");
                      const inp = document.getElementById("featured_image_input") as HTMLInputElement;
                      if (inp) inp.value = "";
                    }} 
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 bg-white text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
             <div>
                <label className="block text-sm font-medium text-gray-705 mb-2">Content (English)</label>
                <TextFormattingToolbar 
                  textareaId="article_content_en" 
                  value={contentEn} 
                  onChange={setContentEn} 
                  lang="en" 
                />
                <textarea 
                  id="article_content_en"
                  name="content_en" 
                  value={contentEn} 
                  onChange={(e) => setContentEn(e.target.value)}
                  required 
                  rows={8} 
                  className="w-full border border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Type or format your english article here..."
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-705 mb-2">Content (Urdu)</label>
                <TextFormattingToolbar 
                  textareaId="article_content_ur" 
                  value={contentUr} 
                  onChange={setContentUr} 
                  lang="ur" 
                />
                <textarea 
                  id="article_content_ur"
                  name="content_ur" 
                  value={contentUr} 
                  onChange={(e) => setContentUr(e.target.value)}
                  required 
                  rows={8} 
                  className="w-full border border-gray-300 rounded-b-md p-3 focus:ring-2 focus:ring-primary-500 outline-none font-urdu text-xl text-right leading-loose" 
                  dir="rtl"
                  placeholder="یہاں اردو مضمون لکھیں یا فارمیٹ بٹن استعمال کریں..."
                />
             </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            <button type="submit" className="bg-primary-800 hover:bg-primary-900 text-white font-medium px-8 py-3 rounded-md transition-colors">
              {currentArticle ? "Update Article" : "Publish Article"}
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-3 rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Eye size={18} /> Preview Article
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
          defaultAspectRatio={16/9} // Articles typically use landscape (16:9) images
          onCrop={(croppedBase64) => {
            setFeaturedImage(croppedBase64);
          }}
        />

        <AdminPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          type="article"
          data={{
            titleEn,
            titleUr,
            contentEn,
            contentUr,
            featuredImage
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Articles</h1>
        <button 
          onClick={() => { setCurrentArticle(null); setFeaturedImage(""); setIsEditing(true); }} 
          className="bg-primary-800 hover:bg-primary-900 text-white font-medium px-6 py-3 rounded-md flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} /> Add New Article
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
                <tr><td colSpan={3} className="p-8 text-center text-gray-500">Loading articles...</td></tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-gray-500">
                    <p className="mb-2">No articles found in database.</p>
                    <p className="text-sm">Click "Add New Article" to create your first entry.</p>
                  </td>
                </tr>
              ) : (
                articles.map((item, index) => {
                  const isDragging = draggedArticleId === item.id;
                  const isDraggedOver = draggedOverArticleId === item.id;
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
                        {item.featured_image && <img src={item.featured_image} alt="" className="w-16 h-9 object-cover rounded shadow-sm border border-gray-100 shrink-0" />}
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
                          disabled={index === articles.length - 1}
                          className={`p-2 rounded transition-colors ${index === articles.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                          title="Move Down"
                        >
                          <ArrowDown size={18} />
                        </button>
                        <button 
                          onClick={() => { setCurrentArticle(item); setFeaturedImage(item.featured_image || ""); setIsEditing(true); }} 
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
            <p className="text-sm text-gray-500">Are you sure you want to delete this article? This action cannot be undone.</p>
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
        defaultAspectRatio={16/9} // Articles typically use landscape (16:9) images
        onCrop={(croppedBase64) => {
          setFeaturedImage(croppedBase64);
        }}
      />
    </div>
  );
}
