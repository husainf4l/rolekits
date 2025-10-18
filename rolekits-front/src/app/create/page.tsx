import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-semibold text-gray-900" style={{ letterSpacing: '-0.015em' }}>
              Rolekits
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/signin">Sign out</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6" style={{ letterSpacing: '-0.015em' }}>
            Welcome to Rolekits
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Your CV builder dashboard - Coming soon
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12">
            <p className="text-gray-600">
              CV builder interface will be implemented here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
