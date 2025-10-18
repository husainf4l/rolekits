import { Suspense } from 'react';
import CVBuilder from '@/components/cv/CVBuilder';

export default async function CVPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<CVBuilderSkeleton />}>
      <CVBuilder cvId={id} />
    </Suspense>
  );
}

function CVBuilderSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading CV...</p>
      </div>
    </div>
  );
}
