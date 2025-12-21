import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/utils/constants";
import NavBar from "./NavBar";
import { toast } from "sonner";
import api, { getAccessToken } from "@/lib/api/client";

// SVG Paths for Social Icons
const SOCIAL_PLATFORMS = [
  { key: "instagram", name: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z", color: "#E4405F" },
  { key: "twitter", name: "Twitter / X", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", color: "#000000" },
  { key: "facebook", name: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", color: "#1877F2" },
  { key: "linkedin", name: "LinkedIn", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", color: "#0A66C2" },
  { key: "youtube", name: "YouTube", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", color: "#FF0000" },
  { key: "tiktok", name: "TikTok", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", color: "#000000" },
  { key: "github", name: "GitHub", icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12", color: "#181717" },
  { key: "website", name: "Website", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z", color: "#6366F1" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { isAuthenticated, profile, loading } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    social_links: {},
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        social_links: profile.social_links || {},
      });
      setPreviewImage(profile.profile_image_url || null);
    }
  }, [profile]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/profile/me/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile image updated!");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSocialLinkChange = (key, value) => {
    setForm(f => ({
      ...f,
      social_links: { ...f.social_links, [key]: value },
    }));
  };

  const detectAndAddLink = (url) => {
    if (!url) return;
    const lowerUrl = url.toLowerCase();
    for (const platform of SOCIAL_PLATFORMS) {
      if (lowerUrl.includes(platform.key) || (platform.key === "twitter" && lowerUrl.includes("x.com"))) {
        handleSocialLinkChange(platform.key, url);
        toast.success(`${platform.name} link detected and added!`);
        return true;
      }
    }
    handleSocialLinkChange("website", url);
    toast.success("Website link added!");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put("/api/profile/me", form, { requireAuth: true });
      if (res?.error) {
        toast.error(res.error || "Failed to update profile");
      } else {
        toast.success("Profile updated!");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="pt-32 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-black border-t-[var(--pink-500)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]">
      <NavBar />
      
      <main className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="mb-12">
            <span className="inline-block px-4 py-1 bg-black text-white font-black uppercase text-xs tracking-widest mb-2 transform -rotate-1 border-2 border-white shadow-sm">
                Settings
            </span>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">
                Edit <span className="text-[var(--pink-500)]">Profile</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* --- PROFILE PICTURE --- */}
            <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-8 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--yellow-400)] text-black border-3 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_black]">
                  1
              </div>
              
              <h2 className="font-black text-2xl uppercase mb-6 flex items-center gap-2">
                  <span className="w-4 h-4 bg-black rounded-full"></span> Avatar
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full border-4 border-black bg-[var(--pink-100)] overflow-hidden shadow-[4px_4px_0px_black] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                        {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl font-black text-black/20 uppercase">
                                {(form.display_name || "U").charAt(0)}
                            </div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-full border-2 border-white group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                    </div>
                </div>
                
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-lg uppercase mb-1">Upload New Photo</h3>
                  <p className="text-sm font-bold text-gray-500 mb-4 max-w-xs">
                      Make sure it's square, clear, and makes you look awesome. Max 5MB.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-white border-3 border-black font-bold uppercase text-xs hover:bg-[var(--pink-500)] hover:text-white transition-colors shadow-[3px_3px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    Choose File
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* --- BASIC INFO --- */}
            <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-8 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--mint)] text-black border-3 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_black]">
                  2
              </div>
              <h2 className="font-black text-2xl uppercase mb-6 flex items-center gap-2">
                  <span className="w-4 h-4 bg-black rounded-full"></span> Identity
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-black uppercase mb-2">Display Name</label>
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 bg-white border-3 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all placeholder:font-medium placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black uppercase mb-2">Username</label>
                  <div className="flex">
                    <span className="px-4 py-3 bg-gray-100 border-3 border-r-0 border-black font-black text-gray-500 select-none">@</span>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))}
                      placeholder="username"
                      className="w-full px-4 py-3 bg-white border-3 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all placeholder:font-medium placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                  <label className="block text-sm font-black uppercase mb-2">Bio / About</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell the world who you are and what you create..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-white border-3 border-black font-medium focus:outline-none focus:shadow-[4px_4px_0px_var(--yellow-400)] transition-all resize-none placeholder:font-medium placeholder:text-gray-300"
                  />
                  <div className="text-right mt-1">
                      <span className="text-xs font-bold bg-black text-white px-2 py-0.5">{form.bio.length}/500</span>
                  </div>
              </div>
            </div>

            {/* --- SOCIAL LINKS --- */}
            <div className="bg-white border-3 border-black shadow-[8px_8px_0px_black] p-8 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--pink-500)] text-white border-3 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_black]">
                  3
              </div>
              <h2 className="font-black text-2xl uppercase mb-2 flex items-center gap-2">
                  <span className="w-4 h-4 bg-black rounded-full"></span> Connections
              </h2>
              <p className="text-sm font-bold text-gray-500 mb-6">Add your social links to display on your public profile.</p>
              
              {/* Quick Add */}
              <div className="flex gap-0 mb-8 shadow-[4px_4px_0px_black]">
                <input
                  type="url"
                  placeholder="Paste any social link here (e.g., instagram.com/you)..."
                  className="flex-1 px-4 py-3 border-3 border-black border-r-0 font-bold focus:outline-none focus:bg-[var(--yellow-50)] placeholder:font-medium placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      detectAndAddLink(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    detectAndAddLink(input.value);
                    input.value = "";
                  }}
                  className="px-8 py-3 font-black uppercase border-3 border-black bg-[var(--yellow-400)] hover:bg-[var(--yellow-300)] transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="grid gap-4">
                {SOCIAL_PLATFORMS.map(platform => (
                  <div key={platform.key} className={`flex items-center gap-3 transition-opacity ${form.social_links[platform.key] ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                    <div 
                        className="w-12 h-12 flex items-center justify-center border-3 border-black shadow-sm" 
                        style={{ backgroundColor: form.social_links[platform.key] ? platform.color : "#fff" }}
                    >
                      <svg className="w-6 h-6 transition-colors" style={{ fill: form.social_links[platform.key] ? "#fff" : "#000" }} viewBox="0 0 24 24">
                        <path d={platform.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 relative">
                        <input
                        type="url"
                        value={form.social_links[platform.key] || ""}
                        onChange={e => handleSocialLinkChange(platform.key, e.target.value)}
                        placeholder={`Your ${platform.name} URL`}
                        className="w-full px-4 py-2.5 border-3 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_var(--pink-300)] transition-all placeholder:font-medium placeholder:text-gray-300"
                        />
                        {form.social_links[platform.key] && (
                            <button
                                type="button"
                                onClick={() => handleSocialLinkChange(platform.key, "")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="flex gap-6 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 text-xl font-black uppercase border-3 border-black bg-black text-white shadow-[6px_6px_0px_var(--pink-500)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_var(--pink-500)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_var(--pink-500)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-10 py-4 text-xl font-black uppercase border-3 border-black bg-white hover:bg-gray-100 shadow-[6px_6px_0px_gray] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_gray] transition-all"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}