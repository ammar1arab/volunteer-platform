export const normalizeWhitespace = (text: string): string => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n");
};

export const formatForDisplay = (text: string): string => {
  if (!text) return "";
  return normalizeWhitespace(text);
};

export const formatForHTML = (text: string): string => {
  if (!text) return "";

  return normalizeWhitespace(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
};

import { formatDate } from "./date";

export const truncate = (
  text: string,
  maxLength: number,
  options: { addEllipsis?: boolean; breakWord?: boolean } = {},
): string => {
  const { addEllipsis = true, breakWord = false } = options;

  if (!text || text.length <= maxLength) return text;

  if (breakWord) {
    const truncated = text.slice(0, maxLength);
    return addEllipsis ? `${truncated}...` : truncated;
  }

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const result = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return addEllipsis ? `${result}...` : result;
};

export const stripHTML = (html: string): string => {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
};

export const countWords = (text: string): number => {
  if (!text) return 0;

  const cleaned = stripHTML(text).trim();
  if (!cleaned) return 0;

  return cleaned.split(/\s+/).filter((word) => word.length > 0).length;
};

export const estimateReadingTime = (
  text: string,
  lang: "ar" | "en" = "ar",
): number => {
  const wordCount = countWords(text);
  const wordsPerMinute = lang === "ar" ? 180 : 200;

  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);
};

export const titleCase = (text: string): string => {
  if (!text) return "";

  return text
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

export const formatParagraphs = (text: string): string => {
  if (!text) return "";

  return normalizeWhitespace(text)
    .split("\n")
    .filter((para) => para.trim().length > 0)
    .map((para) => `<p>${para.trim()}</p>`)
    .join("");
};

export const highlightText = (
  text: string,
  searchTerm: string,
  className: string = "highlight",
): string => {
  if (!text || !searchTerm) return text;

  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return text.replace(regex, `<span class="${className}">$1</span>`);
};

export const extractPreview = (
  text: string,
  maxLength: number = 150,
  sentences: number = 2,
): string => {
  if (!text) return "";

  const cleaned = normalizeWhitespace(stripHTML(text));

  const sentenceEndings = /[.!?؟]/g;
  const matches = [...cleaned.matchAll(sentenceEndings)];

  if (matches.length >= sentences) {
    const preview = cleaned.slice(0, matches[sentences - 1].index! + 1);
    if (preview.length <= maxLength) return preview.trim();
  }

  return truncate(cleaned, maxLength);
};

export const hasArabic = (text: string): boolean => {
  return /[\u0600-\u06FF]/.test(text);
};

export const hasEnglish = (text: string): boolean => {
  return /[a-zA-Z]/.test(text);
};

export const detectDirection = (text: string): "rtl" | "ltr" => {
  if (!text) return "rtl";

  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;

  return arabicChars > englishChars ? "rtl" : "ltr";
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("07") && cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  if (cleaned.startsWith("9627") && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60)
    return `منذ ${diffMins} ${diffMins === 1 ? "دقيقة" : "دقائق"}`;
  if (diffHours < 24)
    return `منذ ${diffHours} ${diffHours === 1 ? "ساعة" : diffHours === 2 ? "ساعتين" : "ساعات"}`;
  if (diffDays < 30)
    return `منذ ${diffDays} ${diffDays === 1 ? "يوم" : diffDays === 2 ? "يومين" : "أيام"}`;

  return formatDate(past);
};

export const cleanUserInput = (text: string): string => {
  if (!text) return "";

  return text
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
};

export const formatList = (
  items: string[],
  ordered: boolean = false,
): string => {
  if (!items || items.length === 0) return "";

  return items
    .filter((item) => item.trim())
    .map((item, index) => {
      const prefix = ordered ? `${index + 1}.` : "•";
      return `${prefix} ${item.trim()}`;
    })
    .join("\n");
};