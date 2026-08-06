import CodeSubmitForm from "@/components/CodeSubmitForm";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      
      {/* Header Section with Auth */}
      <header className="flex justify-between items-start mb-8 pb-8 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-bold mb-2">Automated Code Review</h1>
          <p className="text-gray-400">Paste your code below to analyze for vulnerabilities and clean code practices.</p>
        </div>
        
        {/* Clerk Authentication UI */}
        <div className="ml-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded border border-gray-600 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
          </Show>
        </div>
      </header>
      
      <CodeSubmitForm />
      
    </main>
  );
}