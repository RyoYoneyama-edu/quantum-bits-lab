import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textSize: {
      setTextSmall: () => ReturnType;
      unsetTextSize: () => ReturnType;
    };
  }
}

export const TextSize = Mark.create({
  name: "textSize",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-size") || null,
        renderHTML: (attrs) => {
          if (attrs.size === "s") {
            return {
              "data-size": "s",
              class: "text-size-s",
            };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-size]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setTextSmall:
        () =>
        ({ commands }) =>
          commands.setMark(this.name, { size: "s" }),
      unsetTextSize:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
