"use client";

import { useState } from "react";

export default function CodeSnippetViewer({ code }: { code: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const MAX_LENGTH = 300;
  const isLongCode = code.length > MAX_LENGTH;
  
  const displayCode = isExpanded || !isLongCode 
    ? code 
    : `${code.substring(0, MAX_LENGTH)}\n\n[Code truncated for preview]`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="bg-gray-900 rounded border border-gray-700 mb-6 relative group flex flex-col">
      {/* Copy Button (Appears on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-bold py-1 px-3 rounded border border-gray-500 transition-colors"
        >
          {isCopied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      {/* Code Display */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm text-gray-300 font-mono">
          {displayCode}
        </pre>
      </div>

      {/* Expand/Collapse Button */}
      {isLongCode && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-center text-xs font-bold text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 py-2 border-t border-gray-700 transition-colors rounded-b"
        >
          {isExpanded ? "Show Less" : "Show Full Code"}
        </button>
      )}
    </div>
  );
}