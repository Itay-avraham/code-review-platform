import CodeSubmitForm from "@/components/CodeSubmitForm";

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Automated Code Review</h1>
      <p className="text-gray-400 mb-8">Paste your code below to analyze for vulnerabilities and clean code practices.</p>
      
      <CodeSubmitForm />
      
    </main>
  );
}