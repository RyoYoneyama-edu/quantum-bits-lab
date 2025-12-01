"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export default function TagSelector({ value, onChange }: Props) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase
        .from("posts")
        .select("tags");

      if (error) {
        console.error("fetch tags error:", error);
        return;
      }

      const list = (data ?? []) as { tags: string[] | null }[];
      const flat = list.flatMap((row) => row.tags ?? []);
      const uniq = Array.from(new Set(flat)).sort();
      setAllTags(uniq);
    }

    fetchTags();
  }, []);

  const suggestions = useMemo(() => {
    const keyword = input.trim().toLowerCase();
    if (!keyword) return allTags.filter((t) => !value.includes(t)).slice(0, 8);
    return allTags
      .filter(
        (tag) =>
          !value.includes(tag) &&
          tag.toLowerCase().startsWith(keyword)
      )
      .slice(0, 8);
  }, [allTags, input, value]);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput("");
    setOpen(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
      event.preventDefault();
      addTag(input);
    } else if (
      event.key === "Backspace" &&
      !input &&
      value.length > 0
    ) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 rounded border px-2 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-slate-400 hover:text-slate-700"
              aria-label={`${tag} を削除`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "mram など、文字を入力すると候補が出ます" : ""}
          className="flex-1 min-w-[120px] border-none bg-transparent px-1 py-1 text-sm outline-none"
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow-lg">
          {suggestions.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => addTag(tag)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50"
              >
                <span>{tag}</span>
                {value.includes(tag) && (
                  <span className="text-[10px] text-slate-400">追加済み</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
