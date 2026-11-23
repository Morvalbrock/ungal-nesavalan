import React from "react";

interface MarkdownContentProps {
  content?: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) return null;

  // Split into paragraphs/blocks by double newlines or multiple newlines
  const blocks = content.split(/\r?\n\r?\n+/);

  return (
    <div className="space-y-5 text-slate-800">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Markdown Headings
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={index} className="mt-6 text-xl sm:text-2xl font-bold font-heritage text-brand-plum">
              {renderInline(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={index} className="mt-8 text-2xl sm:text-3xl font-bold font-heritage text-brand-plum border-b border-purple-100 pb-2">
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={index} className="mt-8 text-3xl sm:text-4xl font-bold font-heritage text-brand-plum">
              {renderInline(trimmed.slice(2))}
            </h1>
          );
        }

        // Horizontal Rule
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
          return <hr key={index} className="my-8 border-t border-purple-200" />;
        }

        // Blockquotes
        if (trimmed.startsWith("> ")) {
          const quoteLines = trimmed
            .split(/\r?\n/)
            .map((l) => l.replace(/^>\s*/, ""))
            .join(" ");
          return (
            <blockquote
              key={index}
              className="my-6 border-l-4 border-amber-500 bg-purple-50/60 pl-4 py-3 italic text-purple-950 rounded-r-xl"
            >
              {renderInline(quoteLines)}
            </blockquote>
          );
        }

        // Check if single short line that acts as a natural section header
        const lines = trimmed.split(/\r?\n/);
        if (
          lines.length === 1 &&
          trimmed.length <= 60 &&
          !/[.!?]$/.test(trimmed) &&
          (trimmed.startsWith("Welcome ") ||
            trimmed.startsWith("Our ") ||
            trimmed.startsWith("More Than ") ||
            trimmed.includes(" – ") ||
            trimmed.includes(" - "))
        ) {
          return (
            <h2 key={index} className="mt-8 pt-2 text-2xl sm:text-3xl font-bold font-heritage text-brand-plum">
              {renderInline(trimmed)}
            </h2>
          );
        }

        // Unordered lists (lines starting with - or *)
        const isList = lines.every((line) => /^[-*]\s+/.test(line.trim()));
        if (isList) {
          return (
            <ul key={index} className="my-4 list-disc space-y-2 pl-6 text-slate-700 leading-relaxed marker:text-amber-500">
              {lines.map((line, liIdx) => (
                <li key={liIdx}>{renderInline(line.trim().replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        // Ordered lists (lines starting with 1. 2. etc.)
        const isOrderedList = lines.every((line) => /^\d+\.\s+/.test(line.trim()));
        if (isOrderedList) {
          return (
            <ol key={index} className="my-4 list-decimal space-y-2 pl-6 text-slate-700 leading-relaxed marker:text-brand-purple font-medium">
              {lines.map((line, liIdx) => (
                <li key={liIdx}>{renderInline(line.trim().replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        // Standard Paragraphs
        return (
          <p key={index} className="text-[16px] sm:text-[17px] leading-[1.8] text-slate-700">
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {renderInline(line)}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// Parses inline markdown: bold (**text**), italic (*text*), links ([text](url)), code (`code`)
function renderInline(text: string): React.ReactNode {
  // Regex to match markdown links: [text](url), bold: **bold**, italic: *italic*, code: `code`
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Link: [label](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const isExternal = linkMatch[2].startsWith("http");
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-brand-purple underline decoration-amber-500/60 hover:text-brand-plum font-medium transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-purple-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={i} className="italic text-purple-900">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline code: `text`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={i} className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-mono text-purple-900">
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}
