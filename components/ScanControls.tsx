"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScanControls({
  scanId,
  initialTitle,
  initialIsStarred,
}: {
  scanId: string;
  initialTitle: string | null;
  initialIsStarred: boolean;
}) {
  const [title, setTitle] = useState(initialTitle || "");
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleUpdate = async (newTitle?: string, newIsStarred?: boolean) => {
    try {
      const res = await fetch(`/api/scans/${scanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle !== undefined ? newTitle : title,
          isStarred: newIsStarred !== undefined ? newIsStarred : isStarred,
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update scan");
    }
  };

  const toggleStar = () => {
    const newState = !isStarred;
    setIsStarred(newState);
    handleUpdate(undefined, newState);
  };

  const saveTitle = () => {
    setIsEditing(false);
    if (title !== initialTitle) {
      handleUpdate(title, undefined);
    }
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <button
        onClick={toggleStar}
        className={`text-2xl leading-none ${isStarred ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"} transition-colors`}
        title={isStarred ? "Unpin" : "Pin to top"}
      >
        ★
      </button>
      
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white px-2 py-1 rounded text-sm w-64 focus:outline-none focus:border-blue-500"
            placeholder="Name this snippet..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            onBlur={saveTitle}
          />
        </div>
      ) : (
        <h2 
          onClick={() => setIsEditing(true)} 
          className="text-xl font-bold text-gray-200 cursor-pointer hover:text-white flex items-center gap-2 group"
          title="Click to rename"
        >
          {title || "Untitled Snippet"} 
          <span className="text-gray-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
        </h2>
      )}
    </div>
  );
}