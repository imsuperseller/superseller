export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  credits: number;
  priceEnvKey: string;
  popular: boolean;
  tagline: string;
  features: string[];
  cta: string;
  /** Example breakdown of what credits buy */
  creditExamples: { task: string; credits: number; unit: string }[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    period: '/mo',
    credits: 500,
    priceEnvKey: 'starter',
    popular: false,
    tagline: 'Perfect for getting started with your AI crew',
    features: [
      '500 credits per month',
      'All crew members available',
      'All video formats (16:9, 9:16, 1:1, 4:5)',
      'WhatsApp delivery',
      'Email support',
    ],
    cta: 'Start with Starter',
    creditExamples: [
      { task: 'Forge video', credits: 50, unit: 'video' },
      { task: 'Spoke spokesperson video', credits: 50, unit: 'video' },
      { task: 'Market listing', credits: 25, unit: 'listing' },
      { task: 'Scout lead', credits: 15, unit: 'lead' },
      { task: 'Buzz social post', credits: 10, unit: 'post' },
      { task: 'FrontDesk call', credits: 5, unit: 'call' },
      { task: 'Cortex query', credits: 2, unit: 'query' },
    ],
  },
  {
    id: 'pro',
    name: 'Growing Crew',
    price: 699,
    period: '/mo',
    credits: 1500,
    priceEnvKey: 'pro',
    popular: true,
    tagline: 'For businesses ready to scale with AI',
    features: [
      '1,500 credits per month',
      'All crew members available',
      'All video formats (16:9, 9:16, 1:1, 4:5)',
      'Priority processing',
      'WhatsApp delivery',
      'Text overlays on videos',
      'Priority support',
    ],
    cta: 'Go Pro',
    creditExamples: [
      { task: 'Forge video', credits: 50, unit: 'video' },
      { task: 'Spoke spokesperson video', credits: 50, unit: 'video' },
      { task: 'Market listing', credits: 25, unit: 'listing' },
      { task: 'Scout lead', credits: 15, unit: 'lead' },
      { task: 'Buzz social post', credits: 10, unit: 'post' },
      { task: 'FrontDesk call', credits: 5, unit: 'call' },
      { task: 'Cortex query', credits: 2, unit: 'query' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Local Empire',
    price: 1499,
    period: '/mo',
    credits: 4000,
    priceEnvKey: 'team',
    popular: false,
    tagline: 'A full AI department for your business',
    features: [
      '4,000 credits per month',
      'All crew members available',
      'All video formats (16:9, 9:16, 1:1, 4:5)',
      'Priority processing',
      'WhatsApp delivery',
      'Text overlays on videos',
      'Team access',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Scale Up',
    creditExamples: [
      { task: 'Forge video', credits: 50, unit: 'video' },
      { task: 'Spoke spokesperson video', credits: 50, unit: 'video' },
      { task: 'Market listing', credits: 25, unit: 'listing' },
      { task: 'Scout lead', credits: 15, unit: 'lead' },
      { task: 'Buzz social post', credits: 10, unit: 'post' },
      { task: 'FrontDesk call', credits: 5, unit: 'call' },
      { task: 'Cortex query', credits: 2, unit: 'query' },
    ],
  },
];

/** Credit cost reference table */
export const CREDIT_COSTS = {
  'forge': { credits: 50, unit: 'video' },
  'spoke': { credits: 50, unit: 'video' },
  'market': { credits: 25, unit: 'listing' },
  'scout': { credits: 15, unit: 'lead' },
  'buzz': { credits: 10, unit: 'post' },
  'frontdesk': { credits: 5, unit: 'call' },
  'cortex': { credits: 2, unit: 'query' },
} as const;
