/**
 * Comprehensive text formatting utilities
 * Handles RTL, line breaks, sanitization, and professional text presentation
 */

/**
 * Normalize whitespace and line breaks
 * Removes excessive spaces while preserving intentional formatting
 */
export const normalizeWhitespace = (text: string): string => {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n") // Handle old Mac line endings
    .replace(/[ \t]+/g, " ") // Multiple spaces/tabs to single space
    .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive line breaks
    .replace(/^\s+|\s+$/g, "") // Trim start/end
    .replace(/\n /g, "\n") // Remove spaces after line breaks
    .replace(/ \n/g, "\n"); // Remove spaces before line breaks
};

/**
 * Format text for display with proper line breaks
 * Preserves paragraph structure while cleaning excessive breaks
 */
export const formatForDisplay = (text: string): string => {
  if (!text) return "";

  return normalizeWhitespace(text)
    .split("\n")
    .filter((line) => line.trim().length > 0) // Remove empty lines
    .join("\n");
};

/**
 * Format text for HTML display
 * Converts line breaks to <br> tags safely
 */
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

/**
 * Truncate text intelligently
 * Breaks at word boundaries and adds ellipsis
 */
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

  // Break at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const result = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return addEllipsis ? `${result}...` : result;
};

/**
 * Remove all HTML tags from text
 * Useful for extracting plain text from rich content
 */
export const stripHTML = (html: string): string => {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, "") // Remove tags
    .replace(/&nbsp;/g, " ") // Convert &nbsp; to space
    .replace(/&amp;/g, "&") // Decode entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
};

/**
 * Count words in text (supports Arabic and English)
 */
export const countWords = (text: string): number => {
  if (!text) return 0;

  const cleaned = stripHTML(text).trim();
  if (!cleaned) return 0;

  // Split by spaces and filter empty strings
  return cleaned.split(/\s+/).filter((word) => word.length > 0).length;
};

/**
 * Estimate reading time in minutes
 * Average: 200 words per minute for English, 180 for Arabic
 */
export const estimateReadingTime = (
  text: string,
  lang: "ar" | "en" = "ar",
): number => {
  const wordCount = countWords(text);
  const wordsPerMinute = lang === "ar" ? 180 : 200;

  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
};

/**
 * Capitalize first letter of each word
 * Works with Arabic and English
 */
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

/**
 * Format text as paragraphs for better readability
 * Wraps text blocks in paragraph tags
 */
export const formatParagraphs = (text: string): string => {
  if (!text) return "";

  return normalizeWhitespace(text)
    .split("\n")
    .filter((para) => para.trim().length > 0)
    .map((para) => `<p>${para.trim()}</p>`)
    .join("");
};

/**
 * Highlight search terms in text
 * Returns HTML with highlighted matches
 */
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

/**
 * Extract preview text from longer content
 * Intelligently selects first meaningful sentences
 */
export const extractPreview = (
  text: string,
  maxLength: number = 150,
  sentences: number = 2,
): string => {
  if (!text) return "";

  const cleaned = normalizeWhitespace(stripHTML(text));

  // Try to get complete sentences
  const sentenceEndings = /[.!?؟]/g;
  const matches = [...cleaned.matchAll(sentenceEndings)];

  if (matches.length >= sentences) {
    const preview = cleaned.slice(0, matches[sentences - 1].index! + 1);
    if (preview.length <= maxLength) return preview.trim();
  }

  // Fallback to truncate
  return truncate(cleaned, maxLength);
};

/**
 * Check if text contains Arabic characters
 */
export const hasArabic = (text: string): boolean => {
  return /[\u0600-\u06FF]/.test(text);
};

/**
 * Check if text contains English characters
 */
export const hasEnglish = (text: string): boolean => {
  return /[a-zA-Z]/.test(text);
};

/**
 * Detect primary language direction
 */
export const detectDirection = (text: string): "rtl" | "ltr" => {
  if (!text) return "rtl"; // Default for Arabic app

  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;

  return arabicChars > englishChars ? "rtl" : "ltr";
};

/**
 * Format phone number for display
 * Handles Jordanian format: 07XXXXXXXX
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");

  // Jordanian format: 07X XXX XXXX
  if (cleaned.startsWith("07") && cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  // International format: +962 7X XXX XXXX
  if (cleaned.startsWith("9627") && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
};

/**
 * Format date relative to now (Arabic)
 * Returns "منذ 5 دقائق", "منذ ساعتين", etc.
 */
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

  return past.toLocaleDateString("ar-JO");
};

/**
 * Clean user input text
 * Removes dangerous characters while preserving Arabic/English/numbers
 */
export const cleanUserInput = (text: string): string => {
  if (!text) return "";

  return text
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
};

/**
 * Format list items with bullets
 */
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
