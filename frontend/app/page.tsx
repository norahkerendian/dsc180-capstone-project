import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-blue-600">Capstone - Gamified Learning Platform 🚀</h1>

        <Link
          href="/lessons"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Start learning
        </Link>
      </div>
    </div>
  );
}
