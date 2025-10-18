import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileLines, 
  faBolt, 
  faLock, 
  faCircleCheck,
  faChevronRight,
  faCirclePlay
} from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-semibold text-gray-900" style={{ letterSpacing: '-0.015em' }}>Rolekits</Link>
              <div className="hidden md:flex space-x-8">
                <Link href="/templates" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Templates</Link>
                <Link href="/examples" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Examples</Link>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signin" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign in</Link>
              <Button asChild size="sm" className="bg-blue-600 text-white rounded-full hover:bg-blue-700 h-9 px-4">
                <Link href="/create">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-gray-900 mb-6 leading-[1.1]" style={{ letterSpacing: '-0.015em' }}>
            Your next career move<br />starts here.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-normal leading-relaxed">
            Create beautiful, professional CVs and cover letters that stand out. Simple, powerful, and designed for success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild
              size="lg"
              className="bg-blue-600 text-white px-8 h-12 rounded-full font-medium hover:bg-blue-700 transition-all hover:scale-[1.02] text-base"
            >
              <Link href="/create">Create your CV</Link>
            </Button>
            <Link 
              href="/demo" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors text-base"
            >
              <FontAwesomeIcon icon={faCirclePlay} className="w-5 h-5" />
              Watch the film
            </Link>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100">
            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-xl">
                  <FontAwesomeIcon icon={faFileLines} className="w-12 h-12 text-white" />
                </div>
                <p className="text-gray-500 text-sm font-medium">Interactive preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faFileLines} className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900" style={{ letterSpacing: '-0.012em' }}>Beautiful Templates</h3>
              <p className="text-gray-600 leading-relaxed text-[17px]">
                Choose from professionally designed templates that make a lasting impression.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faBolt} className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900" style={{ letterSpacing: '-0.012em' }}>Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed text-[17px]">
                Create a professional CV in minutes, not hours. Real-time preview as you type.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faLock} className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900" style={{ letterSpacing: '-0.012em' }}>Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed text-[17px]">
                Your data is encrypted and protected. We never share your information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Feature Sections */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-[1.1]" style={{ letterSpacing: '-0.015em' }}>
                ATS-optimized.<br />Recruiter-approved.
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed mb-8 font-normal">
                Our templates are designed to pass applicant tracking systems while impressing hiring managers. Get the best of both worlds.
              </p>
              <Link href="/templates" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2 text-[17px]">
                Explore templates
                <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCircleCheck} className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300 font-medium">ATS Compatible</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCircleCheck} className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300 font-medium">Professional Layout</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCircleCheck} className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300 font-medium">Clean Typography</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCircleCheck} className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300 font-medium">Optimized Structure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 aspect-square flex items-center justify-center border border-gray-100">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-xl">
                  <FontAwesomeIcon icon={faFileLines} className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-[1.1]" style={{ letterSpacing: '-0.015em' }}>
                Real-time preview.<br />Zero surprises.
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed font-normal">
                See exactly how your CV looks as you type. What you see is what you get, pixel-perfect every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl md:text-6xl font-semibold mb-6 text-gray-900 leading-[1.1]" style={{ letterSpacing: '-0.015em' }}>
            Get started today.
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-normal">
            Create your first CV for free. No credit card required.
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-blue-600 text-white px-8 h-12 rounded-full font-medium hover:bg-blue-700 transition-all hover:scale-[1.02] text-base"
          >
            <Link href="/create">Create your CV</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rolekits</h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                Create professional CVs, resumes, and cover letters that help you land your dream job.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/templates" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Templates</Link></li>
                <li><Link href="/examples" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Examples</Link></li>
                <li><Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Blog</Link></li>
                <li><Link href="/guides" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Career Guides</Link></li>
                <li><Link href="/support" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">© 2025 Rolekits. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms</Link>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link>
                <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
