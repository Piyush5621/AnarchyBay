import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api/client";
import { 
    Zap, Package, Check, X, Plus, Image as ImageIcon, 
    Video, Type, DollarSign, Tag, Info, Layout
} from "lucide-react";

const CATEGORIES = ["Design", "Code", "Templates", "E-commerce", "Icons", "Photography", "Productivity", "Education"];
const SHORT_DESC_LIMIT = 200;
const LONG_DESC_LIMIT = 5000;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.price || form.categories.length === 0) {
      toast.error("MISSING_CRITICAL_FIELDS");
      return;
    }

    if (files.length === 0) {
      toast.error("ATTACH_FILE_ASSETS_REQUIRED");
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
        toast.success("TRANSMISSION_COMPLETE: Asset Launched");
        navigate(`/product/${data.product.id}`);
      } else {
        toast.error(data.error?.message || "TRANSMISSION_FAILED");
      }
    } catch {
      toast.error("SYSTEM_OVERLOAD: Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans selection:bg-black selection:text-white">
      <NavBar />

      <main className="pt-32 pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="mb-20 border-b-8 border-black pb-12 relative">
            <div className="absolute -top-10 -left-6 px-6 py-2 bg-black text-white border-4 border-black -rotate-6 text-xs font-black uppercase tracking-widest italic">Module: UplInk</div>
            <h1 className="text-8xl md:text-[8rem] font-black uppercase tracking-tighter leading-none mb-4">
                LAUNCH <br/> ASSET
            </h1>
            <p className="text-3xl font-bold bg-[var(--yellow-400)] border-4 border-black px-6 py-2 inline-block shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                Deploy your digital data to the Bay.
            </p>
        </header>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-20">
            {/* Section 1: Identity */}
            <section className="bg-white border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative">
                <div className="absolute -left-12 top-10 w-24 h-8 bg-black text-white border-4 border-black flex items-center justify-center font-black text-xs uppercase -rotate-90">ID_DATA</div>
                <FormHeading icon={<Type />} title="Asset Identity" />
                
                <div className="space-y-10">
                    <InputField 
                        label="Asset Specification [Name]" 
                        value={form.name} 
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g., NEURAL_GRID_UI_KIT"
                        required
                    />

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Brief_Intel [Short Description]</label>
                            <span className="text-[10px] font-bold">{form.short_description.length}/{SHORT_DESC_LIMIT}</span>
                        </div>
                        <textarea
                            value={form.short_description}
                            onChange={e => setForm(p => ({ ...p, short_description: e.target.value.slice(0, SHORT_DESC_LIMIT) }))}
                            className="w-full p-6 border-8 border-black font-bold focus:bg-[var(--yellow-50)] outline-none min-h-[120px] transition-all"
                            placeholder="State the core function of this asset..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-left">Full_Spectrum_Log [Detailed Description]</label>
                        <textarea
                            value={form.long_description}
                            onChange={e => setForm(p => ({ ...p, long_description: e.target.value }))}
                            rows={10}
                            className="w-full p-6 border-8 border-black font-bold focus:bg-[var(--yellow-50)] outline-none transition-all font-mono text-sm"
                            placeholder="Initialize markdown stream: ## Features, ### Components..."
                        />
                    </div>
                </div>
            </section>

            {/* Section 2: Economy */}
            <section className="bg-white border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(255,0,255,0.2)] relative">
                <div className="absolute -left-12 top-10 w-24 h-8 bg-[var(--pink-500)] text-white border-4 border-black flex items-center justify-center font-black text-xs uppercase -rotate-90 shadow-[4px_0px_0px_black]">ECON_VAL</div>
                <FormHeading icon={<DollarSign />} title="Economic Value" />
                
                <div className="grid md:grid-cols-2 gap-10">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Unit_Price</label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black italic">{form.currency === 'INR' ? '₹' : '$'}</span>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                className="w-full pl-16 pr-8 py-6 border-8 border-black text-5xl font-black italic outline-none focus:bg-[var(--green-400)] transition-all"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Currency_Node</label>
                        <select
                            value={form.currency}
                            onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                            className="w-full p-6 border-8 border-black font-black uppercase text-2xl outline-none focus:bg-[var(--cyan-400)] appearance-none"
                        >
                            <option value="INR">INR [₹]</option>
                            <option value="USD">USD [$]</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Section 3: Taxonomy */}
            <section className="bg-white border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,255,255,0.2)] relative">
                <div className="absolute -left-12 top-10 w-24 h-8 bg-[var(--cyan-400)] text-black border-4 border-black flex items-center justify-center font-black text-xs uppercase -rotate-90 shadow-[4px_0px_0px_black]">CL4SS_TAG</div>
                <FormHeading icon={<Tag />} title="Classification" />
                
                <div className="space-y-12">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Asset_Sectors [Categories]</label>
                        <div className="flex flex-wrap gap-4">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleCategory(cat)}
                                    className={`px-6 py-3 border-4 border-black font-black uppercase italic transition-all ${
                                        form.categories.includes(cat)
                                            ? "bg-black text-white -translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
                                            : "bg-white text-black hover:bg-[var(--yellow-400)]"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <InputField 
                        label="Meta_Tags [Comma Separated]" 
                        value={form.tags}
                        onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                        placeholder="figma, ai, neural, grid"
                    />
                </div>
            </section>

            {/* Section 4: Payload */}
            <section className="bg-black text-white border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--yellow-400)] border-l-8 border-b-8 border-white translate-x-12 -translate-y-12 rotate-45" />
                <FormHeading icon={<Package className="text-[var(--yellow-400)]" />} title="Primary Payload" />
                
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-8 border-dashed border-white/20 p-16 text-center cursor-pointer hover:border-white transition-colors bg-white/5"
                >
                    <Zap size={64} className="mx-auto mb-6 text-[var(--yellow-400)] animate-pulse" strokeWidth={3} />
                    <p className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-2">Engage UplInk</p>
                    <p className="text-xs font-bold uppercase text-white/40">Select files or drag and drop [Max 50MB per node]</p>
                </div>
                <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />

                {files.length > 0 && (
                    <div className="mt-10 grid gap-4">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white/10 border-4 border-white group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-[var(--yellow-400)] text-black flex items-center justify-center font-black text-xs">BIN</div>
                                    <div>
                                        <p className="font-black uppercase italic leading-none">{file.name}</p>
                                        <p className="text-[10px] uppercase text-white/40 mt-1">Weight: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeFile(i)} className="p-3 hover:bg-red-600 transition-colors">
                                    <X size={20} strokeWidth={4} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
          </div>

          {/* RIGHT SIDEBAR: Visuals & Deploy */}
          <div className="lg:col-span-4 space-y-12">
            <div className="sticky top-32 space-y-12">
                {/* Visual Registry */}
                <section className="bg-white border-8 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <FormHeading icon={<ImageIcon />} title="Visual Registry" />
                    
                    <div className="space-y-10">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Core_Thumbnail</label>
                            <div 
                                onClick={() => thumbnailInputRef.current?.click()}
                                className="aspect-video border-8 border-black bg-slate-100 flex items-center justify-center cursor-pointer overflow-hidden relative group"
                            >
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="text-center p-6">
                                        <Plus size={48} className="mx-auto text-slate-300 mb-2" strokeWidth={4} />
                                        <p className="text-[10px] font-black uppercase text-slate-300">Upload Cover</p>
                                    </div>
                                )}
                                {thumbnailPreview && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-black uppercase text-xs">Replace Asset</p>
                                    </div>
                                )}
                            </div>
                            <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Preview_Snapshots</label>
                            <div className="grid grid-cols-2 gap-4">
                                {previewImagePreviews.map((img, i) => (
                                    <div key={i} className="aspect-square border-4 border-black bg-slate-100 relative group">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removePreviewImage(i)} className="absolute top-1 right-1 bg-black text-white p-1 hover:bg-red-600 transition-colors">
                                            <X size={12} strokeWidth={4} />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={() => previewImageInputRef.current?.click()}
                                    className="aspect-square border-4 border-dashed border-slate-200 flex flex-col items-center justify-center hover:border-black hover:bg-[var(--cyan-50)] transition-all"
                                >
                                    <Plus size={24} className="text-slate-300" />
                                    <p className="text-[8px] font-black uppercase text-slate-300">Add Slot</p>
                                </button>
                            </div>
                            <input ref={previewImageInputRef} type="file" accept="image/*" multiple onChange={handlePreviewImageSelect} className="hidden" />
                        </div>
                    </div>
                </section>

                {/* Final Deploy */}
                <div className="space-y-6">
                    <div className="p-8 border-8 border-black bg-[var(--yellow-400)] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex items-center gap-6">
                        <Info size={32} strokeWidth={4} className="flex-shrink-0" />
                        <p className="text-xs font-bold uppercase leading-tight italic">By deploying this asset, you confirm it adheres to the protocol terms of ownership and safety.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-10 bg-black text-white border-8 border-black font-black uppercase text-4xl italic tracking-tighter hover:bg-[var(--pink-500)] hover:shadow-[16px_16px_0px_0px_rgba(255,214,0,1)] transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-6">
                                <Zap className="animate-spin text-[var(--yellow-400)]" size={40} />
                                DEPLOYING...
                            </span>
                        ) : (
                            "LAUNCH ASSET"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full py-4 bg-white border-8 border-black font-black uppercase text-xl italic hover:bg-slate-50 transition-all"
                    >
                        Abort Mission
                    </button>
                </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function FormHeading({ icon, title }) {
    return (
        <div className="flex items-center gap-6 mb-12 mb-12">
            <div className="w-16 h-16 border-8 border-black bg-black text-white flex items-center justify-center font-black">
                {icon}
            </div>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter">{title}</h2>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, required }) {
    return (
        <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{label}</label>
            <input
                type="text"
                value={value}
                onChange={onChange}
                className="w-full p-6 border-8 border-black font-black uppercase text-2xl outline-none focus:bg-[var(--yellow-400)] transition-all"
                placeholder={placeholder}
                required={required}
            />
        </div>
    );
}
