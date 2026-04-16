import { Clipboard, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { Cite } from "@citation-js/core";
import "@citation-js/plugin-csl";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-ris";

// Export format types for Word-compatible reference managers
export type ExportFormat = "bibtex" | "ris" | "endnote" | "apa" | "mla" | "chicago" | "csl-json";

export interface FormatOption {
  id: ExportFormat;
  title: string;
  description: string;
}

export const EXPORT_FORMATS: FormatOption[] = [
  { id: "bibtex", title: "BibTeX", description: "LaTeX/BibTeX format" },
  { id: "ris", title: "RIS", description: "Research Information Systems format" },
  { id: "endnote", title: "EndNote", description: "EndNote tagged format" },
  { id: "apa", title: "APA", description: "APA 7th edition citation" },
  { id: "mla", title: "MLA", description: "MLA 9th edition citation" },
  { id: "chicago", title: "Chicago", description: "Chicago 17th edition citation" },
  { id: "csl-json", title: "CSL-JSON", description: "Citation Style Language JSON" },
];

// Paper interface matching the API response
export interface Paper {
  id: string;
  citekey: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi: string;
  volume: string;
  issue: string;
  pages: string;
  isbn: string;
  paperType: string;
  cslItem: Record<string, unknown>;
}

// CSL-JSON type mapping
const typeMap: Record<string, string> = {
  article: "article-journal",
  book: "book",
  inproceedings: "paper-conference",
  thesis: "thesis",
  report: "report",
  misc: "document",
  webpage: "webpage",
  software: "software",
  dataset: "dataset",
  patent: "patent",
};

// Parse author string "First Last" into CSL name object
function parseAuthor(author: string): { given: string; family: string } {
  const parts = author.trim().split(/\s+/);
  if (parts.length === 1) {
    return { family: parts[0], given: "" };
  }
  const family = parts[parts.length - 1];
  const given = parts.slice(0, -1).join(" ");
  return { family, given };
}

// Convert Paper to CSL-JSON format
function paperToCSL(paper: Paper): Record<string, unknown> {
  // If the API already provides a CSL item, use it as base
  if (paper.cslItem && Object.keys(paper.cslItem).length > 0) {
    return {
      id: paper.id,
      ...paper.cslItem,
    };
  }

  // Otherwise, construct CSL-JSON from Paper fields
  const cslType = typeMap[paper.paperType?.toLowerCase()] || "document";

  const csl: Record<string, unknown> = {
    id: paper.citekey || paper.id,
    type: cslType,
    title: paper.title,
  };

  if (paper.authors && paper.authors.length > 0) {
    csl.author = paper.authors.map(parseAuthor);
  }

  if (paper.year) {
    csl.issued = { "date-parts": [[paper.year]] };
  }

  if (paper.journal) {
    csl["container-title"] = paper.journal;
  }

  if (paper.volume) {
    csl.volume = paper.volume;
  }

  if (paper.issue) {
    csl.issue = paper.issue;
  }

  if (paper.pages) {
    csl.page = paper.pages;
  }

  if (paper.doi) {
    csl.DOI = paper.doi;
  }

  if (paper.isbn) {
    csl.ISBN = paper.isbn;
  }

  return csl;
}

// CSL templates available in @citation-js/plugin-csl
const cslTemplates: Record<string, string> = {
  apa: "apa",
  mla: "modern-language-association",
  chicago: "chicago-author-date",
};

const richTextFormats: ExportFormat[] = ["apa", "mla", "chicago"];

interface ExportPreferences {
  clipboardFontFamily?: string;
  clipboardFontSize?: string;
}

// Main export function that formats paper based on selected format
export function formatPaper(paper: Paper, format: ExportFormat): string {
  const cslData = paperToCSL(paper);
  const cite = new Cite(cslData);

  switch (format) {
    case "bibtex":
      return cite.format("bibtex") as string;

    case "ris":
      return cite.format("ris") as string;

    case "endnote":
      // EndNote uses RIS format as base; we'll enhance it
      return formatEndNote(paper);

    case "csl-json":
      return JSON.stringify(cslData, null, 2);

    case "apa":
    case "mla":
    case "chicago":
      // HTML format preserves italics/bold and is compatible with Word
      // Word will interpret the HTML formatting when pasted
      return cite.format("bibliography", {
        format: "html",
        template: cslTemplates[format],
      }) as string;

    default:
      return cite.format("bibtex") as string;
  }
}

function buildClipboardContent(paper: Paper, format: ExportFormat): string | Clipboard.Content {
  if (!richTextFormats.includes(format)) {
    return formatPaper(paper, format);
  }

  const cslData = paperToCSL(paper);
  const cite = new Cite(cslData);
  const template = cslTemplates[format];
  const html = cite.format("bibliography", {
    format: "html",
    template,
  }) as string;

  return {
    html: wrapClipboardHtml(html),
    text: cite.format("bibliography", {
      format: "text",
      template,
    }) as string,
  };
}

function wrapClipboardHtml(html: string): string {
  const { fontFamily, fontSizePt } = getClipboardStylePreferences();
  return `<div style="font-family: ${buildFontStack(fontFamily)}; font-size: ${fontSizePt}pt; line-height: 1.35;">${html}</div>`;
}

function getClipboardStylePreferences(): { fontFamily: string; fontSizePt: number } {
  const preferences = getPreferenceValues<ExportPreferences>();

  return {
    fontFamily: sanitizeFontFamily(preferences.clipboardFontFamily),
    fontSizePt: sanitizeFontSize(preferences.clipboardFontSize),
  };
}

function sanitizeFontFamily(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Arial";
}

function buildFontStack(fontFamily: string): string {
  const primary = quoteFontFamily(fontFamily);
  const fallbacks = ['"Arial"', '"Helvetica Neue"', "Helvetica", "sans-serif"];
  const stack = [primary, ...fallbacks.filter((fallback) => fallback !== primary)];
  return stack.join(", ");
}

function quoteFontFamily(fontFamily: string): string {
  const escaped = fontFamily.replace(/["\\]/g, "\\$&");
  return `"${escaped}"`;
}

function sanitizeFontSize(value: string | undefined): number {
  const size = Number(value);
  if (Number.isFinite(size) && size > 0 && size <= 72) {
    return size;
  }
  return 10;
}

// EndNote format (custom implementation based on RIS spec)
function formatEndNote(paper: Paper): string {
  const typeMap: Record<string, string> = {
    article: "Journal Article",
    "article-journal": "Journal Article",
    book: "Book",
    inproceedings: "Conference Paper",
    "paper-conference": "Conference Paper",
    thesis: "Thesis",
    report: "Report",
    misc: "Generic",
    document: "Generic",
    webpage: "Electronic Article",
    software: "Computer Program",
  };

  const cslData = paperToCSL(paper);
  const paperType = (cslData.type as string) || paper.paperType || "misc";

  const lines: string[] = [];
  lines.push(`%0 ${typeMap[paperType.toLowerCase()] || "Generic"}`);
  lines.push(`%T ${paper.title}`);

  paper.authors?.forEach((author) => {
    lines.push(`%A ${author}`);
  });

  if (paper.year) lines.push(`%D ${paper.year}`);
  if (paper.journal) lines.push(`%J ${paper.journal}`);
  if (paper.volume) lines.push(`%V ${paper.volume}`);
  if (paper.issue) lines.push(`%N ${paper.issue}`);
  if (paper.pages) lines.push(`%P ${paper.pages}`);
  if (paper.doi) lines.push(`%R ${paper.doi}`);
  if (paper.isbn) lines.push(`%@ ${paper.isbn}`);

  return lines.join("\n");
}

// Copy formatted paper to clipboard
export async function copyFormattedPaper(paper: Paper, format: ExportFormat): Promise<void> {
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: `Copying ${EXPORT_FORMATS.find((f) => f.id === format)?.title}…`,
  });

  try {
    const content = buildClipboardContent(paper, format);
    await Clipboard.copy(content);
    toast.style = Toast.Style.Success;
    toast.title = `${EXPORT_FORMATS.find((f) => f.id === format)?.title} copied`;
  } catch (e) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed to copy";
    toast.message = e instanceof Error ? e.message : String(e);
  }
}

