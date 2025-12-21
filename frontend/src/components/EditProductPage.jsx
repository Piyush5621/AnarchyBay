import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  { name: "Black", value: "#0a0a0a" },
  { name: "Dark Blue", value: "#1e3a5f" },
];

const ACCENT_COLORS = [
  { name: "Yellow", value: "#ffde59" },
  { name: "Pink", value: "#ec4899" },
  { name: "Mint", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Teal", value: "#14b8a6" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function EditProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    short_description: "",
    long_description: "",
    price: "",
    currency: "INR",
    categories: [],
    tags: "",
    page_color: "#ffffff",
    accent_color: "#ffde59",
    button_color: "#ec4899",
    text_color: "#000000",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          const p = data.product;
          if (p.creator_id !== user?.id) {
            toast.error("You can only edit your own products");
            navigate(`/product/${productId}`);
            return;
          }
          setForm({
            name: p.name || "",
            short_description: p.short_description || "",
            long_description: p.long_description || "",
            price: p.price?.toString() || "",
            currency: p.currency || "INR",
            categories: p.category || [],
            tags: (p.tags || []).join(", "),
            page_color: p.page_color || "#ffffff",
            accent_color: p.accent_color || "#ffde59",
            button_color: p.button_color || "#ec4899",
            text_color: p.text_color || "#000000",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load product");
        setLoading(false);
      });
  }, [productId, isAuthenticated, navigate, user?.id]);

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
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const token = getAccessToken();
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: form.name,
          description: form.short_description,
          short_description: form.short_description,
          long_description: form.long_description,
          price: parseFloat(form.price),
          currency: form.currency,
          category: form.categories,
          tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
          page_color: form.page_color,
          accent_color: form.accent_color,
          button_color: form.button_color,
          text_color: form.text_color,
        }),
      });

      if (response.ok) {
        toast.success("Product updated successfully!");
        navigate(`/product/${productId}`);
      } else {
        const data = await response.json();
        toast.error(data.error?.message || data.error || "Failed to update product");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-[var(--pink-500)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]">
      <NavBar />

      <main className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <button 
                onClick={() => navigate(`/product/${productId}`)}
                className="flex items-center gap-2 mb-4 font-bold uppercase text-xs tracking-wider hover:text-[var(--pink-600)] transition-colors group"
                >
                <div className="bg-white border-2 border-black p-1 group-hover:-translate-x-1 transition-transform">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </div>
                Back to Product
                </button>
                <h1 className="font-black text-5xl uppercase italic tracking-tighter">
                    Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pink-500)] to-[var(--yellow-500)]">Product</span>
                </h1>
                <p className="font-bold text-gray-500 mt-2">Refine your product details and design.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* === LEFT COLUMN: ESSENTIALS === */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* CARD 1: BASIC INFO */}
                <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-6 relative">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-black text-white border-3 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_rgba(255,255,255,0.5)]">1</div>
                    <h2 className="font-black text-xl uppercase mb-6 ml-4 border-b-3 border-[var(--yellow-400)] inline-block">The Basics</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-black uppercase mb-2">Product Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-black uppercase">Short Description</label>
                                <span className={`text-xs font-bold border-2 border-black px-2 ${form.short_description.length > SHORT_DESC_LIMIT * 0.9 ? "bg-red-200" : "bg-white"}`}>
                                {form.short_description.length}/{SHORT_DESC_LIMIT}
                                </span>
                            </div>
                            <textarea
                                value={form.short_description}
                                onChange={e => setForm(p => ({ ...p, short_description: e.target.value.slice(0, SHORT_DESC_LIMIT) }))}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border-3 border-black font-medium focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all resize-none"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-black uppercase">Long Description</label>
                                <span className={`text-xs font-bold border-2 border-black px-2 ${form.long_description.length > LONG_DESC_LIMIT * 0.9 ? "bg-red-200" : "bg-white"}`}>
                                {form.long_description.length}/{LONG_DESC_LIMIT}
                                </span>
                            </div>
                            <textarea
                                value={form.long_description}
                                onChange={e => setForm(p => ({ ...p, long_description: e.target.value.slice(0, LONG_DESC_LIMIT) }))}
                                rows={8}
                                className="w-full px-4 py-3 bg-gray-50 border-3 border-black font-mono text-sm focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* CARD 2: PRICING & CATEGORY */}
                <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-6 relative">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--pink-500)] text-white border-3 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_black]">2</div>
                    <h2 className="font-black text-xl uppercase mb-6 ml-4 border-b-3 border-[var(--pink-400)] inline-block">Categorization</h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black uppercase mb-2">Price</label>
                                <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg text-gray-400">
                                    {form.currency === "INR" ? "₹" : "$"}
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.price}
                                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-3 border-black font-black text-xl focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_var(--pink-400)] transition-all"
                                    required
                                />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-black uppercase mb-2">Currency</label>
                                <select
                                value={form.currency}
                                onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_var(--pink-400)] cursor-pointer"
                                >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black uppercase mb-3">Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleCategory(cat)}
                                    className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                                    form.categories.includes(cat)
                                        ? "bg-black text-white shadow-[2px_2px_0px_var(--pink-500)] translate-x-[1px] translate-y-[1px]"
                                        : "bg-white hover:bg-[var(--pink-100)] shadow-[2px_2px_0px_black] hover:-translate-y-0.5"
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
                                className="w-full px-4 py-3 bg-gray-50 border-3 border-black font-medium focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_var(--pink-400)] transition-all"
                                placeholder="comma, separated, tags"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* === RIGHT COLUMN: DESIGN & ACTIONS === */}
            <div className="lg:col-span-5 space-y-8 sticky top-24">
                
                {/* CARD 3: LOOK & FEEL */}
                <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-6 relative">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--mint)] text-black border-3 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_black]">3</div>
                    <h2 className="font-black text-xl uppercase mb-6 ml-4 border-b-3 border-[var(--mint)] inline-block">Design Studio</h2>

                    <div className="space-y-6">
                        {/* Page Background */}
                        <div>
                            <label className="block text-xs font-black uppercase mb-3 flex justify-between">
                                <span>Background Color</span>
                                <span className="font-mono bg-gray-100 px-1">{form.page_color}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PAGE_COLORS.map(color => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, page_color: color.value }))}
                                    className={`w-8 h-8 border-2 transition-all rounded-full ${
                                    form.page_color === color.value 
                                        ? "border-black ring-2 ring-offset-2 ring-black scale-110" 
                                        : "border-gray-300 hover:scale-110"
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                                ))}
                                <div className="relative group">
                                    <div className="w-8 h-8 border-2 border-dashed border-black flex items-center justify-center bg-white cursor-pointer rounded-full">+</div>
                                    <input
                                        type="color"
                                        value={form.page_color}
                                        onChange={e => setForm(p => ({ ...p, page_color: e.target.value }))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div>
                            <label className="block text-xs font-black uppercase mb-3 flex justify-between">
                                <span>Accent Color</span>
                                <span className="font-mono bg-gray-100 px-1">{form.accent_color}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ACCENT_COLORS.map(color => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, accent_color: color.value }))}
                                    className={`w-8 h-8 border-2 transition-all rounded-full ${
                                    form.accent_color === color.value 
                                        ? "border-black ring-2 ring-offset-2 ring-black scale-110" 
                                        : "border-gray-300 hover:scale-110"
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                                ))}
                                <div className="relative group">
                                    <div className="w-8 h-8 border-2 border-dashed border-black flex items-center justify-center bg-white cursor-pointer rounded-full">+</div>
                                    <input
                                        type="color"
                                        value={form.accent_color}
                                        onChange={e => setForm(p => ({ ...p, accent_color: e.target.value }))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Button Color */}
                        <div>
                            <label className="block text-xs font-black uppercase mb-3 flex justify-between">
                                <span>Button Color</span>
                                <span className="font-mono bg-gray-100 px-1">{form.button_color}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ACCENT_COLORS.map(color => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, button_color: color.value }))}
                                    className={`w-8 h-8 border-2 transition-all rounded-full ${
                                    form.button_color === color.value 
                                        ? "border-black ring-2 ring-offset-2 ring-black scale-110" 
                                        : "border-gray-300 hover:scale-110"
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                                ))}
                                <div className="relative group">
                                    <div className="w-8 h-8 border-2 border-dashed border-black flex items-center justify-center bg-white cursor-pointer rounded-full">+</div>
                                    <input
                                        type="color"
                                        value={form.button_color}
                                        onChange={e => setForm(p => ({ ...p, button_color: e.target.value }))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Text Color */}
                        <div>
                            <label className="block text-xs font-black uppercase mb-3">Text Color</label>
                            <div className="flex items-center gap-2 border-3 border-black p-2 bg-gray-50">
                                <input 
                                    type="color" 
                                    value={form.text_color}
                                    onChange={e => setForm(p => ({ ...p, text_color: e.target.value }))}
                                    className="w-10 h-10 border-2 border-black p-0 cursor-pointer"
                                />
                                <span className="font-mono font-bold">{form.text_color}</span>
                            </div>
                        </div>

                        {/* LIVE PREVIEW BOX */}
                        <div className="mt-4 p-4 border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.1)] transition-colors duration-300" style={{ backgroundColor: form.page_color }}>
                            <p className="text-xs font-black uppercase mb-4 opacity-50" style={{ color: form.text_color }}>Live Preview</p>
                            
                            <h3 className="text-2xl font-black mb-2" style={{ color: form.text_color }}>{form.name || "Product Name"}</h3>
                            <p className="text-sm font-medium mb-4 line-clamp-2" style={{ color: form.text_color, opacity: 0.8 }}>
                                {form.short_description || "Short description text..."}
                            </p>

                            <div className="p-4 border-3 border-black mb-3" style={{ backgroundColor: form.accent_color }}>
                                <span className="font-black text-xl">
                                    {form.currency === 'INR' ? '₹' : '$'}{form.price || '0'}
                                </span>
                            </div>

                            <button className="w-full py-3 font-black uppercase text-white border-3 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.2)]" style={{ backgroundColor: form.button_color }}>
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 font-black uppercase text-xl bg-black text-white border-3 border-black shadow-[4px_4px_0px_var(--pink-500)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_var(--pink-500)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/product/${productId}`)}
                        className="w-full py-3 font-bold uppercase text-sm bg-white text-black border-3 border-black hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}