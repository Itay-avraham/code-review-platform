"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function CodeSubmitForm() {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // 1. Introduce the error state
  const [error, setError] = useState<string | null>(null); 
  
  const { isSignedIn } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) return; 

    setIsSubmitting(true);
    setResult(null);
    
    // 2. Reset the error state on new submissions
    setError(null); 
    
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeSnippet: code }),
      });

      // 3. Catch non-200 HTTP responses before attempting to parse JSON
      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Error submitting code:", err);
      // 4. Update the error state with a message for the UI
      setError(err.message || "An unexpected error occurred while analyzing the code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code snippet here..."
          className="w-full h-64 p-4 bg-gray-900 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none font-mono"
          required
          maxLength={8000} 
        />
        
        {/* 5. Conditionally render the error message */}
        {error && (
          <div className="bg-red-900/50 border border-red-900 text-red-200 px-4 py-3 rounded text-sm font-semibold">
            {error}
          </div>
        )}
        
        {isSignedIn ? (
          <button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Analyzing..." : "Analyze Code"}
          </button>
        ) : (
          <SignInButton mode="modal">
            <button
              type="button" 
              disabled={!code.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Sign in to Analyze
            </button>
          </SignInButton>
        )}
      </form>

      {result && result.data && (
        <div className="flex flex-col gap-6">
          
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-red-400">Security Vulnerabilities</h3>
            {result.data.vulnerabilities?.length === 0 ? (
              <p className="text-gray-400">No vulnerabilities found.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {result.data.vulnerabilities?.map((vuln: any, index: number) => (
                  <li key={index} className="bg-gray-900 p-4 rounded border border-red-900/50">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-white">{vuln.issue}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        vuln.severity === 'High' ? 'bg-red-900 text-red-200' :
                        vuln.severity === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-blue-900 text-blue-200'
                      }`}>
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{vuln.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-green-400">Code Quality Suggestions</h3>
            {result.data.quality?.length === 0 ? (
              <p className="text-gray-400">No suggestions.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {result.data.quality?.map((item: any, index: number) => (
                  <li key={index} className="bg-gray-900 p-4 rounded border border-green-900/50">
                    <p className="font-bold text-white mb-1">{item.issue}</p>
                    <p className="text-gray-400 text-sm">{item.suggestion}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}