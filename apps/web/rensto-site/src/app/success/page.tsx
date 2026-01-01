import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';

interface SuccessPageProps {
  searchParams: {
    session_id?: string;
    product_id?: string;
    [key: string]: string | undefined;
  };
}

// This would ideally fetch from API/Firestore based on searchParams.product_id
// For now, we use a mock schema if product_id is present
import { ConfigurationForm } from '@/components/fulfillment/ConfigurationForm';
import { FormField } from '@/types/firestore';

// Product-specific configuration schemas
// Each product has its own set of questions the user must answer for implementation
const PRODUCT_SCHEMAS: Record<string, FormField[]> = {
  '4OYGXXMYeJFfAo6X': [ // Celebrity Selfie Video Generator
    { id: 'whatsappNumber', label: 'WhatsApp Number (with country code)', type: 'text', required: true, placeholder: '972501234567' },
    { id: 'preferredStyle', label: 'Preferred Movie Style', type: 'select', required: true, options: ['Action/Adventure', 'Sci-Fi', 'Comedy', 'Drama', 'Horror'] },
    { id: 'brandColors', label: 'Brand Colors (Optional)', type: 'text', required: false, placeholder: '#FF5733, #2ECC71' },
  ],
  '8GC371u1uBQ8WLmu': [ // Meta Ad Library Analyzer
    { id: 'adAccountId', label: 'Meta Ad Account ID', type: 'text', required: true, placeholder: 'act_123456789' },
    { id: 'targetIndustry', label: 'Target Industry for Competitor Analysis', type: 'select', required: true, options: ['E-commerce', 'Real Estate', 'Finance', 'SaaS', 'Local Services', 'Other'] },
    { id: 'reportEmail', label: 'Email for Weekly Reports', type: 'email', required: true, placeholder: 'reports@yourcompany.com' },
  ],
  '5pMi01SwffYB6KeX': [ // YouTube AI Clone
    { id: 'youtubeUrl', label: 'YouTube Channel or Video URL', type: 'url', required: true, placeholder: 'https://youtube.com/@channel' },
    { id: 'customInstructions', label: 'Custom Instructions (Mimic style, specific knowledge, etc.)', type: 'textarea', required: false, placeholder: 'e.g. Focus on technical advice provided in the Dev Series playlists.' },
    { id: 'deploymentChannel', label: 'Primary Deployment Channel', type: 'select', required: true, options: ['WhatsApp', 'Telegram', 'Web Widget'] },
  ],
  '5Fl9WUjYTpodcloJ': [ // AI Calendar Assistant
    { id: 'calendarPlatform', label: 'Primary Calendar Platform', type: 'select', required: true, options: ['Google Calendar', 'Outlook/Office 365', 'iCloud'] },
    { id: 'bookingLogic', label: 'Standard Booking Length', type: 'select', required: true, options: ['15 mins', '30 mins', '60 mins', 'Custom'] },
    { id: 'timeZone', label: 'Primary Time Zone', type: 'text', required: true, placeholder: 'e.g. America/New_York' },
    { id: 'meetingLink', label: 'Meeting Link (Zoom/Google Meet)', type: 'url', required: true, placeholder: 'https://zoom.us/j/...' },
  ],
  'U6EZ2iLQ4zCGg31H': [ // Call Audio Lead Analyzer
    { id: 'telnyxApiKey', label: 'Telnyx API Key', type: 'text', required: true, placeholder: 'KEY_...' },
    { id: 'workizApiKey', label: 'Workiz API Key (Optional)', type: 'text', required: false, placeholder: 'For CRM sync' },
    { id: 'notificationEmail', label: 'Notification Email', type: 'email', required: true, placeholder: 'leads@company.com' },
  ],
  'stj8DmATqe66D9j4': [ // Floor Plan to Property Tour
    { id: 'outputStyle', label: 'Interior Design Style', type: 'select', required: true, options: ['Modern Pan-Asian', 'Scandinavian Minimalist', 'High-End Industrial', 'Mid-Century Modern', 'Traditional Luxury'] },
    { id: 'focusRoom', label: 'Priority Room for Walkthrough', type: 'select', required: true, options: ['Living Room', 'Kitchen', 'Master Bedroom', 'Patio/Outdoor', 'All Rooms'] },
    { id: 'deliveryEmail', label: 'Delivery Email for Final Video', type: 'email', required: true, placeholder: 'video@realestate.com' },
    { id: 'brandLogo', label: 'Brand Logo URL (Optional)', type: 'url', required: false, placeholder: 'https://yoursite.com/logo.png' },
  ],
  'vCxY2DXUZ8vUb30f': [ // Monthly CRO Insights Bot
    { id: 'websiteUrl', label: 'Website URL for Analysis', type: 'url', required: true, placeholder: 'https://yourstore.com' },
    { id: 'primaryConversion', label: 'Primary Conversion Event', type: 'text', required: true, placeholder: 'e.g. Purchase, Add to Cart, Form Submit' },
    { id: 'ga4PropertyId', label: 'GA4 Property ID', type: 'text', required: true, placeholder: '123456789' },
    { id: 'clarityProjectId', label: 'Microsoft Clarity Project ID (Optional)', type: 'text', required: false, placeholder: 'abcde123' },
    { id: 'reportFrequency', label: 'Report Frequency', type: 'select', required: true, options: ['Monthly', 'Bi-Weekly', 'Quarterly'] },
  ],
  'default': [ // Fallback for any product
    { id: 'businessName', label: 'Business Name', type: 'text', required: true, placeholder: 'Acme Corp' },
    { id: 'website', label: 'Website URL', type: 'url', required: true, placeholder: 'https://example.com' },
    { id: 'industry', label: 'Industry', type: 'select', required: true, options: ['Real Estate', 'E-commerce', 'Agency', 'SaaS', 'Other'] },
    { id: 'goals', label: 'Primary Goal', type: 'textarea', required: true, placeholder: 'Describe what you want to achieve with this agent...', helperText: 'Be specific about the outcomes you expect.' }
  ]
};

