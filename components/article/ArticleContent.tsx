import type { JSONContent, Extensions } from "@tiptap/core";
import { getSchema } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Mathematics from "@tiptap/extension-mathematics";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Highlight from "@tiptap/extension-highlight";
import katex from "katex";
import { DOMSerializer, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { DOMParser } from "linkedom";

export type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

const extensions: Extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
  }),
  Image.configure({
    HTMLAttributes: {
      class: "my-6 overflow-hidden rounded-xl border bg-slate-50",
    },
  }),
  Mathematics.configure({
    katex,
  }),
  Table.configure({
    resizable: false,
    lastColumnResizable: false,
    allowTableNodeSelection: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  HorizontalRule.configure({
    HTMLAttributes: { class: "my-6 border-t border-slate-200" },
  }),
  Highlight.configure({
    multicolor: false,
  }),
];

type Props = {
  content: unknown;
};

export default function ArticleContent({ content }: Props) {
  const { html } = renderContentWithHeadings(content);
  if (!html) {
    return (
      <div className="prose prose-slate max-w-none text-slate-500">
        <p>コンテンツを読み込めませんでした。</p>
      </div>
    );
  }

  return (
    <div
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function renderContentWithHeadings(content: unknown) {
  const json = normalizeContent(content);
  if (!json) {
    return { html: "", headings: [] as HeadingItem[] };
  }

  const { html, headings } = renderHtmlWithHeadings(json, extensions);
  return { html, headings };
}

function normalizeContent(content: unknown): JSONContent | null {
  if (!content) return null;
  if (typeof content === "string") {
    try {
      return JSON.parse(content) as JSONContent;
    } catch {
      return null;
    }
  }
  if (typeof content === "object") {
    return content as JSONContent;
  }

  return null;
}

function renderHtmlWithHeadings(json: JSONContent, exts: Extensions) {
  const schema = getSchema(exts);
  const doc = ProseMirrorNode.fromJSON(schema, json);
  const parser = new DOMParser();
  const ssrDocument = parser.parseFromString(
    "<!doctype html><html><head></head><body></body></html>",
    "text/html"
  );
  const serializer = DOMSerializer.fromSchema(schema);
  const fragment = serializer.serializeFragment(doc.content, {
    document: ssrDocument,
  });
  const container = ssrDocument.createElement("div");
  container.appendChild(fragment);

  // 数式ノードを KaTeX でサーバーサイドレンダリング
  const inlineNodes = container.querySelectorAll(
    ".tiptap-mathematics-render[data-type='inline-math'], [data-type='inline-math'], math-inline, span.math-inline"
  );
  inlineNodes.forEach((el) => {
    const latex =
      (el as HTMLElement).dataset.latex ||
      (el as HTMLElement).getAttribute("data-latex") ||
      (el as HTMLElement).textContent ||
      "";
    (el as HTMLElement).innerHTML = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
    });
  });

  const blockNodes = container.querySelectorAll(
    ".tiptap-mathematics-render[data-type='block-math'], [data-type='block-math'], math-block, div.math-block"
  );
  blockNodes.forEach((el) => {
    const latex =
      (el as HTMLElement).dataset.latex ||
      (el as HTMLElement).getAttribute("data-latex") ||
      (el as HTMLElement).textContent ||
      "";
    (el as HTMLElement).innerHTML = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true,
    });
  });

  const headings: HeadingItem[] = [];
  const used = new Map<string, number>();
  const elements = container.querySelectorAll("h2");
  elements.forEach((el, index) => {
    const text = (el.textContent || `section-${index + 1}`).trim();
    const base = slugify(text);
    const count = used.get(base) || 0;
    const id = count === 0 ? base : `${base}-${count + 1}`;
    used.set(base, count + 1);
    el.setAttribute("id", id);
    headings.push({ id, text, level: 2 });
  });

  // Fallback: $...$ / $$...$$ が残っている場合もレンダリング
  let htmlStr = container.innerHTML;
  htmlStr = htmlStr.replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) =>
    katex.renderToString(latex, { throwOnError: false, displayMode: true })
  );
  htmlStr = htmlStr.replace(/\$([^$]+?)\$/g, (_, latex) =>
    katex.renderToString(latex, { throwOnError: false, displayMode: false })
  );

  return { html: htmlStr, headings };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-龠ぁ-んァ-ンー]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80) || "heading";
}
