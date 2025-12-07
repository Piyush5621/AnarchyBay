import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "@/lib/api/client";

export default function UploadResource() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [file]);

  // Drag & drop handlers
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const handleDrop = (e) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) setFile(f);
      el.classList.remove("ring-2", "ring-primary/50");
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      el.classList.add("ring-2", "ring-primary/50");
    };

    const handleDragLeave = () => {
      el.classList.remove("ring-2", "ring-primary/50");
    };

    el.addEventListener("drop", handleDrop);
    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("dragleave", handleDragLeave);

    return () => {
      el.removeEventListener("drop", handleDrop);
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("dragleave", handleDragLeave);
    };
  }, []);

  const onChooseFile = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const addTag = (value) => {
    const v = value.trim();
    if (!v) return;
    if (tags.includes(v)) return setTagInput("");
    setTags((t) => [...t, v]);
    setTagInput("");
  };

  const removeTag = (t) => setTags((arr) => arr.filter((x) => x !== t));

  const onTagKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput) {
      setTags((arr) => arr.slice(0, -1));
    }
  };

  const autoResize = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a file to upload");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", title);
      form.append("description", description);
      form.append("category", category);
      form.append("tags", JSON.stringify(tags));
      form.append("visibility", visibility);

      const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const token = getAccessToken();

      const res = await fetch(`${BASE}/api/resources/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Upload failed");
      }

      const data = await res.json().catch(() => null);
      // navigate to resource or dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Upload error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Upload Resource</h1>

        <form onSubmit={submit} className="space-y-6">
          {/* File box */}
          <div ref={dropRef} className="rounded-xl border-2 border-dashed border-border p-6 text-center hover:shadow-lg transition cursor-pointer bg-card" onClick={onChooseFile}>
            <input ref={fileInputRef} onChange={onFileChange} type="file" className="hidden" />
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">☁️⬆️</div>
              <div className="font-semibold">Drag & drop your file here, or click to browse</div>
              <div className="text-sm text-muted-foreground">Supported: images, zip, pdf, code files</div>
            </div>

            {file && (
              <div className="mt-4 bg-background/40 p-3 rounded-md flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden">
                    {preview ? <img src={preview} alt="preview" className="object-cover w-full h-full" /> : <div className="text-xl">📄</div>}
                  </div>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{(file.size/1024).toFixed(1)} KB • {file.type || 'file'}</div>
                  </div>
                </div>
                <button type="button" onClick={(ev) => { ev.stopPropagation(); setFile(null); }} className="text-sm text-red-500">Remove</button>
              </div>
            )}
          </div>

          {/* Form inputs */}
          <div className="rounded-xl bg-card border border-border p-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Resource Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-md px-3 py-2 bg-background border border-border outline-none" placeholder="Enter a short, descriptive title" />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); autoResize(e.target); }}
                rows={3}
                className="mt-2 w-full rounded-md px-3 py-2 bg-background border border-border outline-none resize-none"
                placeholder="Describe your resource"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full rounded-md px-3 py-2 bg-background border border-border outline-none">
                  <option value="">Select category</option>
                  <option value="templates">Templates</option>
                  <option value="apis">APIs</option>
                  <option value="tools">Tools</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="mt-2 bg-background border border-border rounded-md p-2 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <div key={t} className="flex items-center gap-2 bg-primary/10 text-sm rounded-full px-3 py-1">
                      <span>{t}</span>
                      <button type="button" onClick={() => removeTag(t)} className="text-xs">✕</button>
                    </div>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={onTagKey}
                    className="flex-1 min-w-32 px-2 py-1 bg-transparent outline-none"
                    placeholder="Type tag and press Enter"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Visibility</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setVisibility('public')} className={`px-3 py-1 rounded-full ${visibility==='public' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>Public</button>
                <button type="button" onClick={() => setVisibility('private')} className={`px-3 py-1 rounded-full ${visibility==='private' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>Private</button>
              </div>
            </div>
          </div>

          <div>
            <button disabled={loading} type="submit" className="w-full py-3 rounded-2xl text-white font-semibold shadow-lg transition transform hover:scale-105 bg-linear-to-r from-indigo-600 to-pink-600">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  Uploading...
                </div>
              ) : (
                'Upload Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
