"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteScanButton({ scanId }: { scanId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this scan history?")) return;
    
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/scans/${scanId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Refresh the current route to fetch updated data from the server
        router.refresh();
      } else {
        console.error("Failed to delete scan");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting scan:", error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-900/40 hover:bg-red-800 text-red-200 text-xs font-bold py-1 px-3 rounded border border-red-900 transition-colors disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}