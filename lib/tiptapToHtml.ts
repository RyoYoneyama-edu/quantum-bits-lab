// lib/tiptapToHtml.ts
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

export function tiptapToHtml(json: any) {
  // Tiptapの基本形式じゃなかったらレンダリングしない
  if (!json || typeof json !== "object" || json.type !== "doc") {
    return "<p>本文がまだ Tiptap 形式で保存されていません。</p>";
  }

  try {
    return generateHTML(json, [StarterKit]);
  } catch (e) {
    console.error("Tiptap HTML 変換エラー:", e);
    return "<p>本文の読み込みに失敗しました。</p>";
  }
}
