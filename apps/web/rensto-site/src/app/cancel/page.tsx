import Link from 'next/link';

interface CancelPageProps {
  searchParams: { canceled?: string };
}

export default function CancelPage({ searchParams }: CancelPageProps) {
  const canceled = searchParams?.canceled;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Cancelled
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {canceled 
              ? 'Your payment was cancelled. No charges were made.'
              : 'No payment was processed.'}
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-4">
            You can return to our marketplace to browse other products or try again.
          </p>
        </div>

        <div className="flex space-x-4">
          <Link
            href="/marketplace"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Marketplace
          </Link>
          
          <Link
            href="/"
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-300 transition-colors"
          >
            Go Home
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@rensto.com" className="text-blue-600 hover:text-blue-700">
              support@rensto.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

