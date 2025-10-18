'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gql } from '@apollo/client';
import apolloClient from '@/lib/apollo-client';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faFileLines, 
  faClock, 
  faEllipsisVertical,
  faDownload,
  faEdit,
  faTrash,
  faArrowRightFromBracket
} from '@fortawesome/free-solid-svg-icons';

const CREATE_CV_MUTATION = gql`
  mutation CreateCV($input: CreateCVInput!) {
    createCV(input: $input) {
      id
      fullName
      createdAt
      updatedAt
    }
  }
`;

interface CreateCVData {
  createCV: {
    id: string;
    fullName?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface CreateCVVariables {
  input: {
    fullName?: string;
  };
}

interface User {
  id: string;
  username: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!accessToken || !userData) {
      router.push('/signin');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleCreateCV = async () => {
    setCreating(true);
    try {
      const result = await apolloClient.mutate<CreateCVData, CreateCVVariables>({
        mutation: CREATE_CV_MUTATION,
        variables: {
          input: {
            fullName: user?.username || 'Untitled CV',
          },
        },
      });

      if (result.data?.createCV?.id) {
        // Navigate to the newly created CV
        router.push(`/cv/${result.data.createCV.id}`);
      }
    } catch (error: any) {
      console.error('Error creating CV:', error);
      alert('Failed to create CV. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-semibold text-gray-900" style={{ letterSpacing: '-0.015em' }}>
              Rolekits
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4" style={{ letterSpacing: '-0.015em' }}>
            Your CVs & Resumes
          </h1>
          <p className="text-xl text-gray-600">
            Create and manage your professional documents
          </p>
        </div>

        {/* Create New Card */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <button
            onClick={handleCreateCV}
            disabled={creating}
            className="group bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50/50 transition-all aspect-[3/4] flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating CV...</h3>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faPlus} className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New CV</h3>
                <p className="text-sm text-gray-600 text-center">
                  Start with a professional template
                </p>
              </>
            )}
          </button>

          {/* Sample CV Cards - You can replace this with actual data */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow aspect-[3/4] flex flex-col">
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
              <div className="bg-white rounded-lg p-4 shadow-sm h-full">
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-100 rounded w-full mt-4"></div>
                  <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Software Engineer CV</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-2" />
                Updated 2 days ago
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 rounded-lg">
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg">
                  <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow aspect-[3/4] flex flex-col">
            <div className="flex-1 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
              <div className="bg-white rounded-lg p-4 shadow-sm h-full">
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-100 rounded w-full mt-4"></div>
                  <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Product Manager CV</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-2" />
                Updated 1 week ago
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 rounded-lg">
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg">
                  <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6" style={{ letterSpacing: '-0.012em' }}>
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/templates" className="group p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all">
              <FontAwesomeIcon icon={faFileLines} className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Browse Templates</h3>
              <p className="text-sm text-gray-600">
                Explore our collection of professional templates
              </p>
            </Link>
            <Link href="/examples" className="group p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all">
              <FontAwesomeIcon icon={faFileLines} className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">View Examples</h3>
              <p className="text-sm text-gray-600">
                Get inspired by sample CVs and resumes
              </p>
            </Link>
            <Link href="/guides" className="group p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all">
              <FontAwesomeIcon icon={faFileLines} className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Career Guides</h3>
              <p className="text-sm text-gray-600">
                Learn tips and best practices for your CV
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
