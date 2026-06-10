import React, { useState, useEffect, useRef, createElement } from "react";
import { Bold, Italic, List, Code, Eye, Edit3, Save } from "lucide-react";
import { useHiveStore } from "@/store/useHiveStore";
import { useBeeToasts } from "@/context/BeeToastContext";
import Markdown from "marked-react";

interface MarkdownNotesEditorProps {
  taskId: string;
  initialValue?: string;
  onClose?: () => void;
}

const markdownRenderer = {
  heading(children: React.ReactNode, level: number) {
    const classes: Record<number, string> = {
      1: "text-md font-black text-[#e28800] mt-4 mb-2",
      2: "text-sm font-black text-[#100f0d] mt-4 mb-1.5",
      3: "text-xs font-black text-[#100f0d] mt-3 mb-1 uppercase tracking-wide",
    };
    return createElement(
      `h${level}`,
      { className: classes[level] || classes[3], key: undefined },
      children,
    );
  },
  paragraph(children: React.ReactNode) {
    return createElement(
      "p",
      { className: "my-1.5 text-xs text-stone-700 leading-relaxed", key: undefined },
      children,
    );
  },
  strong(children: React.ReactNode) {
    return createElement(
      "strong",
      { className: "font-bold text-[#100f0d]", key: undefined },
      children,
    );
  },
  em(children: React.ReactNode) {
    return createElement("em", { className: "italic text-stone-600", key: undefined }, children);
  },
  codespan(code: string) {
    return createElement(
      "code",
      {
        className:
          "bg-[#faf6ee] text-[#e28800] px-1.5 py-0.5 rounded border border-[#ebdcb9] font-mono text-[10px]",
        key: undefined,
      },
      code,
    );
  },
  code(code: string, lang?: string) {
    const langClass = lang ? `language-${lang}` : "";
    return createElement(
      "pre",
      {
        className: `bg-stone-900 text-[#ebdcb9] font-mono text-[11px] p-3 rounded-lg overflow-x-auto my-3 ${langClass}`,
        key: undefined,
      },
      this.codespan(code),
    );
  },
  list(children: React.ReactNode, ordered: boolean) {
    const Tag = ordered ? "ol" : "ul";
    return createElement(
      Tag,
      { className: "list-disc ml-5 text-xs text-stone-700 my-1 space-y-1", key: undefined },
      children,
    );
  },
  listItem(children: React.ReactNode) {
    return createElement(
      "li",
      { className: "text-xs text-stone-700 my-1", key: undefined },
      children,
    );
  },
  checkbox(checked: boolean) {
    return createElement("input", {
      type: "checkbox",
      checked,
      disabled: true,
      className: checked ? "accent-emerald-600 w-3 h-3 mr-1.5" : "w-3 h-3 mr-1.5",
      key: undefined,
    });
  },
  link(href: string, children: React.ReactNode) {
    return createElement(
      "a",
      {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-[#e28800] underline hover:text-[#d47800]",
        key: undefined,
      },
      children,
    );
  },
  blockquote(children: React.ReactNode) {
    return createElement(
      "blockquote",
      {
        className: "border-l-2 border-[#e28800] pl-3 my-2 text-stone-600 italic text-xs",
        key: undefined,
      },
      children,
    );
  },
  hr() {
    return createElement("hr", { className: "border-[#ebdcb9] my-3", key: undefined });
  },
};

export const MarkdownNotesEditor: React.FC<MarkdownNotesEditorProps> = ({
  taskId,
  initialValue = "",
  onClose,
}) => {
  const [value, setValue] = useState(initialValue);
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateTaskNotes = useHiveStore((state) => state.updateTaskNotes);
  const { showToast } = useBeeToasts();

  // Save changes to notes with a local timeout (autosave)
  useEffect(() => {
    if (value === initialValue) return;

    setIsSaving(true);
    const delayDebounceFn = setTimeout(async () => {
      await updateTaskNotes(taskId, value);
      setIsSaving(false);
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [value, taskId, updateTaskNotes, initialValue]);

  // Insert markdown helpers helper
  const insertMarkdown = (syntax: string, placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || placeholder;

    let replacement = "";
    if (syntax === "list") {
      replacement = `\n- ${selected}`;
    } else if (syntax === "code-block") {
      replacement = `\n\`\`\`\n${selected}\n\`\`\`\n`;
    } else {
      replacement = `${syntax}${selected}${syntax}`;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setValue(newValue);

    // Focus back
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntax.length, start + syntax.length + selected.length);
    }, 50);
  };

  const forceSave = async () => {
    setIsSaving(true);
    await updateTaskNotes(taskId, value);
    setIsSaving(false);
    showToast("¡Nota guardada en el panal!", "honey");
  };

  return (
    <div className="w-full mt-3 bg-stone-50/80 border border-[#ebdcb9]/40 rounded-xl p-3 flex flex-col space-y-2 select-none animate-fade-in">
      {/* Dynamic Header Toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#ebdcb9]/25">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-500 flex items-center gap-1">
          📝 Notas del Panal
          {isSaving && (
            <span className="text-[8px] text-[#e28800] flex items-center space-x-1 animate-pulse ml-2 font-mono">
              (Destilando...)
            </span>
          )}
        </span>

        <div className="flex items-center space-x-1.5">
          {/* Sub-toolbar helper buttons in Edit mode only */}
          {mode === "edit" && (
            <div className="flex items-center space-x-1 border-r border-[#ebdcb9]/50 pr-2 mr-1">
              <button
                type="button"
                onClick={() => insertMarkdown("**", "negrita")}
                className="p-1 text-stone-500 hover:text-[#e28800] hover:bg-stone-200/50 rounded-md transition-colors"
                aria-label="Negrita"
                title="Negrita"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "cursiva")}
                className="p-1 text-stone-500 hover:text-[#e28800] hover:bg-stone-200/50 rounded-md transition-colors"
                aria-label="Cursiva"
                title="Cursiva"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("list", "ítem")}
                className="p-1 text-stone-500 hover:text-[#e28800] hover:bg-stone-200/50 rounded-md transition-colors"
                aria-label="Lista"
                title="Lista"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("code-block", "código")}
                className="p-1 text-stone-500 hover:text-[#e28800] hover:bg-stone-200/50 rounded-md transition-colors"
                aria-label="Bloque de código"
                title="Bloque de código"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Toggle View Mode Slider */}
          <div className="bg-stone-200/65 rounded-lg p-0.5 flex space-x-0.5">
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center space-x-1 transition-all ${
                mode === "preview"
                  ? "bg-white text-[#e28800] shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Eye className="w-2.5 h-2.5" />
              <span>Ver</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center space-x-1 transition-all ${
                mode === "edit"
                  ? "bg-white text-[#e28800] shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Edit3 className="w-2.5 h-2.5" />
              <span>Editar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={forceSave}
            disabled={isSaving}
            className="p-1 bg-amber-100 hover:bg-[#e28800]/10 text-[#e28800] border border-[#ebdcb9] rounded-lg transition-colors cursor-pointer"
            aria-label="Guardar nota"
            title="Sincronizar ahora"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="w-full min-h-[90px] select-text">
        {mode === "edit" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-white border border-[#ebdcb9]/40 rounded-lg p-2.5 text-xs text-stone-800 outline-none focus:border-[#e28800]/60 focus:bg-white placeholder-stone-400 font-mono resize-none h-[110px]"
            placeholder="Introduce notas libres en formato Markdown..."
            aria-label="Editor de notas Markdown"
            maxLength={1000}
          />
        ) : !value.trim() ? (
          <p className="text-stone-400 italic p-1 text-xs">
            No hay notas escritas... Haz clic en Editar para comenzar.
          </p>
        ) : (
          <div className="p-1 min-h-[60px]">
            <Markdown value={value} renderer={markdownRenderer} breaks />
          </div>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-[9px] font-bold text-stone-400 hover:text-[#e28800] self-end pt-1"
        >
          Ocultar Notas
        </button>
      )}
    </div>
  );
};

// Default export is essential for React.lazy
export default MarkdownNotesEditor;