// Helper to get schema for a product
const getSchemaForProduct = (productId: string | undefined): FormField[] => {
  if (!productId) return PRODUCT_SCHEMAS['default'];
  return PRODUCT_SCHEMAS[productId] || PRODUCT_SCHEMAS['default'];
};

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;
  const productId = searchParams["product_id"] as string; // Case sensitive? URL params are usually lowercase but we'll check both if needed
  const tier = searchParams["tier"] as string;

  // Decide if configuration is needed
  // We generally need configuration for 'install', 'custom', 'managed-plan', or service purchases
  // 'download' might just need a email confirmation or direct link
  const requiresConfiguration = productId && (tier === 'install' || tier === 'custom' || !tier); // Default to yes if tier is unknown (safer)

  // Note: searchParams is ReadonlyURLSearchParams which can be accessed like object in Next.js 13+ server components

  if (!sessionId) {
    redirect('/offers');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--rensto-bg-primary)' }}>
      <div className="max-w-xl w-full relative">
        <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full -z-10" />

        <div className="bg-[#1a1438]/60 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl space-y-10 text-center">

          {requiresConfiguration && tier !== 'download' ? (
            // CONFIGURATION MODE (Install/Custom/Services)
            <ConfigurationForm
              schema={getSchemaForProduct(productId)}
              productId={productId}
              productName={productId}
              clientId={sessionId}
              paymentIntentId={sessionId}
            />
          ) : (
            // STANDARD SUCCESS MODE
            <>
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent animate-pulse" />
                <svg
                  className="h-12 w-12 text-cyan-400 relative z-10"
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

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                  Launch <span className="text-cyan-400">Sequence</span> Started
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Payment confirmed. Our architects are spinning up your dedicated automation environment. Expect a briefing shortly.
                </p>
              </div>

              <div className="bg-[#110d28]/60 rounded-2xl border border-white/5 p-6 text-left space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Transaction ID</span>
                  <span className="text-xs font-mono text-cyan-400/80 max-w-[150px] truncate">{sessionId}</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Next Steps</h3>
                  <div className="grid gap-3">
                    {[
                      'System provisioning (ETA: 2 mins)',
                      'Credentials sent to your email',
                      'Dashboard sync initializing'
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                        <span className="text-sm text-slate-400">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/marketplace" className="w-full">
                  <Button className="w-full bg-[#fe3d51] hover:bg-[#ff4d61] text-white h-14 font-bold rounded-xl shadow-[0_0_20px_rgba(254,61,81,0.2)]">
                    Go to Marketplace
                  </Button>
                </Link>
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full border-slate-700 h-14 font-bold rounded-xl hover:bg-white/5">
                    Home Base
                  </Button>
                </Link>
              </div>

              <div className="pt-8 border-t border-white/5">
                <p className="text-xs text-slate-500">
                  Technical issues? our engineers are online at{' '}
                  <a href="mailto:support@rensto.com" className="text-cyan-400/80 hover:text-cyan-400 transition-colors">
                    support@rensto.com
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
