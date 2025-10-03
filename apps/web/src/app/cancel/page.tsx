'use client';

import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Cancelled
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your payment was cancelled. No charges have been made to your account.
            </p>

            <div className="space-y-3">
              <Link 
                href="/"
                className="w-full inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Again
              </Link>
              
              <p className="text-sm text-gray-500">
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
