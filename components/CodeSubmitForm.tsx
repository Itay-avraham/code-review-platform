"use client";

import { useState } from "react";

export default function CodeSubmitForm() {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // We will add the API call to the AI here in the next step
    console.log("Submitting code:", code);
    
    setTimeout(() => setIsSubmitting(false), 1000); // Temporary fake loading
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code snippet here..."
        className="w-full h-64 p-4 bg-gray-900 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none font-mono"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting || !code.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isSubmitting ? "Analyzing..." : "Analyze Code"}
      </button>
    </form>
  );
}