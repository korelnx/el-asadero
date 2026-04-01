"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MENU_ITEMS as CONFIG_ITEMS, CATEGORIES as CONFIG_CATS } from "@/config/menu";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_path: string | null;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  tags: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Category Form Modal ──────────────────────────────────────────────────────

function CategoryModal({
  category,
  onSave,
  onClose,
}: {
  category: Partial<Category> | null;
  onSave: (data: Partial<Category>) => Promise<void>;
  onClose: () => void;
}) {
  const isNew = !category?.id;
  const initial = {
    name: category?.name ?? "",
    description: category?.description ?? "",
    display_order: category?.display_order ?? 0,
    is_active: category?.is_active ?? true,
  };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const isDirty =
    form.name !== initial.name ||
    form.description !== initial.description ||
    form.display_order !== initial.display_order ||
    form.is_active !== initial.is_active;

  function tryClose() {
    if (isDirty) setConfirmDiscard(true);
    else onClose();
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      toast.success(isNew ? "Category created" : "Category updated");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={tryClose}
        />
        {/* Sheet */}
        <div className="relative w-full max-w-sm bg-background border-l border-border shadow-2xl flex flex-col animate-sheet-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif">{isNew ? "New Category" : "Edit Category"}</h2>
              {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Unsaved changes" />}
            </div>
            <button onClick={tryClose} className="text-foreground-muted hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Name" required>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && submit()}
                className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="e.g. Starters"
                required
                autoFocus
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                rows={2}
                placeholder="Optional short description"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Display Order">
                <input
                  type="number"
                  value={form.display_order}
                  onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                  className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.is_active ? "active" : "inactive"}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "active" }))}
                  className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>

          <div className="flex-shrink-0 px-6 py-4 border-t border-border flex gap-3">
            <button
              onClick={submit}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-background text-sm font-medium py-2.5 hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {saving && <Spinner />}
              {isNew ? "Create" : "Save Changes"}
            </button>
            <button type="button" onClick={tryClose} className="px-5 py-2.5 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Unsaved changes alert */}
      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={onClose}
              className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 text-sm font-medium transition-colors"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Item Form Modal ──────────────────────────────────────────────────────────

