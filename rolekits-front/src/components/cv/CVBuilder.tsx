'use client';

import { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import apolloClient from '@/lib/apollo-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faDownload, 
  faEdit,
  faBriefcase,
  faGraduationCap,
  faAward,
  faCode,
  faLanguage,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { ApolloProviderWrapper } from '@/components/providers/apollo-provider';

const GET_CV_QUERY = gql`
  query GetCV($cvId: String!) {
    cv(cvId: $cvId) {
      id
      fullName
      email
      phone
      address
      website
      linkedin
      github
      summary
      experience {
        company
        position
        startDate
        endDate
        description
      }
      education {
        institution
        degree
        fieldOfStudy
        startDate
        endDate
      }
      skills
      projects {
        name
        description
        url
      }
      certifications {
        name
        issuer
        date
      }
      languages {
        language
        proficiency
      }
      references {
        name
        position
        company
        email
        phone
      }
      createdAt
      updatedAt
    }
  }
`;

const CV_UPDATES_SUBSCRIPTION = gql`
  subscription CVUpdates($cvId: String!) {
    cvUpdates(cvId: $cvId) {
      id
      fullName
      email
      phone
      address
      website
      linkedin
      github
      summary
      experience {
        company
        position
        startDate
        endDate
        description
      }
      education {
        institution
        degree
        fieldOfStudy
        startDate
        endDate
      }
      skills
      projects {
        name
        description
        url
      }
      certifications {
        name
        issuer
        date
      }
      languages {
        language
        proficiency
      }
      references {
        name
        position
        company
        email
        phone
      }
      updatedAt
    }
  }
`;

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
}

interface Project {
  name: string;
  description?: string;
  url?: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
}

interface Language {
  language: string;
  proficiency: string;
}

interface Reference {
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
}

interface CV {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  references?: Reference[];
  createdAt: string;
  updatedAt: string;
}

interface GetCVData {
  cv: CV;
}

interface CVBuilderContentProps {
  cvId: string;
}

