import React, { useState, useEffect } from "react";
import { supabase, uploadImageToStorage } from "../../lib/supabase";
import { Upload, Trash2, Edit2, Plus, Loader2, ArrowUp, ArrowDown, FileText, Check, AlertCircle, BookOpen } from "lucide-react";
import ImageCropperModal from "../../components/admin/ImageCropperModal";

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

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Image Cropper States
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleEn, setTitleEn] = useState("");
  const [titleUr, setTitleUr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descUr, setDescUr] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  
  // Upload indicators
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  // Feedback messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
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
          console.error("Failed to parse books JSON data", e);
          setBooks([]);
        }
      } else {
        setBooks([]);
      }
    } catch (err: any) {
      console.error("Error fetching books:", err.message);
      setErrorMsg("Failed to fetch books list from database.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveBooksList = async (updatedBooks: Book[]) => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        page_name: "books_data",
        title_en: "Books List",
        title_ur: "کتب کی فہرست",
        content_en: JSON.stringify(updatedBooks),
        content_ur: ""
      };

      const { error } = await supabase
        .from("page_content")
        .upsert(payload, { onConflict: "page_name" });

      if (error) throw error;

      setBooks(updatedBooks);
      setSuccessMsg("Books list saved successfully!");
      resetForm();
    } catch (err: any) {
      console.error("Error saving books list:", err.message);
      setErrorMsg("Failed to save changes. " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperFile(file);
    setIsCropperOpen(true);
    e.target.value = ""; // Clear input
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setErrorMsg("Please upload a valid PDF book file.");
      return;
    }

    setUploadingPdf(true);
    setErrorMsg(null);
    try {
      // PDF can be uploaded using the same helper function since it handles binary files cleanly
      const url = await uploadImageToStorage(file, "book-pdf");
      if (url) {
        setPdfUrl(url);
      } else {
        throw new Error("Failed to retrieve upload URL");
      }
    } catch (err: any) {
      setErrorMsg("PDF document upload failed. " + err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn && !titleUr) {
      setErrorMsg("Please provide at least an English or Urdu Title.");
      return;
    }
    if (!pdfUrl) {
      setErrorMsg("Please upload or provide a PDF book URL.");
      return;
    }

    let updatedBooks = [...books];

    if (editingId) {
      // Edit mode
      updatedBooks = updatedBooks.map((b) =>
        b.id === editingId
          ? {
              ...b,
              title_en: titleEn,
              title_ur: titleUr,
              description_en: descEn,
              description_ur: descUr,
              cover_image: coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
              pdf_url: pdfUrl,
            }
          : b
      );
    } else {
      // Create mode
      const newBook: Book = {
        id: Math.random().toString(36).substring(2, 11),
        title_en: titleEn,
        title_ur: titleUr,
        description_en: descEn,
        description_ur: descUr,
        cover_image: coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
        pdf_url: pdfUrl,
        created_at: new Date().toISOString(),
      };
      updatedBooks = [newBook, ...updatedBooks];
    }

    await saveBooksList(updatedBooks);
  };

  const handleEdit = (book: Book) => {
    setEditingId(book.id);
    setTitleEn(book.title_en);
    setTitleUr(book.title_ur);
    setDescEn(book.description_en);
    setDescUr(book.description_ur);
    setCoverImage(book.cover_image);
    setPdfUrl(book.pdf_url);
    setErrorMsg(null);
    setSuccessMsg(null);
    // Scroll form into view
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    const updatedBooks = books.filter((b) => b.id !== id);
    await saveBooksList(updatedBooks);
    setDeleteTargetId(null);
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= books.length) return;

    const updatedBooks = [...books];
    const temp = updatedBooks[index];
    updatedBooks[index] = updatedBooks[newIndex];
    updatedBooks[newIndex] = temp;

    await saveBooksList(updatedBooks);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitleEn("");
    setTitleUr("");
    setDescEn("");
    setDescUr("");
    setCoverImage("");
    setPdfUrl("");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-150">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-primary-600 w-8 h-8" /> Islamic Books Library
          </h1>
          <p className="text-gray-500 text-sm mt-1">Upload and manage Islamic PDF books, specify translations, and custom covers.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-center gap-3 shadow-sm">
          <Check className="text-emerald-600 w-5 h-5 flex-shrink-0" />
          <span className="text-sm text-emerald-800 font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl flex items-center gap-3 shadow-sm">
          <AlertCircle className="text-rose-600 w-5 h-5 flex-shrink-0" />
          <span className="text-sm text-rose-800 font-medium">{errorMsg}</span>
        </div>
      )}

      {/* ADD / EDIT BOOK FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-100">
          {editingId ? <Edit2 className="w-5 h-5 text-primary-600" /> : <Plus className="w-5 h-5 text-primary-600" />}
          {editingId ? "Edit Existing Book" : "Upload New Islamic Book"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Titles */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Book Title (English)</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Riyad as-Salihin"
              className="w-full rounded-xl border border-gray-350 px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 text-right font-urdu">کتاب کا نام (اردو)</label>
            <input
              type="text"
              value={titleUr}
              onChange={(e) => setTitleUr(e.target.value)}
              placeholder="مثال: ریاض الصالحین"
              dir="rtl"
              className="w-full rounded-xl border border-gray-350 px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none font-urdu text-lg"
            />
          </div>

          {/* Descriptions */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Description (English)</label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              placeholder="Brief description or preface of the book..."
              rows={3}
              className="w-full rounded-xl border border-gray-350 px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 text-right font-urdu">تفصیل یا تعارف (اردو)</label>
            <textarea
              value={descUr}
              onChange={(e) => setDescUr(e.target.value)}
              placeholder="کتاب کے بارے میں مختصر تعارف یا تفصیل لکھیں..."
              rows={3}
              dir="rtl"
              className="w-full rounded-xl border border-gray-350 px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none font-urdu text-md"
            />
          </div>

          {/* COVER IMAGE UPLOADER */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Cover Image</label>
            <div className="flex gap-4 items-center">
              {coverImage && (
                <div className="w-16 h-20 rounded border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-grow">
                <label className="flex items-center justify-center border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-xl p-3 bg-gray-50/50 cursor-pointer transition-all duration-200">
                  {uploadingCover ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                      <span className="text-xs text-gray-500 font-bold">Uploading Cover...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-center">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600">Upload Cover Image (PNG, JPG)</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} className="hidden" />
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Or paste a custom image URL..."
                  className="w-full rounded-xl border border-gray-350 px-4 py-2 mt-2 text-xs focus:border-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* PDF BOOK FILE UPLOADER */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">PDF Book Document <span className="text-rose-500">*</span></label>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 flex-shrink-0 shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <label className="flex items-center justify-center border-2 border-dashed border-gray-250 hover:border-primary-400 rounded-xl p-3 bg-gray-50/50 cursor-pointer transition-all duration-200">
                  {uploadingPdf ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                      <span className="text-xs text-gray-500 font-bold">Uploading PDF...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-center">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600">Select/Upload PDF File (مستند پی ڈی ایف)</span>
                    </div>
                  )}
                  <input type="file" accept=".pdf" onChange={handlePdfUpload} disabled={uploadingPdf} className="hidden" />
                </label>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="Or paste direct PDF book URL..."
                  required
                  className="w-full rounded-xl border border-gray-350 px-4 py-2 mt-2 text-xs focus:border-primary-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-all"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || uploadingCover || uploadingPdf}
            className="px-6 py-2.5 rounded-xl bg-primary-750 hover:bg-primary-800 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-primary-800/20 disabled:opacity-50"
            style={{ backgroundColor: '#1b5e20' }}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : editingId ? (
              "Save Book Details"
            ) : (
              "Publish Book"
            )}
          </button>
        </div>
      </form>

      {/* BOOKS LIST AND ORDER MANAGEMENT */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6">
        <h2 className="text-xl font-bold text-gray-800 pb-3 border-b border-gray-100 mb-6">Published Books List ({books.length})</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm">No books have been published yet. Use the form above to add your first PDF book.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {books.map((book, index) => (
              <div key={book.id} className="py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-16 rounded overflow-hidden border border-gray-150 bg-gray-50 flex-shrink-0 shadow-sm">
                    <img src={book.cover_image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-950 text-md">{book.title_en || "No English Title"}</h3>
                    <h4 className="font-semibold text-primary-800 text-right font-urdu text-sm mt-0.5">{book.title_ur || "عنوان نہیں ہے"}</h4>
                    <p className="text-xs text-gray-400 mt-1 truncate max-w-sm">
                      File: {book.pdf_url.startsWith("data:") ? "Uploaded locally (Base64)" : book.pdf_url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col sm:flex-row gap-1">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg border border-gray-150 hover:bg-gray-50 disabled:opacity-30 text-gray-500"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === books.length - 1}
                      className="p-1.5 rounded-lg border border-gray-150 hover:bg-gray-50 disabled:opacity-30 text-gray-500"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <button
                    onClick={() => handleEdit(book)}
                    className="p-1.5 rounded-lg border border-gray-150 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    title="Edit Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(book.id)}
                    className="p-1.5 rounded-lg border border-gray-150 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                    title="Delete Book"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Book</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this book? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
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
        defaultAspectRatio={3/4} // Book covers are portrait, 3:4 is standard
        onCrop={async (croppedBase64) => {
          setUploadingCover(true);
          setErrorMsg(null);
          try {
            const url = await uploadImageToStorage(croppedBase64, "book-cover");
            if (url) {
              setCoverImage(url);
            } else {
              throw new Error("Failed to retrieve upload URL");
            }
          } catch (err: any) {
            setErrorMsg("Cover image upload failed. " + err.message);
          } finally {
            setUploadingCover(false);
          }
        }}
      />
    </div>
  );
}
