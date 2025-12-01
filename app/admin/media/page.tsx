"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/admin/AdminGuard";

type StorageEntry = {
  name: string;
  updated_at?: string | null;
  metadata: { size?: number } | null;
};

type ImageFile = {
  name: string;
  path: string;
  url: string;
  bytes: number;
  updatedAt?: string;
  year?: string;
  month?: string;
};

const BUCKET = "article-images";
const ROOT_PREFIX = "media";

export default function MediaPage() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [listing, setListing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const refresh = useCallback(async () => {
    setListing(true);
    setErrorMsg(null);
    setStatusMsg("画像リストを読み込み中...");

    try {
      const rows = await walkStorageFolders(BUCKET, ROOT_PREFIX);
      rows.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
      setFiles(rows);
      setStatusMsg(`画像を ${rows.length} 件読み込みました`);
    } catch (error) {
      setFiles([]);
      setErrorMsg(describeError(error));
      setStatusMsg(null);
    } finally {
      setListing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    setStatusMsg(`アップロード中: ${file.name}`);

    const folder = buildFolderPath();
    const safeName = buildSafeFileName(file.name);
    const objectPath = `${folder}/${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    event.target.value = "";
    setUploading(false);

    if (error) {
      setErrorMsg(describeError(error));
      setStatusMsg(null);
      return;
    }

    setStatusMsg(`アップロードしました: ${objectPath}`);
    await refresh();
  }

  async function handleDelete(file: ImageFile) {
    if (!window.confirm(`この画像を削除しますか？\n${file.path}`)) return;

    setErrorMsg(null);
    setStatusMsg("削除中...");

    const { error } = await supabase.storage.from(BUCKET).remove([file.path]);

    if (error) {
      setErrorMsg(describeError(error));
      setStatusMsg(null);
      return;
    }

    setStatusMsg(`削除しました: ${file.path}`);
    await refresh();
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      window.alert(`コピーしました:\n${url}`);
    } catch {
      window.alert(`クリップボードにコピーできませんでした。\n${url}`);
    }
  }

  const years = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => f.year && set.add(f.year));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [files]);

  const months = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => f.month && set.add(f.month));
    return Array.from(set).sort();
  }, [files]);

  const filtered = useMemo(() => {
    return files.filter((file) => {
      const matchYear = yearFilter === "all" || file.year === yearFilter;
      const matchMonth = monthFilter === "all" || file.month === monthFilter;
      return matchYear && matchMonth;
    });
  }, [files, yearFilter, monthFilter]);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Media
              </p>
              <h1 className="text-2xl font-bold text-slate-900">メディア管理 / 画像一覧</h1>
              <p className="text-xs text-slate-500">
                画像は {ROOT_PREFIX}/年/月/ファイル名 の形式で保存されます（例: media/2025/01/sample.png）。
              </p>
            </div>
            <button
              type="button"
              onClick={refresh}
              disabled={listing}
              className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50"
            >
              再読み込み
            </button>
          </header>

          <section className="space-y-3 rounded-xl border bg-white p-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">画像をアップロード</h2>
              <p className="text-xs text-slate-500">
                ファイルは自動的に {ROOT_PREFIX}/年/月 フォルダに保存されます。
              </p>
            </div>
            <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
              <span className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
                画像を選択
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              {uploading && (
                <span className="text-xs text-slate-500">アップロード中...</span>
              )}
            </label>
          </section>

          <section className="rounded-xl border bg-white p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-sm font-semibold text-slate-900">フィルター</h2>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="rounded border px-3 py-1.5 text-sm"
              >
                <option value="all">すべての年</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="rounded border px-3 py-1.5 text-sm"
              >
                <option value="all">すべての月</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
              {listing && (
                <span className="text-xs text-slate-500">読み込み中...</span>
              )}
            </div>
            {statusMsg && (
              <div className="rounded border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                {statusMsg}
              </div>
            )}
            {errorMsg && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
          </section>

          <section className="rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">アップロード済み画像</h2>
              <span className="text-xs text-slate-500">{filtered.length} 件</span>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-slate-500">該当する画像がまだありません。</p>
            ) : (
              <ul className="space-y-4">
                {filtered.map((file) => (
                  <li
                    key={file.path}
                    className="flex flex-wrap gap-4 rounded-lg border p-3"
                  >
                    <div className="flex h-24 w-36 items-center justify-center overflow-hidden rounded bg-slate-100">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-[220px] flex-1 space-y-2">
                      <div>
                        <p className="break-all font-mono text-xs text-slate-700">
                          {file.path}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {formatBytes(file.bytes)} /{" "}
                          {file.updatedAt
                            ? new Date(file.updatedAt).toLocaleString("ja-JP")
                            : "-"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(file.url)}
                          className="rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                        >
                          公開URLをコピー
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(file)}
                          className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

function buildFolderPath() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${ROOT_PREFIX}/${year}/${month}`;
}

function buildSafeFileName(original: string) {
  const lower = original.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
  const ext = lower.includes(".") ? lower.split(".").pop() : "";
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${random}${ext ? `.${ext}` : ""}`;
}

async function walkStorageFolders(
  bucket: string,
  folder: string
): Promise<ImageFile[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 1000, sortBy: { column: "name", order: "asc" } });

  if (error) {
    throw error;
  }

  const entries = (data ?? []) as StorageEntry[];
  const files: ImageFile[] = [];

  for (const entry of entries) {
    const nextPath = folder ? `${folder}/${entry.name}` : entry.name;
    const isFolder = !entry.metadata;

    if (isFolder) {
      const nested = await walkStorageFolders(bucket, nextPath);
      files.push(...nested);
      continue;
    }

    const { year, month } = parseYearMonth(nextPath);

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(nextPath);

    files.push({
      name: entry.name,
      path: nextPath,
      url: publicUrl,
      bytes: typeof entry.metadata?.size === "number" ? entry.metadata.size : 0,
      updatedAt: entry.updated_at ?? undefined,
      year,
      month,
    });
  }

  return files;
}

function parseYearMonth(path: string) {
  const parts = path.split("/");
  const year = parts.length >= 3 ? parts[1] : undefined;
  const month = parts.length >= 3 ? parts[2] : undefined;
  return { year, month };
}

function describeError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "原因不明のエラーが発生しました。";
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}