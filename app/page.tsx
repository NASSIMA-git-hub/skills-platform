import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          SkillsHub
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          AI-Powered Skill & Career Intelligence Platform
        </p>
        
        <div className="flex gap-4 justify-center mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-lg mb-2">AI Evaluation</h3>
            <p className="text-gray-500 text-sm">Get AI-powered project evaluation</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-lg mb-2">Skill Ranking</h3>
            <p className="text-gray-500 text-sm">Compete with other developers</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-lg mb-2">Job Matching</h3>
            <p className="text-gray-500 text-sm">Find your dream job</p>
          </div>
        </div>

        <div className="space-x-4">
          <Link 
            href="http://localhost:5173"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Open Frontend App
          </Link>
          <a 
            href="/api/health"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            API Health Check
          </a>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>API Endpoints:</p>
          <div className="flex gap-4 justify-center mt-2">
            <code className="bg-gray-100 px-2 py-1 rounded">/api/users</code>
            <code className="bg-gray-100 px-2 py-1 rounded">/api/skills</code>
            <code className="bg-gray-100 px-2 py-1 rounded">/api/projects</code>
            <code className="bg-gray-100 px-2 py-1 rounded">/api/jobs</code>
          </div>
        </div>
      </main>
    </div>
  );
}
