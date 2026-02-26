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

// This would ideally fetch from API/Postgres based on searchParams.product_id
// For now, we use a mock schema if product_id is present
import { ConfigurationForm } from '@/components/fulfillment/ConfigurationForm';
import { FormField } from '@/types/legacy-types';

// Product-specific configuration schemas
// Each product has its own set of questions the user must answer for implementation
const PRODUCT_SCHEMAS: Record<string, FormField[]> = {
  'lead-machine': [
    { id: 'targetNiche', label: 'Target Niche / Industry', type: 'text', required: true, placeholder: 'e.g. Real Estate Agents in Tel Aviv' },
    { id: 'jobTitles', label: 'Target Job Titles', type: 'text', required: true, placeholder: 'e.g. Founder, CEO, Sales Manager' },
    { id: 'keywords', label: 'Keywords (Comma separated)', type: 'text', required: false, placeholder: 'e.g. high-tech, commercial, luxury' },
    { id: 'outreachTone', label: 'Outreach Tone & Voice', type: 'select', required: true, options: ['Professional & Formal', 'Friendly & Casual', 'Aggressive & Direct', 'Creative & Witty'] },
    { id: 'discoveryUrl', label: 'Your Website/LinkedIn (to train the AI)', type: 'url', required: true, placeholder: 'https://linkedin.com/in/you' },
  ],
  'autonomous-secretary': [
    { id: 'whatsappNumber', label: 'WhatsApp Number for your Agent (with country code)', type: 'text', required: true, placeholder: '972501234567' },
    { id: 'calendarLink', label: 'Your Calendar API / Booking Link', type: 'url', required: true, placeholder: 'https://calendly.com/you' },
    { id: 'agentGreeting', label: 'Agent Opening Greeting', type: 'textarea', required: true, placeholder: 'e.g. Hi, this is Sarah from Acme Corp. How can I help you?' },
    { id: 'agentPersona', label: 'Agent Personality', type: 'select', required: true, options: ['Helpful Assistant', 'Sales Closer', 'Executive Secretary', 'Tech Support Expert'] },
    { id: 'transferNumber', label: 'Mobile Number for Human Escalation', type: 'text', required: true, placeholder: '972509876543' },
  ],
  'content-engine': [
    { id: 'contentPillars', label: 'Core Content Pillars (Topics)', type: 'textarea', required: true, placeholder: 'e.g. AI Trends, SaaS Growth, Modern Web Design' },
    { id: 'targetPlatforms', label: 'Primary Social Channels', type: 'select', required: true, options: ['LinkedIn & X', 'Instagram & TikTok', 'Full Omnichannel'] },
    { id: 'videoStyle', label: 'AI Video / Image Style', type: 'select', required: true, options: ['Minimalist & Sleek', 'Vibrant & Viral', 'Cinematic & Moody', 'Educational & Clean'] },
    { id: 'publicationFrequency', label: 'Posts Per Week', type: 'select', required: true, options: ['2 Posts', '5 Posts', '7 Posts (Daily)'] },
  ],
  'knowledge-engine': [
    { id: 'dataSources', label: 'Primary Knowledge Sources (URLs/Doc Links)', type: 'textarea', required: true, placeholder: 'Paste URLs or links to your company bibles, FAQs, or manuals.' },
    { id: 'brainFocus', label: 'What is the "Brain" specialized in?', type: 'select', required: true, options: ['Internal Ops & SOPs', 'Technical Support', 'Sales & Pricing Intelligence', 'Legal & Compliance'] },
    { id: 'dataRefresh', label: 'Data Sync Frequency', type: 'select', required: true, options: ['Real-time', 'Daily', 'Weekly'] },
    { id: 'outputChannel', label: 'Where should the AI live?', type: 'select', required: true, options: ['Internal Slack/Teams', 'Customer Web Widget', 'WhatsApp Portal', 'API Only'] },
  ],
  'full-ecosystem': [
    { id: 'primaryFocus', label: 'Primary Automation Focus', type: 'select', required: true, options: ['Lead Gen', 'Customer Support', 'Internal Ops', 'Content Creation', 'All of the above'] },
    { id: 'mainPlatform', label: 'Main Communication Platform', type: 'select', required: true, options: ['WhatsApp', 'Telegram', 'Instagram', 'Omnichannel'] },
    { id: 'onboardingCall', label: 'Preferred Onboarding Call Time (Israel Time)', type: 'text', required: true, placeholder: 'e.g. Tomorrow 10:00 AM' },
  ],
  'default': [ // Fallback for any product
    { id: 'businessName', label: 'Business Name', type: 'text', required: true, placeholder: 'Acme Corp' },
    { id: 'website', label: 'Website URL', type: 'url', required: true, placeholder: 'https://example.com' },
    { id: 'industry', label: 'Industry', type: 'select', required: true, options: ['Real Estate', 'E-commerce', 'Agency', 'SaaS', 'Other'] },
    { id: 'goals', label: 'Primary Goal', type: 'textarea', required: true, placeholder: 'Describe what you want to achieve with this agent...' }
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--superseller-bg-primary)' }}>
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

              <div className="bg-[#0d1b2e]/60 rounded-2xl border border-white/5 p-6 text-left space-y-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <span className="text-[10px] font-mono text-cyan-400 animate-pulse">TERMINAL ACTIVE</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Transaction ID</span>
                  <span className="text-xs font-mono text-cyan-400/80 max-w-[150px] truncate">{sessionId}</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    Launch Protocol
                  </h3>
                  <div className="grid gap-3 font-mono text-[11px]">
                    {[
                      { text: 'Targeting dedicated cloud cluster...', status: 'DONE' },
                      { text: 'Provisioning neural nodes...', status: 'PENDING' },
                      { text: 'Injecting custom logic manifests...', status: 'WAIT' }
                    ].map((step, i) => (
                      <div key={i} className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                          <span className="text-cyan-500/50">[{i + 1}]</span>
                          <span className="text-slate-400 group-hover:text-cyan-400/80 transition-colors">{step.text}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${step.status === 'DONE' ? 'bg-green-500/20 text-green-400' :
                            step.status === 'PENDING' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' :
                              'bg-white/5 text-slate-600'
                          }`}>
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1b2e]/40 rounded-2xl border border-white/5 p-6 space-y-4">
                <p className="text-sm text-slate-400 font-medium">Broadcast your mission:</p>
                <div className="flex gap-4">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just launched my new AI ${productId || 'Automation'} with @SuperSellerAI! The future of work is here. 🚀 #AIAgency #Automation`)}`}
                    target="_blank"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12 text-xs font-bold gap-2">
                      Share on X
                    </Button>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://superseller.agency')}`}
                    target="_blank"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12 text-xs font-bold gap-2">
                      Post to LinkedIn
                    </Button>
                  </a>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/niches" className="w-full">
                  <Button className="w-full bg-[#f47920] hover:bg-[#f58a30] text-white h-14 font-bold rounded-xl shadow-[0_0_20px_rgba(244,121,32,0.2)]">
                    Go to Niches Catalog
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
                  <a href="mailto:support@superseller.agency" className="text-cyan-400/80 hover:text-cyan-400 transition-colors">
                    support@superseller.agency
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