function ItemModal({
  item,
  categories,
  defaultCategoryId,
  onSave,
  onClose,
}: {
  item: Partial<MenuItem> | null;
  categories: Category[];
  defaultCategoryId: string | null;
  onSave: (data: Partial<MenuItem>) => Promise<void>;
  onClose: () => void;
}) {
  const isNew = !item?.id;
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const initial = {
    category_id: item?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "",
    name: item?.name ?? "",
    description: item?.description ?? "",
    price: item?.price?.toFixed(2) ?? "",
    is_available: item?.is_available ?? true,
    is_featured: item?.is_featured ?? false,
    display_order: item?.display_order ?? 0,
    tags: item?.tags?.join(", ") ?? "",
    image_url: item?.image_url ?? "",
    image_path: item?.image_path ?? "",
  };
  const [form, setForm] = useState(initial);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const isDirty =
    form.name !== initial.name ||
    form.description !== initial.description ||
    form.price !== initial.price ||
    form.category_id !== initial.category_id ||
    form.is_available !== initial.is_available ||
    form.is_featured !== initial.is_featured ||
    form.display_order !== initial.display_order ||
    form.tags !== initial.tags ||
    form.image_url !== initial.image_url;

  function tryClose() {
    if (isDirty) setConfirmDiscard(true);
    else onClose();
  }

  async function uploadFile(file: File) {

    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop();
    const path = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("menu-images").getPublicUrl(data.path);

    // Delete old image from storage if replacing
    if (form.image_path) {
      await supabase.storage.from("menu-images").remove([form.image_path]);
    }

    setForm(f => ({ ...f, image_url: publicUrl, image_path: data.path }));
    setImagePreview(publicUrl);
    setUploading(false);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Only image files are supported"); return; }
    uploadFile(file);
  }

  async function handleRemoveImage() {
    if (form.image_path) {
      await supabase.storage.from("menu-images").remove([form.image_path]);
    }
    setForm(f => ({ ...f, image_url: "", image_path: "" }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...form,
        price: parseFloat(form.price),
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        image_url: form.image_url || null,
        image_path: form.image_path || null,
      });
      toast.success(isNew ? "Item created" : "Item updated");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={tryClose}
      />
      {/* Sheet */}
      <div className="relative w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col animate-sheet-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif">{isNew ? "New Item" : "Edit Item"}</h2>
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Unsaved changes" />}
          </div>
          <button onClick={tryClose} className="text-foreground-muted hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Image upload */}
          <Field label="Image">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileInput}
            />
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative w-full aspect-[16/9] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                dragging
                  ? "border-primary bg-primary/5"
                  : imagePreview
                  ? "border-border hover:border-primary/50"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-foreground-muted">
                  <Spinner className="w-5 h-5" />
                  <span className="text-xs">Uploading…</span>
                </div>
              ) : imagePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-xs text-white font-medium">Drop to replace</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-foreground-muted pointer-events-none">
                  <svg className="w-7 h-7 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-xs text-center">
                    <span className="text-primary">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs opacity-40">JPG, PNG, WebP, GIF</p>
                </div>
              )}

              {dragging && !imagePreview && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-sm text-primary font-medium">Drop image here</p>
                </div>
              )}
            </div>

            {imagePreview && !uploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-1.5 text-xs text-foreground-muted/50 hover:text-red-400 transition-colors"
              >
                Remove image
              </button>
            )}
          </Field>

          <Field label="Category" required>
            <select
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              required
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Name" required>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="e.g. Jollof Rice"
              required
              autoFocus
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
              rows={2}
              placeholder="Short description shown to customers"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price ($)" required>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="0.00"
                required
              />
            </Field>
            <Field label="Display Order">
              <input
                type="number"
                value={form.display_order}
                onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </Field>
          </div>

          <Field label="Tags">
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className="w-full bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="spicy, vegetarian, popular  (comma separated)"
            />
          </Field>

          <div className="flex flex-col gap-3">
            <Toggle
              label="Available"
              checked={form.is_available}
              onChange={v => setForm(f => ({ ...f, is_available: v }))}
            />
            <Toggle
              label="Featured"
              checked={form.is_featured}
              onChange={v => setForm(f => ({ ...f, is_featured: v }))}
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Footer actions pinned to bottom */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={submit}
            disabled={saving || uploading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-background text-sm font-medium py-2.5 hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {saving && <Spinner />}
            {isNew ? "Create" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={tryClose}
            className="px-5 py-2.5 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    {/* Unsaved changes alert */}
    <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. If you leave now they will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction
            onClick={onClose}
            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 text-sm font-medium transition-colors"
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

// ─── Small reusable components ────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-foreground-muted uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-border"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      <span className="text-sm text-foreground-muted leading-none">{label}</span>
    </label>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-border w-full max-w-sm shadow-2xl p-6">
        <p className="text-sm text-foreground mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {loading && <Spinner />}
            Delete
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-border text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const IS_DEV = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

const MOCK_CATEGORIES: Category[] = CONFIG_CATS.map(c => ({
  ...c,
  is_active: true,
}));

const MOCK_ITEMS: MenuItem[] = CONFIG_ITEMS.map((item, i) => ({
  ...item,
  image_path: null,
  is_available: true,
  display_order: i + 1,
}));

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>(IS_DEV ? MOCK_CATEGORIES : []);
  const [items, setItems] = useState<MenuItem[]>(IS_DEV ? MOCK_ITEMS : []);
  const [loading, setLoading] = useState(!IS_DEV);
  const [selectedCatId, setSelectedCatId] = useState<string | "all">("all");

  const [categoryModal, setCategoryModal] = useState<{ mode: "new" | "edit"; data: Partial<Category> } | null>(null);
  const [itemModal, setItemModal] = useState<{ mode: "new" | "edit"; data: Partial<MenuItem> } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "category"; id: string; name: string }
    | { type: "item"; id: string; name: string }
    | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (IS_DEV) return;
    const res = await fetch("/api/admin/menu");
    if (!res.ok) { setLoading(false); return; }
    const { categories: cats, items: its } = await res.json();
    setCategories(cats ?? []);
    setItems(its ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Category CRUD ──────────────────────────────────────────────────────────

  async function saveCategory(data: Partial<Category>) {
    const isNew = !categoryModal?.data.id;
    const res = await fetch(
      isNew ? "/api/admin/menu/categories" : `/api/admin/menu/categories/${categoryModal!.data.id}`,
      { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }
    );
    if (!res.ok) throw new Error((await res.json()).error);
    await fetchData();
    setCategoryModal(null);
  }

  async function deleteCategory() {
    if (!deleteTarget || deleteTarget.type !== "category") return;
    setDeleting(true);
    const res = await fetch(`/api/admin/menu/categories/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json();
      alert(error);
      setDeleting(false);
      setDeleteTarget(null);
      return;
    }
    await fetchData();
    if (selectedCatId === deleteTarget.id) setSelectedCatId("all");
    setDeleting(false);
    setDeleteTarget(null);
    toast.success("Category deleted");
  }

  async function toggleCategoryActive(cat: Category) {
    setTogglingId(cat.id);
    await fetch(`/api/admin/menu/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !cat.is_active }),
    });
    await fetchData();
    setTogglingId(null);
  }

  // ── Item CRUD ──────────────────────────────────────────────────────────────

  async function saveItem(data: Partial<MenuItem>) {
    const isNew = !itemModal?.data.id;
    const res = await fetch(
      isNew ? "/api/admin/menu/items" : `/api/admin/menu/items/${itemModal!.data.id}`,
      { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }
    );
    if (!res.ok) throw new Error((await res.json()).error);
    await fetchData();
    setItemModal(null);
  }

  async function deleteItem() {
    if (!deleteTarget || deleteTarget.type !== "item") return;
    setDeleting(true);
    await fetch(`/api/admin/menu/items/${deleteTarget.id}`, { method: "DELETE" });
    await fetchData();
    setDeleting(false);
    setDeleteTarget(null);
    toast.success("Item deleted");
  }

  async function toggleItemAvailable(item: MenuItem) {
    setTogglingId(item.id);
    await fetch(`/api/admin/menu/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !item.is_available }),
    });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    setTogglingId(null);
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const visibleItems = selectedCatId === "all"
    ? items
    : items.filter(i => i.category_id === selectedCatId);

  const itemCountByCat = categories.reduce((acc, cat) => {
    acc[cat.id] = items.filter(i => i.category_id === cat.id).length;
    return acc;
  }, {} as Record<string, number>);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 h-16 border-b border-border flex items-center justify-between px-8">
        <h1 className="text-lg font-serif">Menu</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-foreground-muted">{items.length} items across {categories.length} categories</span>
          <button
            onClick={() => setItemModal({ mode: "new", data: {} })}
            className="flex items-center gap-1.5 text-xs px-4 py-2 bg-primary text-background hover:bg-primary-hover transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center gap-2 text-foreground-muted text-sm">
          <Spinner /> Loading menu…
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* Categories sidebar */}
          <aside className="w-56 border-r border-border flex flex-col flex-shrink-0">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="text-xs text-foreground-muted uppercase tracking-widest">Categories</p>
              <button
                onClick={() => setCategoryModal({ mode: "new", data: {} })}
                className="text-foreground-muted hover:text-primary transition-colors"
                title="New category"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-1">
              {/* All */}
              <button
                onClick={() => setSelectedCatId("all")}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  selectedCatId === "all" ? "bg-primary/10 text-primary" : "text-foreground-muted hover:text-foreground hover:bg-card"
                }`}
              >
                <span>All Items</span>
                <span className="text-xs opacity-60">{items.length}</span>
              </button>

              {categories.map(cat => (
                <div
                  key={cat.id}
                  className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                    selectedCatId === cat.id ? "bg-primary/10 text-primary" : "text-foreground-muted hover:text-foreground hover:bg-card"
                  } ${!cat.is_active ? "opacity-40" : ""}`}
                  onClick={() => setSelectedCatId(cat.id)}
                >
                  <span className="text-sm truncate flex-1 min-w-0">{cat.name}</span>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <span className="text-xs opacity-60">{itemCountByCat[cat.id] ?? 0}</span>
                    {/* Edit/delete on hover */}
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={e => { e.stopPropagation(); setCategoryModal({ mode: "edit", data: cat }); }}
                        className="p-1 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteTarget({ type: "category", id: cat.id, name: cat.name }); }}
                        className="p-1 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <p className="text-xs text-foreground-muted/40 px-4 py-3 italic">No categories yet</p>
              )}
            </div>
          </aside>

          {/* Items panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Items header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-border">
              <p className="text-sm text-foreground-muted">
                {selectedCatId === "all"
                  ? "All Items"
                  : categories.find(c => c.id === selectedCatId)?.name ?? ""}
                {" "}
                <span className="opacity-50">({visibleItems.length})</span>
              </p>
              <button
                onClick={() => setItemModal({ mode: "new", data: { category_id: selectedCatId === "all" ? undefined : selectedCatId } })}
                className="text-xs text-foreground-muted hover:text-primary transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New item
              </button>
            </div>

            {/* Items grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {visibleItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-foreground-muted gap-4">
                  <svg className="w-10 h-10 opacity-15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <p className="text-sm">No items here yet</p>
                  <button
                    onClick={() => setItemModal({ mode: "new", data: { category_id: selectedCatId === "all" ? undefined : selectedCatId } })}
                    className="text-xs px-4 py-2 border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    Add first item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      categoryName={categories.find(c => c.id === item.category_id)?.name}
                      showCategory={selectedCatId === "all"}
                      toggling={togglingId === item.id}
                      onEdit={() => setItemModal({ mode: "edit", data: item })}
                      onDelete={() => setDeleteTarget({ type: "item", id: item.id, name: item.name })}
                      onToggle={() => toggleItemAvailable(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {categoryModal && (
        <CategoryModal
          category={categoryModal.data}
          onSave={saveCategory}
          onClose={() => setCategoryModal(null)}
        />
      )}

      {itemModal && (
        <ItemModal
          item={itemModal.data}
          categories={categories}
          defaultCategoryId={selectedCatId === "all" ? null : selectedCatId}
          onSave={saveItem}
          onClose={() => setItemModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={deleteTarget.type === "category" ? deleteCategory : deleteItem}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

    </div>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({
  item,
  categoryName,
  showCategory,
  toggling,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: MenuItem;
  categoryName?: string;
  showCategory?: boolean;
  toggling: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={`group border border-border bg-card flex flex-col transition-opacity ${!item.is_available ? "opacity-50" : ""}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] bg-background overflow-hidden">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-foreground-muted/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {item.is_featured && (
            <span className="text-xs px-1.5 py-0.5 bg-primary text-background font-medium">Featured</span>
          )}
          {!item.is_available && (
            <span className="text-xs px-1.5 py-0.5 bg-foreground-muted/20 text-foreground-muted">Unavailable</span>
          )}
        </div>

        {/* Action overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-background/90 hover:bg-background text-foreground transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-background/90 hover:bg-red-500/20 text-foreground hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex-1 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
          <p className="text-sm font-semibold text-primary flex-shrink-0">${item.price.toFixed(2)}</p>
        </div>

        {item.description && (
          <p className="text-xs text-foreground-muted line-clamp-2">{item.description}</p>
        )}

        {categoryName && showCategory && (
          <p className="text-xs text-foreground-muted/50 mt-auto pt-1">{categoryName}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border flex items-center justify-between">
        <span className="text-xs text-foreground-muted/40">#{item.display_order}</span>
        <button
          onClick={onToggle}
          disabled={toggling}
          className={`flex items-center gap-1.5 text-xs transition-colors disabled:opacity-40 ${
            item.is_available ? "text-primary hover:text-foreground" : "text-foreground-muted hover:text-primary"
          }`}
        >
          {toggling ? <Spinner className="w-3 h-3" /> : (
            <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? "bg-primary" : "bg-foreground-muted"}`} />
          )}
          {item.is_available ? "Available" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
