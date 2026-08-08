import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteScanButton from "@/components/DeleteScanButton";

export default async function Dashboard() {
  // 1. Verify user authentication
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // 2. Fetch the user's scan history from Supabase
  const scans = await prisma.scan.findMany({
    where: { userId },
    include: { report: true },
    orderBy: { createdAt: "desc" }, // Most recent first
  });

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      
      <header className="flex justify-between items-start mb-8 pb-8 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-bold mb-2">Scan History</h1>
          <p className="text-gray-400">Review your past code analysis reports.</p>
        </div>
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          New Scan
        </Link>
      </header>

      {scans.length === 0 ? (
        <p className="text-gray-400">You haven't run any code reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {scans.map((scan) => (
            <div key={scan.id} className="bg-gray-800 p-6 rounded border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {new Date(scan.createdAt).toLocaleString()}
                  </span>
                  <span className={`text-sm font-bold px-3 py-1 rounded border ${
                    (scan.report?.vulnerabilityCount ?? 0) > 0 
                      ? 'bg-red-900/50 border-red-900 text-red-200' 
                      : 'bg-green-900/50 border-green-900 text-green-200'
                  }`}>
                    Vulnerabilities: {scan.report?.vulnerabilityCount || 0}
                  </span>
                </div>
                
                {/* Insert the Delete Button here, passing the scan ID */}
                <DeleteScanButton scanId={scan.id} />
                
              </div>
              
              <div className="mb-2 text-sm text-gray-400">Original Code Snippet:</div>
              <div className="bg-gray-900 p-4 rounded overflow-x-auto border border-gray-700">
                <pre className="text-sm text-gray-300 font-mono">
                  {scan.originalCode.substring(0, 150)}
                  {scan.originalCode.length > 150 ? "...\n[Code truncated for preview]" : ""}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}