import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  GraduationCap, BookOpen, Users, Compass, Award, Trophy, Sparkles, Calendar, Landmark, BookOpenCheck, Globe
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compressImage(base64Str: string, maxWidth = 1000, maxHeight = 1000): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith("data:")) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
      resolve(compressedDataUrl);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

// Automatically detect an appropriate Lucide icon component based on English or Urdu titles
export function getDynamicIcon(titleEn: string = "", titleUr: string = "") {
  const textEn = titleEn.toLowerCase();
  const textUr = titleUr || "";

  // Education / Degrees
  if (
    textEn.includes("education") || textEn.includes("degree") || textEn.includes("study") || 
    textEn.includes("academic") || textEn.includes("school") || textEn.includes("university") ||
    textUr.includes("تعلیم") || textUr.includes("جامعہ") || textUr.includes("تحصیل") || textUr.includes("سند") || textUr.includes("طالب")
  ) {
    return GraduationCap;
  }
  
  // Teachers / Scholars / Lineage
  if (
    textEn.includes("teacher") || textEn.includes("scholar") || textEn.includes("shaikh") || 
    textEn.includes("scholars") || textEn.includes("ustad") || textEn.includes("ustadh") ||
    textUr.includes("استاد") || textUr.includes("اساتذہ") || textUr.includes("مشائخ") || textUr.includes("شیوخ")
  ) {
    return Users;
  }

  // Books / Publications / Writing / Fatwa
  if (
    textEn.includes("book") || textEn.includes("publication") || textEn.includes("write") || 
    textEn.includes("author") || textEn.includes("translation") || textEn.includes("fatwa") ||
    textUr.includes("کتاب") || textUr.includes("کتب") || textUr.includes("تصنیف") || textUr.includes("تصانیف") || textUr.includes("فتوی") || textUr.includes("فتاوی")
  ) {
    return BookOpenCheck;
  }

  // Travels / Journeys / Visits
  if (
    textEn.includes("travel") || textEn.includes("journey") || textEn.includes("visit") || 
    textEn.includes("global") || textEn.includes("hijrah") ||
    textUr.includes("سفر") || textUr.includes("اسفار") || textUr.includes("دورہ") || textUr.includes("دورے")
  ) {
    return Globe;
  }

  // Awards / Recognitions / Honors
  if (
    textEn.includes("award") || textEn.includes("honor") || textEn.includes("achievement") || 
    textEn.includes("recognition") || textEn.includes("certificate") ||
    textUr.includes("اعزاز") || textUr.includes("شیلڈ") || textUr.includes("تمغہ")
  ) {
    return Trophy;
  }

  // Birth / Family / Early Life
  if (
    textEn.includes("birth") || textEn.includes("childhood") || textEn.includes("early") || 
    textEn.includes("born") || textEn.includes("family") || textEn.includes("parent") ||
    textUr.includes("پیدائش") || textUr.includes("خاندان") || textUr.includes("ابتدائی حالات")
  ) {
    return Calendar;
  }

  // Islamic services / Madrasah / Mosque / Career
  if (
    textEn.includes("madrasah") || textEn.includes("mosque") || textEn.includes("masjid") || 
    textEn.includes("service") || textEn.includes("career") || textEn.includes("organization") ||
    textUr.includes("مدرسہ") || textUr.includes("مسجد") || textUr.includes("خدمات") || textUr.includes("تنظیم")
  ) {
    return Landmark;
  }

  return BookOpen; // Default fallback icon
}

