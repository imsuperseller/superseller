import { Metadata } from 'next';
import Link from 'next/link';

import { Search, CheckCircle, Rocket, Handshake, Headphones } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Process',
  description: 'How we deliver automations in days, not months. Our proven 5-stage process with WIP limits ensures quality and speed.',
};

const processSteps = [
  {
    stage: 'Stage 1',
    title: 'Discovery & Planning',
    description: 'We analyze your current processes and design the optimal automation strategy.',
    duration: '1-2 days',
    deliverables: [
      'Process audit report',
      'Automation roadmap',
      'Technical architecture',
      'Success metrics',
      'Timeline & milestones'
    ],
    icon: Search,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    stage: 'Stage 2',
    title: 'Design & Approval',
    description: 'Detailed workflow design with your input and approval before development begins.',
    duration: '1-2 days',
    deliverables: [
      'Visual workflow diagrams',
      'Integration specifications',
      'Data flow mapping',
      'Security considerations',
      'Approval documentation'
    ],
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-500'
  },
  {
    stage: 'Stage 3',
    title: 'Build & Deploy',
    description: 'Rapid development and deployment of your automation workflows.',
    duration: '2-3 days',
    deliverables: [
      'Working automation workflows',
      'Integration testing',
      'Performance optimization',
      'Security validation',
      'Production deployment'
    ],
    icon: Rocket,
    color: 'from-orange-500 to-red-500'
  },
  {
    stage: 'Stage 4',
    title: 'Training & Handover',
    description: 'Comprehensive training and documentation for your team.',
    duration: '1 day',
    deliverables: [
      'User training sessions',
      'Administrative training',
      'Documentation package',
      'Support procedures',
      'Knowledge transfer'
    ],
    icon: Handshake,
    color: 'from-purple-500 to-pink-500'
  },
  {
    stage: 'Stage 5',
    title: 'Care & Optimization',
    description: 'Ongoing support and continuous improvement of your automations.',
    duration: 'Ongoing',
    deliverables: [
      'System monitoring',
      'Performance tracking',
      'Regular optimization',
      'Feature enhancements',
      '24/7 support'
    ],
    icon: Headphones,
    color: 'from-indigo-500 to-blue-500'
  }
];

const wipLimits = [
  {
    title: 'Maximum 2 Concurrent Builds',
    description: 'We limit our active projects to ensure each client gets our full attention and expertise.',
    benefits: [
      'Faster delivery times',
      'Higher quality output',
      'Better communication',
      'Reduced risk of delays'
    ]
  },
  {
    title: 'Dedicated Project Manager',
    description: 'Every project has a dedicated PM who ensures smooth communication and timely delivery.',
    benefits: [
      'Single point of contact',
      'Regular progress updates',
      'Issue resolution',
      'Stakeholder coordination'
    ]
  },
  {
    title: 'Quality Gates',
    description: 'Each stage must pass quality checks before proceeding to the next phase.',
    benefits: [
      'Consistent quality',
      'Early issue detection',
      'Reduced rework',
      'Client satisfaction'
    ]
  }
];

export default function ProcessPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="section bg-gradient-to-br from-background via-background to-accent1/20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How We Deliver in Days, Not Months
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto mb-8">
            Our proven 5-stage process with WIP limits ensures you get high-quality automations quickly and reliably.
          </p>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our 5-Stage Process
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Each stage builds on the previous one, ensuring quality and alignment
            </p>
          </div>

          <div className="space-y-12">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Timeline connector */}
                {index < processSteps.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-12 bg-gradient-to-b from-accent1 to-accent2 hidden md:block" />
                )}

                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                  {/* Stage indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 card">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <span className="text-sm font-semibold text-accent1 mb-2 block">
                          {step.stage}
                        </span>
                        <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                        <p className="text-muted mb-4">{step.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-accent1/10 text-accent1 px-3 py-1 rounded-full text-sm font-semibold">
                          {step.duration}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Deliverables:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {step.deliverables.map((deliverable, deliverableIndex) => (
                          <li key={deliverableIndex} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-accent1 rounded-full flex-shrink-0" />
                            <span>{deliverable}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WIP Limits */}
      <section className="section bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why WIP Limits Matter
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              We intentionally limit our workload to ensure quality and speed for every client
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {wipLimits.map((limit, index) => (
              <div key={index} className="card text-center group hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-bold mb-4">{limit.title}</h3>
                <p className="text-muted mb-6">{limit.description}</p>
                
                <ul className="space-y-2 text-left">
                  {limit.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-accent2 rounded-full flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Success Metrics
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              We measure our success by your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="text-3xl font-bold gradient-text mb-2">3-5</div>
              <div className="text-muted">Days to Production</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold gradient-text mb-2">80%</div>
              <div className="text-muted">Task Reduction</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold gradient-text mb-2">10+</div>
              <div className="text-muted">Hours Saved Weekly</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold gradient-text mb-2">100%</div>
              <div className="text-muted">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-accent1/20 to-accent2/20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Automation Journey?
          </h2>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            Let&apos;s discuss your project and get you started with our proven process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/offers" className="btn-primary text-lg px-8 py-4">
              View Our Offers
            </Link>
            <Link href="/contact" className="btn-secondary text-lg px-8 py-4">
              Schedule a Call
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
