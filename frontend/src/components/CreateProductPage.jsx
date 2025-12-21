import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";

const CATEGORIES = ["Design", "Code", "Templates", "E-commerce", "Icons", "Photography", "Productivity", "Education"];
const SHORT_DESC_LIMIT = 200;
const LONG_DESC_LIMIT = 5000;

const PAGE_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Cream", value: "#fffbeb" },
  { name: "Pink", value: "#fdf2f8" },
  { name: "Mint", value: "#ecfdf5" },
  { name: "Sky", value: "#f0f9ff" },
  { name: "Lavender", value: "#faf5ff" },
  { name: "Peach", value: "#fff7ed" },
  { name: "Gray", value: "#f9fafb" },
];

function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/^### (.+)$/gm, "<h3 class='text-lg font-black uppercase mt-3 mb-1'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-black uppercase mt-4 mb-2 border-b-2 border-black pb-1'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-black uppercase mt-5 mb-2'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class='bg-yellow-200 px-1'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='px-1 py-0.5 bg-black text-white rounded-sm text-xs font-mono'>$1</code>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc marker:font-bold'>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal marker:font-bold'>$1</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-pink-600 underline font-bold' target='_blank'>$1</a>")
    .replace(/\n\n/g, "</p><p class='mb-2'>")
    .replace(/\n/g, "<br/>");
  return `<p class='mb-2'>${html}</p>`;
}

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const previewImageInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    short_description: "",
    long_description: "",
    price: "",
    currency: "INR",
    categories: [],
    tags: "",
    preview_videos: [""],
    preview_images: [],
    page_color: "#ffffff",
  });
  const [files, setFiles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [previewImagePreviews, setPreviewImagePreviews] = useState([]);
  const [showLongDescPreview, setShowLongDescPreview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    toast.success(`${selectedFiles.length} file(s) added`);
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewImageSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setForm(prev => ({ ...prev, preview_images: [...prev.preview_images, ...selectedFiles] }));
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));
  const removePreviewImage = (index) => {
    setForm(prev => ({ ...prev, preview_images: prev.preview_images.filter((_, i) => i !== index) }));
    setPreviewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const insertMarkdown = (field, syntax) => {
    setForm(prev => ({ ...prev, [field]: prev[field] + syntax }));
  };

  const updateVideoLink = (index, value) => {
    setForm(prev => {
      const videos = [...prev.preview_videos];
      videos[index] = value;
      return { ...prev, preview_videos: videos };
    });
  };

  const addVideoLink = () => {
    setForm(prev => ({ ...prev, preview_videos: [...prev.preview_videos, ""] }));
  };

  const removeVideoLink = (index) => {
    setForm(prev => ({ ...prev, preview_videos: prev.preview_videos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.price || form.categories.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.short_description);
      formData.append("short_description", form.short_description);
      formData.append("long_description", form.long_description);
      formData.append("price", parseFloat(form.price));
      formData.append("currency", form.currency);
      formData.append("category", JSON.stringify(form.categories));
      formData.append("tags", JSON.stringify(form.tags.split(",").map(t => t.trim()).filter(Boolean)));
      formData.append("preview_videos", JSON.stringify(form.preview_videos.filter(v => v.trim())));
      formData.append("page_color", form.page_color);
      
      files.forEach(file => formData.append("files", file));
      if (thumbnail) formData.append("thumbnail", thumbnail);
      form.preview_images.forEach(img => formData.append("preview_images", img));

      const token = getAccessToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/products/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Product created successfully!");
        navigate(`/product/${data.product.id}`);
      } else {
        toast.error(data.error?.message || "Failed to create product");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px] opacity-100">
      <NavBar />

      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="font-black text-5xl mb-2 uppercase italic tracking-tighter bg-black text-white inline-block px-4 py-1 transform -rotate-1 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                Create Product
            </h1>
            <p className="text-black font-bold text-lg mt-2 ml-1">Upload files, set price, and start selling.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* GRID LAYOUT EXPLANATION:
                lg:grid-cols-12: Creates a 12-column grid.
                items-start: Ensures the columns align at the top, allowing sticky to work.
            */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* === LEFT COLUMN (FORM) - Takes 7/12 width === */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* 1. Details Card */}
                <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-6 relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--pink-500)] border-3 border-black flex items-center justify-center text-white font-black text-xl shadow-[2px_2px_0px_black]">1</div>
                  <h2 className="font-black text-xl uppercase mb-6 ml-4">Product Details</h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Product Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g., Premium UI Kit for Figma"
                        className="w-full px-4 py-3 bg-white border-3 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all placeholder:font-normal"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-black uppercase">Short Description</label>
                        <span className={`text-xs font-bold border-2 border-black px-2 ${form.short_description.length > SHORT_DESC_LIMIT * 0.9 ? "bg-red-200" : "bg-gray-100"}`}>
                          {form.short_description.length}/{SHORT_DESC_LIMIT}
                        </span>
                      </div>
                      <textarea
                        value={form.short_description}
                        onChange={e => setForm(p => ({ ...p, short_description: e.target.value.slice(0, SHORT_DESC_LIMIT) }))}
                        placeholder="A brief tagline..."
                        rows={2}
                        className="w-full px-4 py-3 bg-white border-3 border-black font-medium focus:outline-none focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all resize-none placeholder:font-normal"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-black uppercase">Long Description</label>
                        <button type="button" onClick={() => setShowLongDescPreview(!showLongDescPreview)} className="text-xs font-bold uppercase underline hover:text-[var(--pink-500)]">
                          {showLongDescPreview ? "Edit Mode" : "Preview Mode"}
                        </button>
                      </div>
                      
                      <div className="border-3 border-black bg-white">
                        {/* Markdown Toolbar */}
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b-3 border-black">
                          {['**bold**', '*italic*', '`code`', '\n- ', '\n## ', '[link](url)'].map((syntax, i) => (
                             <button 
                                key={i} 
                                type="button" 
                                onClick={() => insertMarkdown("long_description", syntax)}
                                className="px-2 py-1 bg-white border-2 border-black text-xs font-bold hover:bg-black hover:text-white transition-colors"
                             >
                                {syntax.replace(/[*`\n\[\]()]/g, '') || 'List'}
                             </button>
                          ))}
                        </div>

                        {showLongDescPreview ? (
                          <div className="p-4 min-h-[200px] prose prose-sm max-w-none bg-white" dangerouslySetInnerHTML={{ __html: renderMarkdown(form.long_description) || "<p class='text-gray-400 italic'>Nothing to preview...</p>" }} />
                        ) : (
                          <textarea
                            value={form.long_description}
                            onChange={e => setForm(p => ({ ...p, long_description: e.target.value.slice(0, LONG_DESC_LIMIT) }))}
                            placeholder="Describe features, requirements, etc..."
                            rows={8}
                            className="w-full p-4 bg-white focus:outline-none resize-none font-mono text-sm placeholder:font-sans placeholder:text-gray-400"
                          />
                        )}
                        <div className="bg-black text-white text-xs font-bold px-2 py-1 text-right">
                           {form.long_description.length}/{LONG_DESC_LIMIT}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-black uppercase mb-2">Price <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-lg">
                            {form.currency === "INR" ? "₹" : "$"}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.price}
                            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                            placeholder="499"
                            className="w-full pl-8 pr-4 py-3 bg-white border-3 border-black font-black text-lg focus:outline-none focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase mb-2">Currency</label>
                        <select
                          value={form.currency}
                          onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                          className="w-full px-4 py-3 bg-white border-3 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_var(--yellow-400)] cursor-pointer"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Categories <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`px-4 py-2 text-sm font-bold uppercase border-2 border-black transition-all shadow-[2px_2px_0px_black] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_black] ${
                              form.categories.includes(cat)
                                ? "bg-[var(--pink-500)] text-white"
                                : "bg-white text-black hover:bg-[var(--yellow-200)]"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Tags</label>
                      <input
                        type="text"
                        value={form.tags}
                        onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                        placeholder="figma, ui-kit, design (comma separated)"
                        className="w-full px-4 py-3 bg-white border-3 border-black font-medium focus:outline-none focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Files Card */}
                <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-6 relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--yellow-400)] border-3 border-black flex items-center justify-center text-black font-black text-xl shadow-[2px_2px_0px_black]">2</div>
                  <h2 className="font-black text-xl uppercase mb-6 ml-4">Files & Media</h2>

                  <div className="space-y-6">
                    {/* Cover Image Upload */}
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Cover Image</label>
                      <div 
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="border-3 border-dashed border-black bg-gray-50 p-8 text-center cursor-pointer hover:bg-[var(--pink-50)] transition-colors relative group"
                      >
                        {thumbnailPreview ? (
                          <div className="relative inline-block border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                            <img src={thumbnailPreview} alt="Thumbnail" className="max-h-48" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setThumbnail(null); setThumbnailPreview(null); }}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 border-2 border-black text-white flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="group-hover:scale-105 transition-transform">
                            <div className="text-4xl mb-2">🖼️</div>
                            <p className="font-bold uppercase">Click to upload cover</p>
                            <p className="text-xs font-bold text-gray-500">PNG, JPG (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                      <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                    </div>

                    {/* Product Files Upload */}
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Product Files <span className="text-red-500">*</span></label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-3 border-dashed border-black bg-gray-50 p-8 text-center cursor-pointer hover:bg-[var(--mint)] transition-colors group"
                      >
                        <div className="group-hover:scale-105 transition-transform">
                            <div className="text-4xl mb-2">📦</div>
                            <p className="font-bold uppercase">Click to upload product files</p>
                            <p className="text-xs font-bold text-gray-500">ZIP, PDF, Anything</p>
                        </div>
                      </div>
                      <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />

                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-[2px_2px_0px_black]">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="font-black text-xl">📄</div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold truncate">{file.name}</p>
                                  <p className="text-xs font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <button type="button" onClick={() => removeFile(i)} className="p-1 hover:bg-red-100 border border-transparent hover:border-red-500 transition-colors">
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Preview & Colors */}
                <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-6 relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--mint)] border-3 border-black flex items-center justify-center text-black font-black text-xl shadow-[2px_2px_0px_black]">3</div>
                  <h2 className="font-black text-xl uppercase mb-6 ml-4">Extras</h2>

                  <div className="space-y-6">
                    {/* Gallery */}
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Gallery Images</label>
                      <div 
                        onClick={() => previewImageInputRef.current?.click()}
                        className="border-3 border-dashed border-black bg-gray-50 p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <p className="font-bold text-sm">+ Add Screenshots</p>
                      </div>
                      <input ref={previewImageInputRef} type="file" accept="image/*" multiple onChange={handlePreviewImageSelect} className="hidden" />

                      {previewImagePreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {previewImagePreviews.map((img, i) => (
                            <div key={i} className="relative aspect-video border-2 border-black overflow-hidden bg-gray-200 group">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removePreviewImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 border border-black text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Video Links */}
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Video Links</label>
                      <div className="space-y-2">
                        {form.preview_videos.map((video, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="url"
                              value={video}
                              onChange={e => updateVideoLink(i, e.target.value)}
                              placeholder="YouTube / Vimeo URL"
                              className="flex-1 px-4 py-2 bg-white border-2 border-black font-medium focus:outline-none focus:shadow-[3px_3px_0px_black]"
                            />
                            {form.preview_videos.length > 1 && (
                              <button type="button" onClick={() => removeVideoLink(i)} className="px-3 border-2 border-black bg-white hover:bg-red-100">✕</button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={addVideoLink} className="text-xs font-bold uppercase underline hover:text-blue-600">
                          + Add another video
                        </button>
                      </div>
                    </div>

                    {/* Page Color */}
                    <div>
                      <label className="block text-sm font-black uppercase mb-3">Page Background</label>
                      <div className="flex flex-wrap gap-3">
                        {PAGE_COLORS.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, page_color: color.value }))}
                            className={`w-10 h-10 border-2 transition-all hover:scale-110 ${
                              form.page_color === color.value 
                                ? "border-black shadow-[3px_3px_0px_black] scale-110" 
                                : "border-gray-300"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                        <div className="relative group">
                          <div className="w-10 h-10 border-2 border-dashed border-black flex items-center justify-center bg-white group-hover:bg-gray-100 cursor-pointer">🎨</div>
                          <input
                            type="color"
                            value={form.page_color}
                            onChange={e => setForm(p => ({ ...p, page_color: e.target.value }))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* === RIGHT COLUMN (PREVIEW) - STICKY === */}
              {/* This column takes 5/12 width and holds the sticky content */}
              <div className="lg:col-span-5 relative h-full">
                
                {/* STICKY CONFIGURATION:
                    sticky: Enables sticky behavior.
                    top-24: Sticks 6rem from the top of the viewport.
                    space-y-6: Adds space between the Preview Card and the Submit Button.
                */}
                <div className="sticky top-24 space-y-6">
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    <h3 className="font-black uppercase tracking-widest text-sm">Live Preview</h3>
                  </div>
                  
                  {/* PREVIEW CARD - MIMICS PRODUCT CARD */}
                  <div className="bg-white border-4 border-black shadow-[10px_10px_0px_rgba(0,0,0,0.2)] overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-100 border-b-4 border-black relative flex items-center justify-center overflow-hidden">
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-6xl grayscale opacity-30">📦</div>
                      )}
                      
                      {/* Floating Category Tag Preview */}
                      {form.categories[0] && (
                        <div className="absolute top-3 left-3 z-20">
                            <span className="px-3 py-1 text-xs font-black uppercase bg-black text-white border-2 border-white shadow-sm">
                                {form.categories[0]}
                            </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-black text-2xl leading-none mb-2 line-clamp-2 uppercase">
                        {form.name || "Product Name"}
                      </h3>
                      <p className="text-sm font-medium text-gray-600 line-clamp-2 mb-4 h-10">
                        {form.short_description || "Your short description will appear here..."}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-black">
                        <span className="inline-block bg-[var(--yellow-400)] text-black border-2 border-black px-2 py-0.5 text-lg font-black transform -rotate-1">
                           {form.currency === "INR" ? "₹" : "$"}{form.price || "0"}
                        </span>
                        
                        <button className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Submit */}
                  <div className="bg-[var(--pink-50)] border-3 border-black p-6 shadow-[6px_6px_0px_black]">
                    <h3 className="font-black uppercase mb-4 text-lg">Ready to Launch?</h3>
                    <div className="space-y-2 text-sm font-bold text-gray-700 mb-6">
                       <div className="flex justify-between"><span>Files:</span> <span>{files.length}</span></div>
                       <div className="flex justify-between"><span>Images:</span> <span>{form.preview_images.length}</span></div>
                       <div className="flex justify-between"><span>Videos:</span> <span>{form.preview_videos.filter(v=>v).length}</span></div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 font-black uppercase text-xl bg-black text-white border-3 border-black shadow-[4px_4px_0px_white] hover:bg-[var(--pink-500)] hover:shadow-[6px_6px_0px_black] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Publishing..." : "Publish Product 🚀"}
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </form>
        </div>
      </main>
    </div>
  );
}