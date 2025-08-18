import { redirect } from 'next/navigation';
import Link from 'next/link';

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect('/marketplace');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. Your order has been processed successfully.
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-4">
                <dt className="text-sm font-medium text-gray-500">Session ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                  {sessionId}
                </dd>
              </div>
              
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-4 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium style={{ color: 'var(--rensto-blue)' }}">What's Next?</h3>
            <ul className="mt-2 text-sm style={{ color: 'var(--rensto-blue)' }} space-y-1">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Your product will be available in your dashboard</li>
              <li>• Our team will reach out if setup is required</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            
            <Link
              href="/marketplace"
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-300 transition-colors"
            >
              Browse More
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@rensto.com" className="style={{ color: 'var(--rensto-blue)' }} hover:style={{ color: 'var(--rensto-blue)' }}">
              support@rensto.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