function CVBuilderContent({ cvId }: CVBuilderContentProps) {
  const router = useRouter();
  const [cvData, setCvData] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // Fetch initial CV data
  useEffect(() => {
    const fetchCV = async () => {
      try {
        setLoading(true);
        const result = await apolloClient.query<GetCVData>({
          query: GET_CV_QUERY,
          variables: { cvId },
          fetchPolicy: 'network-only',
        });
        
        if (result.data?.cv) {
          setCvData(result.data.cv);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load CV');
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [cvId]);

  // Subscribe to real-time CV updates via WebSocket
  useEffect(() => {
    console.log('📡 Setting up subscription for CV:', cvId);
    console.log('📋 Subscription query:', CV_UPDATES_SUBSCRIPTION.loc?.source.body);
    setConnectionStatus('connecting');

    let isSubscriptionActive = false;

    const subscription = apolloClient.subscribe<{ cvUpdates: CV }>({
      query: CV_UPDATES_SUBSCRIPTION,
      variables: { cvId },
    }).subscribe({
      next: ({ data }) => {
        if (!isSubscriptionActive) {
          isSubscriptionActive = true;
          console.log('🎉 Subscription is now active and receiving data!');
        }
        if (data?.cvUpdates) {
          console.log('✅ Received CV update:', data.cvUpdates);
          setCvData(data.cvUpdates);
          setConnectionStatus('connected');
        } else {
          console.warn('⚠️ Received data but no cvUpdates:', data);
        }
      },
      error: (err: any) => {
        console.error('❌ Subscription error:', err);
        console.error('❌ Error details:', JSON.stringify(err, null, 2));
        setConnectionStatus('disconnected');
      },
      complete: () => {
        console.log('🔚 Subscription completed');
        setConnectionStatus('disconnected');
      },
    });

    // Log after a delay to check if subscription actually started
    setTimeout(() => {
      if (!isSubscriptionActive) {
        console.warn('⚠️ Subscription has not received any data after 3 seconds');
        console.warn('⚠️ Check if backend is publishing updates or if filter is working');
      }
    }, 3000);

    return () => {
      console.log('🧹 Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [cvId]); // Only depend on cvId, not cvData

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <FontAwesomeIcon icon={faEdit} className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading CV</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">CV not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {cvData.fullName || 'Untitled CV'}
                </h1>
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(cvData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* CV Preview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {cvData.fullName || 'Your Name'}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {cvData.email && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                  <span>{cvData.email}</span>
                </div>
              )}
              {cvData.phone && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
                  <span>{cvData.phone}</span>
                </div>
              )}
              {cvData.address && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                  <span>{cvData.address}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
              {cvData.website && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
                  <a href={cvData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {cvData.website}
                  </a>
                </div>
              )}
              {cvData.linkedin && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faLinkedin} className="w-4 h-4" />
                  <a href={cvData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                </div>
              )}
              {cvData.github && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faGithub} className="w-4 h-4" />
                  <a href={cvData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    GitHub
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Summary Section */}
          {cvData.summary && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Summary</h2>
              <p className="text-gray-700 leading-relaxed">{cvData.summary}</p>
            </div>
          )}

          {/* Experience Section */}
          {cvData.experience && cvData.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faBriefcase} className="w-5 h-5 text-blue-600" />
                Experience
              </h2>
              <div className="space-y-6">
                {cvData.experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l-2 border-blue-600 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-700 font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-gray-600 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {cvData.education && cvData.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faGraduationCap} className="w-5 h-5 text-blue-600" />
                Education
              </h2>
              <div className="space-y-6">
                {cvData.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-blue-600 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700 font-medium">{edu.institution}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      {edu.fieldOfStudy} • {edu.startDate} - {edu.endDate || 'Present'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {cvData.skills && cvData.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faCode} className="w-5 h-5 text-blue-600" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {cvData.projects && cvData.projects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Projects</h2>
              <div className="space-y-4">
                {cvData.projects.map((project: any, index: number) => (
                  <div key={index} className="border-l-2 border-blue-600 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-600 mb-2">{project.description}</p>
                    )}
                    {project.url && (
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {cvData.certifications && cvData.certifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faAward} className="w-5 h-5 text-blue-600" />
                Certifications
              </h2>
              <div className="space-y-3">
                {cvData.certifications.map((cert: any, index: number) => (
                  <div key={index} className="border-l-2 border-blue-600 pl-4">
                    <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuer} • {cert.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Section */}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faLanguage} className="w-5 h-5 text-blue-600" />
                Languages
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {cvData.languages.map((lang: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-900 font-medium">{lang.language}</span>
                    <span className="text-gray-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References Section */}
          {cvData.references && cvData.references.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">References</h2>
              <div className="space-y-4">
                {cvData.references.map((ref: any, index: number) => (
                  <div key={index} className="border-l-2 border-blue-600 pl-4">
                    <h3 className="font-semibold text-gray-900">{ref.name}</h3>
                    <p className="text-sm text-gray-700">{ref.position} at {ref.company}</p>
                    <p className="text-sm text-gray-600">{ref.email}</p>
                    {ref.phone && <p className="text-sm text-gray-600">{ref.phone}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Connection Status */}
        <div className="mt-6 text-center">
          {connectionStatus === 'connected' && (
            <p className="text-sm text-green-600 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Real-time updates active
            </p>
          )}
          {connectionStatus === 'connecting' && (
            <p className="text-sm text-yellow-600 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
              Connecting to real-time updates...
            </p>
          )}
          {connectionStatus === 'disconnected' && (
            <p className="text-sm text-red-600 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              Real-time updates unavailable
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CVBuilder({ cvId }: CVBuilderContentProps) {
  return (
    <ApolloProviderWrapper>
      <CVBuilderContent cvId={cvId} />
    </ApolloProviderWrapper>
  );
}
