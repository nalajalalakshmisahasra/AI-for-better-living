import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let inList = false;
  let listItems: string[] = [];

  const parseInlineStyles = (text: string): React.ReactNode[] => {
    // Basic bold **text** parsing
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-zinc-900 dark:text-white">{part}</strong>;
      }
      return part;
    });
  };

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-3 space-y-1 text-sm text-zinc-600">
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInlineStyles(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: number) => {
    if (tableRows.length > 0 || tableHeaders.length > 0) {
      elements.push(
        <div key={`table-wrapper-${key}`} className="overflow-x-auto my-4 rounded-lg border border-zinc-200">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-zinc-600">
            {tableHeaders.length > 0 && (
              <thead className="bg-zinc-50 text-zinc-700 font-medium">
                <tr>
                  {tableHeaders.map((header, idx) => (
                    <th key={idx} className="px-4 py-2 border-b border-zinc-200">{header}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-zinc-100 bg-white">
              {tableRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-zinc-50">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2">{parseInlineStyles(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for tables
    if (line.startsWith("|")) {
      flushList(i);
      inTable = true;
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

      // Skip delimiter lines (e.g., |---|---|)
      if (line.includes("---") || line.includes("-:-")) {
        continue;
      }

      if (tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Check for bullet lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      listItems.push(line.substring(2));
      continue;
    } else if (inList && !line.startsWith("- ") && !line.startsWith("* ")) {
      flushList(i);
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-semibold text-zinc-900 mt-4 mb-2">
          {parseInlineStyles(line.substring(4))}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-zinc-900 mt-5 mb-2 border-b border-zinc-100 pb-1">
          {parseInlineStyles(line.substring(3))}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="text-lg font-bold text-zinc-900 mt-6 mb-3">
          {parseInlineStyles(line.substring(2))}
        </h2>
      );
    } else if (line === "") {
      // Empty line, serves as a spacer or paragraph break
      elements.push(<div key={i} className="h-2" />);
    } else {
      // Regular Paragraph
      elements.push(
        <p key={i} className="text-sm text-zinc-600 leading-relaxed my-2">
          {parseInlineStyles(line)}
        </p>
      );
    }
  }

  // Flush any remaining states
  flushList(lines.length);
  flushTable(lines.length);

  return <div className="space-y-1">{elements}</div>;
}
