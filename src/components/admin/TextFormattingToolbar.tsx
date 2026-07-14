import { Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, HelpCircle, Palette, Type, Percent, ArrowUp } from "lucide-react";
import { useState } from "react";

interface TextFormattingToolbarProps {
  textareaId: string;
  value: string;
  onChange: (value: string) => void;
  lang?: "en" | "ur";
}

export default function TextFormattingToolbar({ textareaId, value, onChange, lang = "en" }: TextFormattingToolbarProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [showFontsMenu, setShowFontsMenu] = useState(false);
  const [showColorsMenu, setShowColorsMenu] = useState(false);
  const [showSizesMenu, setShowSizesMenu] = useState(false);

  const insertSyntax = (before: string, after: string = "") => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textSelection = textarea.value.substring(start, end);

    let replacement = "";
    if (before.startsWith("#") || before === "- " || before === "1. ") {
      // Line-level structural syntax
      if (textSelection) {
        replacement = before + textSelection + after;
      } else {
        replacement = before;
      }
    } else {
      // Inline wrapping syntax
      replacement = before + (textSelection || "text") + after;
    }

    const updatedValue = 
      textarea.value.substring(0, start) + 
      replacement + 
      textarea.value.substring(end);

    onChange(updatedValue);

    // Refresh focus and selection
    setTimeout(() => {
      textarea.focus({ preventScroll: true });
      const newSelectionStart = start + before.length;
      const newSelectionEnd = newSelectionStart + (textSelection || "text").length;
      textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
    }, 50);

    // Close any open popovers
    setShowFontsMenu(false);
    setShowColorsMenu(false);
    setShowSizesMenu(false);
  };

  const formats = [
    {
      label: "Bold",
      icon: <Bold size={14} />,
      onClick: () => insertSyntax("**", "**"),
      tooltip: "Bold Text (**text** or [bold]text[/bold])",
    },
    {
      label: "Italic",
      icon: <Italic size={14} />,
      onClick: () => insertSyntax("*", "*"),
      tooltip: "Italic Text (*text* or [italic]text[/italic])",
    },
    {
      label: "Underline",
      icon: <Underline size={14} />,
      onClick: () => insertSyntax("__", "__"),
      tooltip: "Underline (__text__ or [underline]text[/underline])",
    },
    {
      label: "H1",
      icon: <Heading1 size={14} />,
      onClick: () => insertSyntax("# "),
      tooltip: "Heading 1 (# Heading)",
    },
    {
      label: "H2",
      icon: <Heading2 size={14} />,
      onClick: () => insertSyntax("## "),
      tooltip: "Heading 2 (## Heading)",
    },
    {
      label: "Bullet List",
      icon: <List size={14} />,
      onClick: () => insertSyntax("- "),
      tooltip: "Bullet List (- Item)",
    },
    {
      label: "Numbered List",
      icon: <ListOrdered size={14} />,
      onClick: () => insertSyntax("1. "),
      tooltip: "Numbered List (1. Item)",
    },
  ];

  return (
    <div className="flex flex-col gap-1.5 w-full bg-slate-50 p-2.5 border-t border-x border-slate-200 rounded-t-xl select-none">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Formatting Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {formats.map((fmt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fmt.onClick();
              }}
              title={fmt.tooltip}
              className="p-2 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg transition-all cursor-pointer flex items-center justify-center border border-slate-200/80 shadow-sm"
            >
              {fmt.icon}
              <span className="sr-only">{fmt.label}</span>
            </button>
          ))}

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* CUSTOM FONT APPLIER */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowFontsMenu(!showFontsMenu);
                setShowColorsMenu(false);
                setShowSizesMenu(false);
              }}
              title="Apply Custom Font"
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm text-xs font-bold ${
                showFontsMenu ? "bg-primary-100 border-primary-300 text-primary-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Type size={14} />
              <span>Fonts</span>
            </button>

            {showFontsMenu && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20 space-y-0.5 animate-fade-in text-left">
                <button
                  type="button"
                  onClick={() => insertSyntax("[font-urdu]", "[/font-urdu]")}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-between"
                >
                  <span>Urdu Font</span>
                  <span className="font-urdu text-[11px] text-gray-400">اردو</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertSyntax("[font-english]", "[/font-english]")}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-between"
                >
                  <span>English Font</span>
                  <span className="text-[10px] text-gray-400 font-mono">Abc</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertSyntax("[font-arabic]", "[/font-arabic]")}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-between"
                >
                  <span>Quranic Arabic</span>
                  <span className="font-arabic text-[11px] text-gray-400">عربي</span>
                </button>
              </div>
            )}
          </div>

          {/* DYNAMIC TEXT SIZES */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSizesMenu(!showSizesMenu);
                setShowFontsMenu(false);
                setShowColorsMenu(false);
              }}
              title="Apply Font Size"
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm text-xs font-bold ${
                showSizesMenu ? "bg-primary-100 border-primary-300 text-primary-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <ArrowUp size={14} />
              <span>Sizes</span>
            </button>

            {showSizesMenu && (
              <div className="absolute left-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20 space-y-0.5 animate-fade-in text-left">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); insertSyntax("[size-lg]", "[/size-lg]"); }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Large Text (1.25x)
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); insertSyntax("[size-xl]", "[/size-xl]"); }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Extra Large (1.5x)
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); insertSyntax("[size-2xl]", "[/size-2xl]"); }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Double Size (2x)
                </button>
              </div>
            )}
          </div>

          {/* DYNAMIC TEXT COLORS */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowColorsMenu(!showColorsMenu);
                setShowFontsMenu(false);
                setShowSizesMenu(false);
              }}
              title="Apply Text Colors"
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm text-xs font-bold ${
                showColorsMenu ? "bg-primary-100 border-primary-300 text-primary-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Palette size={14} />
              <span>Colors</span>
            </button>

            {showColorsMenu && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20 space-y-0.5 animate-fade-in text-left">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); insertSyntax("[color-primary]", "[/color-primary]"); }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 rounded-lg flex items-center gap-2 text-primary-750"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-primary-700 block" />
                  <span>Primary Theme</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); insertSyntax("[color-red]", "[/color-red]"); }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 rounded-lg flex items-center gap-2 text-red-650"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-600 block" />
                  <span>Sufi Red Color</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); insertSyntax("[color-green]", "[/color-green]"); }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 rounded-lg flex items-center gap-2 text-emerald-750"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 block" />
                  <span>Quran Green Color</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Helper Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 bg-slate-200/50 rounded-md border border-slate-200">
            {lang === "ur" ? "اردو فارمیٹ" : "English Format"}
          </span>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer text-xs font-semibold border ${
              showHelp 
                ? "bg-slate-800 border-slate-850 text-white" 
                : "bg-white border-slate-200 hover:bg-slate-100 text-slate-500"
            }`}
          >
            <HelpCircle size={14} />
            <span>Guide</span>
          </button>
        </div>
      </div>

      {/* Guide Help Board */}
      {showHelp && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in mt-1 shadow-inner">
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-primary-850 flex items-center gap-1">
              <span>🔤 Rich Typography Syntax</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
              <li>Use <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-primary-750">**text**</code> for <strong>Bold style</strong></li>
              <li>Use <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-primary-750">*text*</code> for <em>Italic style</em></li>
              <li>Use <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-primary-750">__text__</code> for <span className="underline">Underlined</span></li>
              <li>Apply tags: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-800">[font-urdu]اردو[/font-urdu]</code> for custom uploaded Urdu font!</li>
            </ul>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-primary-850">📌 Color, Size & Structure</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
              <li><code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-800">[size-xl]text[/size-xl]</code> for larger text block</li>
              <li><code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-800">[color-primary]text[/color-primary]</code> theme-specific highlight</li>
              <li><code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-800">[color-red]text[/color-red]</code> red highlight</li>
              <li>Use standard <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-800"># Title</code> & lists for clean separation.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
