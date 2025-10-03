'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail, Clock, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Fetch session details from Stripe
      fetch(`/api/get-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSessionData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch session:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful! 🎉
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your purchase. Your lead generation request has been submitted and is being processed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <Mail className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-blue-900">Email Delivery</h3>
                <p className="text-sm text-blue-700 text-center">
                  Your leads will be delivered to your email inbox
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <Clock className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-green-900">Processing Time</h3>
                <p className="text-sm text-green-700 text-center">
                  Usually takes 5-10 minutes to complete
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                <Download className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-purple-900">CSV Export</h3>
                <p className="text-sm text-purple-700 text-center">
                  Download ready-to-use lead data
                </p>
              </div>
            </div>

            {sessionData && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package:</span>
                    <span className="font-medium">{sessionData.pricingTier || 'Professional'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Leads:</span>
                    <span className="font-medium">{sessionData.leads || '100'} enriched leads</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium">{sessionData.targetLeads || 'Your specified target'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">${(sessionData.amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-4 py-2">
                ✅ Processing your leads...
              </Badge>
              
              <p className="text-gray-600">
                You'll receive an email with your enriched leads and personalized outreach messages within the next few minutes.
              </p>
              
              <div className="pt-4">
                <a 
                  href="/" 
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Generate More Leads
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