// Fetch paper and copy in selected format
export async function fetchAndCopyFormatted(baseUrl: string, paperId: string, format: ExportFormat): Promise<void> {
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: `Fetching paper…`,
  });

  try {
    const res = await fetch(`${baseUrl}/papers/${paperId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const paper: Paper = await res.json();

    const content = buildClipboardContent(paper, format);
    await Clipboard.copy(content);

    toast.style = Toast.Style.Success;
    toast.title = `${EXPORT_FORMATS.find((f) => f.id === format)?.title} copied`;
  } catch (e) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed to copy";
    toast.message = e instanceof Error ? e.message : String(e);
  }
}

// Get list of available CSL templates (for advanced users)
export function getAvailableTemplates(): string[] {
  // Common CSL templates available in the plugin
  return [
    "apa",
    "modern-language-association",
    "chicago-author-date",
    "chicago-note-bibliography",
    "ieee",
    "nature",
    "science",
    "vancouver",
    "harvard1",
  ];
}

// Format paper with any CSL template
export function formatPaperWithTemplate(paper: Paper, template: string): string {
  const cslData = paperToCSL(paper);
  const cite = new Cite(cslData);

  // HTML format preserves italics/bold and is compatible with Word
  // Word will interpret the HTML formatting when pasted
  return cite.format("bibliography", {
    format: "html",
    template,
  }) as string;
}