// A robust but lightweight markdown compiler to JSX
export function renderFormattedText(text: string, isUrdu: boolean = false, customColorClass?: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  
  let inList = false;
  let listItems: string[] = [];
  let isNumbered = false;

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = isNumbered ? "ol" : "ul";
      const key = `list-${elements.length}`;
      elements.push(
        React.createElement(
          ListTag,
          {
            key,
            className: `${isNumbered ? "list-decimal" : "list-disc"} ${isUrdu ? "mr-6 text-right leading-loose" : "ml-6 text-left leading-relaxed"} my-4 space-y-1.5 ${customColorClass || "text-gray-700"}`
          },
          listItems.map((item, idx) => {
            const parsedItem = parseInlines(item, isUrdu);
            return React.createElement(
              "li",
              { key: `li-${idx}`, className: isUrdu ? "font-urdu pr-1" : "pl-1" },
              parsedItem
            );
          })
        )
      );
      listItems = [];
      inList = false;
    }
  };

  // Inline styling parser for Bold, Italic, Underline and Custom BBCode-style local typography tags
  const parseInlines = (str: string, isUr: boolean): React.ReactNode[] => {
    return renderFormattedTitle(str, isUr);
  };

  for (let i = 0; i < lines.length; i++) {
    const origLine = lines[i];
    const line = origLine.trim();

    // Check header
    if (line.startsWith("# ")) {
      flushList();
      const content = line.substring(2);
      elements.push(
        React.createElement(
          "h1",
          {
            key: `h1-${i}`,
            className: `${isUrdu ? "font-urdu text-3xl text-right leading-loose" : "text-2xl font-bold text-gray-900"} mt-6 mb-3 border-b border-gray-100 pb-2`
          },
          parseInlines(content, isUrdu)
        )
      );
    } else if (line.startsWith("## ")) {
      flushList();
      const content = line.substring(3);
      elements.push(
        React.createElement(
          "h2",
          {
            key: `h2-${i}`,
            className: `${isUrdu ? "font-urdu text-2xl text-right leading-relaxed" : "text-xl font-semibold text-gray-800"} mt-5 mb-2`
          },
          parseInlines(content, isUrdu)
        )
      );
    } else if (line.startsWith("### ")) {
      flushList();
      const content = line.substring(4);
      elements.push(
        React.createElement(
          "h3",
          {
            key: `h3-${i}`,
            className: `${isUrdu ? "font-urdu text-xl text-right leading-normal" : "text-lg font-semibold text-gray-800"} mt-4 mb-2`
          },
          parseInlines(content, isUrdu)
        )
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      // List item
      const content = line.substring(2);
      if (inList && isNumbered) {
        flushList();
      }
      inList = true;
      isNumbered = false;
      listItems.push(content);
    } else if (/^\d+\.\s/.test(line)) {
      // Numbered list item like "1. Item"
      const match = line.match(/^\d+\.\s(.*)/);
      const content = match ? match[1] : line;
      if (inList && !isNumbered) {
        flushList();
      }
      inList = true;
      isNumbered = true;
      listItems.push(content);
    } else if (line === "") {
      // Empty line
      flushList();
      // Only adding a small vertical space between structural components
      elements.push(React.createElement("div", { key: `emp-${i}`, className: "h-3" }));
    } else {
      // Normal paragraph
      flushList();
      elements.push(
        React.createElement(
          "p",
          {
            key: `p-${i}`,
            className: `${isUrdu ? "font-urdu text-xl text-right leading-loose mb-4" : "text-base leading-relaxed mb-4"} ${customColorClass || (isUrdu ? "" : "text-gray-700")}`
          },
          parseInlines(origLine, isUrdu)
        )
      );
    }
  }

  flushList();

  return React.createElement("div", { className: "space-y-1" }, elements);
}

// Helper to parse URLs in raw text and replace them with clickable HTML anchor tags
function parseLinksInText(text: string, noLinks: boolean = false): React.ReactNode[] {
  if (!text) return [];
  // Regular expression to match URLs (starting with http/https or www.)
  const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/gi;
  const parts = text.split(urlRegex);
  if (parts.length === 1) return [text];

  const result: React.ReactNode[] = [];
  
  parts.forEach((part, index) => {
    if (urlRegex.test(part)) {
      let href = part;
      if (href.toLowerCase().startsWith("www.")) {
        href = "https://" + href;
      }

      let cleanHref = href;
      let cleanText = part;
      // If the link ends with a period, comma, colon, semicolon or closing parenthesis, we clean it up
      const trailingPunctuation = /[.,;:)]+$/;
      const match = part.match(trailingPunctuation);
      let rest = "";
      if (match) {
        const punc = match[0];
        if (punc !== ")" || (!part.includes("(") && part.endsWith(")")) ) {
          cleanHref = href.slice(0, -punc.length);
          cleanText = part.slice(0, -punc.length);
          rest = punc;
        }
      }

      if (noLinks) {
        result.push(
          React.createElement(
            "span",
            { key: `link-wrapper-${index}`, className: "text-emerald-750 font-medium" },
            cleanText
          ),
          rest
        );
      } else {
        result.push(
          React.createElement(
            "span",
            { key: `link-wrapper-${index}` },
            React.createElement(
              "a",
              {
                href: cleanHref,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-emerald-750 hover:text-emerald-850 hover:underline font-medium hover:font-semibold transition-all break-all cursor-pointer"
              },
              cleanText
            ),
            rest
          )
        );
      }
    } else {
      result.push(part);
    }
  });

  return result;
}

