import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl text-purple-200 mb-8">Page Not Found</h2>
        <Link href="/" className="text-purple-400 hover:text-purple-300 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
} 