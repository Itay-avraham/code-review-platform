import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteScanButton from "@/components/DeleteScanButton";
import ScanControls from "@/components/ScanControls";
import CodeSnippetViewer from "@/components/CodeSnippetViewer";
import LocalTime from "@/components/LocalTime";

type AnalysisData = {
  vulnerabilities?: { issue: string; severity: string; description: string }[];
  quality?: { issue: string; suggestion: string }[];
};

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const scans = await prisma.scan.findMany({
    where: { userId },
    include: { report: true },
    orderBy: { createdAt: "desc" },
  });

  const pinnedScans = scans.filter((scan: any) => scan.isStarred);
  const recentScans = scans.filter((scan: any) => !scan.isStarred);

  // Helper function to render cards so we don't duplicate code
  const renderScans = (scanList: typeof scans) => (
    <div className="flex flex-col gap-8">
      {scanList.map((scan: any) => {
        const analysis = scan.report?.analysisData as AnalysisData | null;

        return (
          <div key={scan.id} id={`report-${scan.id}`} className="bg-gray-800 p-6 rounded border border-gray-700">
            
            {/* NEW: Title and Star Controls */}
            <ScanControls 
              scanId={scan.id} 
              initialTitle={scan.title} 
              initialIsStarred={scan.isStarred} 
            />

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <LocalTime date={scan.createdAt} />
                <span className={`text-sm font-bold px-3 py-1 rounded border ${
                  (scan.report?.vulnerabilityCount ?? 0) > 0 
                    ? 'bg-red-900/50 border-red-900 text-red-200' 
                    : 'bg-green-900/50 border-green-900 text-green-200'
                }`}>
                  Vulnerabilities: {scan.report?.vulnerabilityCount || 0}
                </span>
              </div>
              
              <div className="flex gap-2">
                <DeleteScanButton scanId={scan.id} />
              </div>
            </div>
            
            <div className="mb-2 text-sm font-bold text-gray-300">Original Code Snippet:</div>
            <CodeSnippetViewer code={scan.originalCode} />

            {analysis && (
              <div className="flex flex-col gap-6 border-t border-gray-700 pt-6">
                <div>
                  <h3 className="text-lg font-bold text-red-400 mb-3">Security Vulnerabilities</h3>
                  {analysis.vulnerabilities && analysis.vulnerabilities.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {analysis.vulnerabilities.map((vuln, idx) => (
                        <div key={idx} className="bg-gray-900 p-4 rounded border border-gray-700">
                          <h4 className="font-bold text-gray-200 mb-1 flex items-center gap-2">
                            {vuln.issue} 
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                              {vuln.severity}
                            </span>
                          </h4>
                          <p className="text-sm text-gray-400">{vuln.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No vulnerabilities found.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-green-400 mb-3">Code Quality Suggestions</h3>
                  {analysis.quality && analysis.quality.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {analysis.quality.map((qual, idx) => (
                        <div key={idx} className="bg-gray-900 p-4 rounded border border-gray-700">
                          <h4 className="font-bold text-gray-200 mb-1">{qual.issue}</h4>
                          <p className="text-sm text-gray-400">{qual.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No suggestions available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-start mb-8 pb-8 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-bold mb-2">Scan History</h1>
          <p className="text-gray-400">Review your past code analysis reports.</p>
        </div>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
          New Scan
        </Link>
      </header>

      {scans.length === 0 ? (
        <p className="text-gray-400">You haven't run any code reviews yet.</p>
      ) : (
        <>
          {pinnedScans.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                ★ Pinned Snippets
              </h2>
              {renderScans(pinnedScans)}
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-gray-200 mb-4">
              {pinnedScans.length > 0 ? "Recent Snippets" : "All Snippets"}
            </h2>
            {renderScans(recentScans)}
          </div>
        </>
      )}
    </main>
  );
}