// Inline styling parser for titles and headers that supports bold, italic, custom fonts, sizes, colors, and automatically closes standard BBCode tags
export function renderFormattedTitle(str: string, isUr: boolean = false, noLinks: boolean = false): React.ReactNode[] {
  if (!str) return [];

  // Split by newline and take first line to prevent description or secondary lines inside titles/headings
  const cleanStr = str.split(/[\r\n]+/)[0].trim();

  // Helper to close any unclosed BBCode tags automatically at the end of the string
  const autoCloseTags = (text: string): string => {
    const tags = ["font-urdu", "font-english", "font-arabic", "bold", "italic", "underline", "size-lg", "size-xl", "size-2xl", "color-primary", "color-red", "color-green"];
    let processed = text;
    const openTagsStack: string[] = [];
    
    // Find all tags (both opening and closing) in sequence
    const regex = /\[(\/?)(font-urdu|font-english|font-arabic|bold|italic|underline|size-lg|size-xl|size-2xl|color-primary|color-red|color-green)\]/g;
    let match;
    while ((match = regex.exec(processed)) !== null) {
      const isClosing = match[1] === "/";
      const tagType = match[2];
      if (!isClosing) {
        openTagsStack.push(tagType);
      } else {
        const lastIdx = openTagsStack.lastIndexOf(tagType);
        if (lastIdx !== -1) {
          openTagsStack.splice(lastIdx, 1);
        }
      }
    }
    
    while (openTagsStack.length > 0) {
      const tag = openTagsStack.pop();
      processed += `[/${tag}]`;
    }
    
    return processed;
  };

  // Preprocess standard formats and convert self-closing tag typos like [font-arabic/] to proper closed formats
  let formatted = cleanStr;
  formatted = formatted.replace(/\[(font-urdu|font-english|font-arabic|bold|italic|underline|size-lg|size-xl|size-2xl|color-primary|color-red|color-green)\/\]/g, "[/$1]");
  
  formatted = formatted.replace(/\*\*([^*]+?)\*\*/g, "[bold]$1[/bold]");
  formatted = formatted.replace(/__([^_]+?)__/g, "[underline]$1[/underline]");
  formatted = formatted.replace(/\*([^*]+?)\*/g, "[italic]$1[/italic]");

  // Auto-close open tags
  formatted = autoCloseTags(formatted);

  // Advanced recursive BBCode parser that maps layout elements safely to React nodes
  const parseBBCode = (text: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    const tagRegex = /\[(font-urdu|font-english|font-arabic|bold|italic|underline|size-lg|size-xl|size-2xl|color-primary|color-red|color-green)\]/g;
    
    let match;
    let lastIndex = 0;
    
    while ((match = tagRegex.exec(text)) !== null) {
      const tag = match[1];
      const startTag = `[${tag}]`;
      const endTag = `[/${tag}]`;
      
      const startTagIndex = match.index;
      const endTagIndex = text.indexOf(endTag, startTagIndex + startTag.length);
      
      if (endTagIndex !== -1) {
        // Add preceding raw text with parsed links
        if (startTagIndex > lastIndex) {
          result.push(...parseLinksInText(text.substring(lastIndex, startTagIndex), noLinks));
        }
        
        // Parse nested inner tags recursively so you can combine styling (e.g. bold AND urdu font!)
        const innerContent = text.substring(startTagIndex + startTag.length, endTagIndex);
        const childNodes = parseBBCode(innerContent);
        
        // Style assignments
        let className = "";
        let component = "span";
        
        switch (tag) {
          case "font-urdu":
            className = "font-urdu";
            break;
          case "font-english":
            className = "font-sans";
            break;
          case "font-arabic":
            className = "font-arabic font-semibold";
            break;
          case "bold":
            className = "font-bold text-gray-950";
            component = "strong";
            break;
          case "italic":
            className = "italic text-gray-805";
            component = "em";
            break;
          case "underline":
            className = "underline decoration-primary-550/40 underline-offset-4";
            break;
          case "size-lg":
            className = "text-lg md:text-xl";
            break;
          case "size-xl":
            className = "text-xl md:text-2xl";
            break;
          case "size-2xl":
            className = "text-2xl md:text-3xl leading-relaxed";
            break;
          case "color-primary":
            className = "text-primary-750 font-semibold";
            break;
          case "color-red":
            className = "text-rose-650 font-semibold";
            break;
          case "color-green":
            className = "text-emerald-750 font-semibold";
            break;
        }
        
        result.push(
          React.createElement(
            component,
            { key: `${tag}-${startTagIndex}`, className },
            childNodes
          )
        );
        
        lastIndex = endTagIndex + endTag.length;
        tagRegex.lastIndex = lastIndex; // Fast-forward regex scan
      }
    }
    
    // Add trailing text with parsed links
    if (lastIndex < text.length) {
      result.push(...parseLinksInText(text.substring(lastIndex), noLinks));
    }
    
    return result;
  };

  return parseBBCode(formatted);
}

// Deterministic view count calculation for videos to display Mufti Munir Shakir's lecture popularity
export function getVideoViews(video: any): number {
  if (!video) return 0;
  if (typeof video.views === "number" && video.views > 0) return video.views;

  const fallbackKey = `video_views_${video.id}`;
  const localCount = localStorage.getItem(fallbackKey);
  if (localCount) return parseInt(localCount, 10);

  let seed = 250;
  if (video.id) {
    const charSum = video.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    seed = 150 + (charSum % 700);
  }
  return seed;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)?([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.+&v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/attribution_link\?.+v%3D([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  const match11 = url.match(/([a-zA-Z0-9_-]{11})/);
  if (match11 && match11[1]) {
    if (url.toLowerCase().includes("youtu")) {
      return match11[1];
    }
  }

  return null;
}

export function getVideoThumbnail(video: any): string {
  if (video?.thumbnail) return video.thumbnail;
  if (video?.video_url) {
    const id = extractYouTubeId(video.video_url);
    if (id) {
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  }
  return "https://images.unsplash.com/photo-1601314002592-b8734b139c43?auto=format&fit=crop&q=80&w=1000";
}


