import { useState, useEffect, useRef, useCallback } from "react";

const STAGES = [
  { id: "intake", label: "Client Intake", icon: "📋", description: "Gather client requirements" },
  { id: "discovery", label: "Business Discovery", icon: "🔍", description: "Research client's business & web presence" },
  { id: "design_analysis", label: "Design Analysis", icon: "🎨", description: "Analyze existing site structure & branding" },
  { id: "market_research", label: "Market Research", icon: "📊", description: "Competitors, trends & best practices" },
  { id: "architecture", label: "Architecture", icon: "🏗️", description: "Plan structure, components & tech stack" },
  { id: "build", label: "Code Generation", icon: "⚡", description: "Generate production code & assets" },
  { id: "deliverables", label: "Deliverables", icon: "📦", description: "Package reports, code & specs" },
];

const callClaude = async (systemPrompt, userMessage, onStream) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const data = await response.json();
    const textBlocks = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n\n") || "";
    if (onStream) onStream(textBlocks);
    return textBlocks;
  } catch (err) {
    console.error("Claude API error:", err);
    return `Error: ${err.message}`;
  }
};

const fetchPageSource = async (url) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [
          {
            role: "user",
            content: `Go to this website and analyze its HTML structure, design patterns, color scheme, fonts, layout approach, and key UI components: ${url}. Provide a detailed design analysis including: 1) Color palette (hex codes), 2) Typography choices, 3) Layout patterns (grid, flexbox, etc.), 4) Key UI components used, 5) Overall design style/aesthetic, 6) Navigation patterns, 7) Hero section approach, 8) CTA styles. Format as structured JSON.`,
          },
        ],
      }),
    });
    const data = await response.json();
    return data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
  } catch (err) {
    return `Error fetching source: ${err.message}`;
  }
};

function IntakeForm({ onSubmit }) {
  const [form, setForm] = useState({
    clientName: "",
    businessName: "",
    businessType: "",
    existingWebsite: "",
    serviceType: "website",
    description: "",
    targetAudience: "",
    goals: "",
    budget: "",
    timeline: "",
    competitors: "",
    specialRequirements: "",
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div style={styles.formContainer}>
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle}>New Client Project</h2>
        <p style={styles.formSubtitle}>Fill in the details and let the agent handle the rest</p>
      </div>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Client Name *</label>
          <input style={styles.input} placeholder="John Smith" value={form.clientName} onChange={(e) => update("clientName", e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Business Name *</label>
          <input style={styles.input} placeholder="Acme Corp" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Business Type *</label>
          <select style={styles.select} value={form.businessType} onChange={(e) => update("businessType", e.target.value)}>
            <option value="">Select type...</option>
            <option value="ecommerce">E-Commerce / Retail</option>
            <option value="saas">SaaS / Tech</option>
            <option value="agency">Agency / Services</option>
            <option value="restaurant">Restaurant / Food</option>
            <option value="healthcare">Healthcare / Medical</option>
            <option value="realestate">Real Estate</option>
            <option value="fitness">Fitness / Wellness</option>
            <option value="education">Education</option>
            <option value="finance">Finance / Insurance</option>
            <option value="nonprofit">Non-Profit</option>
            <option value="local">Local Business</option>
            <option value="portfolio">Portfolio / Personal</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Existing Website</label>
          <input style={styles.input} placeholder="https://example.com" value={form.existingWebsite} onChange={(e) => update("existingWebsite", e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Service Needed *</label>
          <select style={styles.select} value={form.serviceType} onChange={(e) => update("serviceType", e.target.value)}>
            <option value="website">Full Website</option>
            <option value="landing">Landing Page</option>
            <option value="webapp">Web Application</option>
            <option value="redesign">Website Redesign</option>
            <option value="ecommerce_store">E-Commerce Store</option>
            <option value="dashboard">Dashboard / Admin Panel</option>
            <option value="portfolio_site">Portfolio Site</option>
            <option value="blog">Blog / Content Site</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Target Audience</label>
          <input style={styles.input} placeholder="Small business owners, 30-50 years old" value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} />
        </div>
        <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Project Description *</label>
          <textarea style={{ ...styles.input, minHeight: 100, resize: "vertical" }} placeholder="Describe what the client needs in detail..." value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Goals & KPIs</label>
          <input style={styles.input} placeholder="Increase conversions by 30%, generate leads..." value={form.goals} onChange={(e) => update("goals", e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Known Competitors</label>
          <input style={styles.input} placeholder="competitor1.com, competitor2.com" value={form.competitors} onChange={(e) => update("competitors", e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Budget Range</label>
          <select style={styles.select} value={form.budget} onChange={(e) => update("budget", e.target.value)}>
            <option value="">Select range...</option>
            <option value="500-1000">$500 - $1,000</option>
            <option value="1000-3000">$1,000 - $3,000</option>
            <option value="3000-5000">$3,000 - $5,000</option>
            <option value="5000-10000">$5,000 - $10,000</option>
            <option value="10000+">$10,000+</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Timeline</label>
          <select style={styles.select} value={form.timeline} onChange={(e) => update("timeline", e.target.value)}>
            <option value="">Select timeline...</option>
            <option value="1week">1 Week</option>
            <option value="2weeks">2 Weeks</option>
            <option value="1month">1 Month</option>
            <option value="2months">2 Months</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
        <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Special Requirements</label>
          <textarea style={{ ...styles.input, minHeight: 60, resize: "vertical" }} placeholder="Specific integrations, accessibility needs, multilingual support..." value={form.specialRequirements} onChange={(e) => update("specialRequirements", e.target.value)} />
        </div>
      </div>
      <button
        style={{
          ...styles.primaryButton,
          opacity: form.clientName && form.businessName && form.businessType && form.description ? 1 : 0.4,
        }}
        disabled={!form.clientName || !form.businessName || !form.businessType || !form.description}
        onClick={() => onSubmit(form)}
      >
        <span style={{ fontSize: 18 }}>🚀</span> Launch Agent Pipeline
      </button>
    </div>
  );
}

function StageProgress({ stages, currentStage, stageResults }) {
  return (
    <div style={styles.pipelineContainer}>
      {stages.map((stage, i) => {
        const stageIndex = stages.findIndex((s) => s.id === currentStage);
        const isComplete = i < stageIndex || (currentStage === "complete");
        const isCurrent = stage.id === currentStage;
        const isPending = i > stageIndex && currentStage !== "complete";
        return (
          <div key={stage.id} style={styles.stageRow}>
            <div style={styles.stageIndicatorCol}>
              <div
                style={{
                  ...styles.stageIndicator,
                  background: isComplete ? "#10b981" : isCurrent ? "#f59e0b" : "rgba(255,255,255,0.08)",
                  border: isCurrent ? "2px solid #f59e0b" : isComplete ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.12)",
                  boxShadow: isCurrent ? "0 0 20px rgba(245,158,11,0.3)" : isComplete ? "0 0 12px rgba(16,185,129,0.2)" : "none",
                }}
              >
                {isComplete ? "✓" : isCurrent ? (
                  <div style={styles.spinnerSmall} />
                ) : (
                  <span style={{ opacity: 0.4 }}>{i + 1}</span>
                )}
              </div>
              {i < stages.length - 1 && (
                <div
                  style={{
                    ...styles.stageLine,
                    background: isComplete ? "#10b981" : "rgba(255,255,255,0.08)",
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: 24 }}>
              <div style={styles.stageHeader}>
                <span style={{ fontSize: 20 }}>{stage.icon}</span>
                <div>
                  <div
                    style={{
                      ...styles.stageLabel,
                      color: isComplete ? "#10b981" : isCurrent ? "#f59e0b" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {stage.label}
                    {isCurrent && <span style={styles.activeBadge}>RUNNING</span>}
                    {isComplete && <span style={styles.completeBadge}>DONE</span>}
                  </div>
                  <div style={styles.stageDesc}>{stage.description}</div>
                </div>
              </div>
              {(isComplete || isCurrent) && stageResults[stage.id] && (
                <div style={styles.stageResultBox}>
                  <pre style={styles.stageResultText}>{stageResults[stage.id]}</pre>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DeliverablesPanel({ results, clientData }) {
  const [activeTab, setActiveTab] = useState("report");
  const tabs = [
    { id: "report", label: "Research Report", icon: "📊" },
    { id: "design", label: "Design Spec", icon: "🎨" },
    { id: "architecture", label: "Architecture", icon: "🏗️" },
    { id: "code", label: "Generated Code", icon: "💻" },
  ];
  const content = {
    report: results.discovery + "\n\n---\n\n" + (results.market_research || ""),
    design: results.design_analysis || "",
    architecture: results.architecture || "",
    code: results.build || "",
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <div style={styles.deliverablesContainer}>
      <div style={styles.deliverablesHeader}>
        <h2 style={styles.deliverablesTitle}>📦 Project Deliverables</h2>
        <p style={styles.deliverablesSubtitle}>
          for <strong>{clientData.businessName}</strong> — {clientData.serviceType}
        </p>
      </div>
      <div style={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              background: activeTab === tab.id ? "rgba(245,158,11,0.15)" : "transparent",
              borderColor: activeTab === tab.id ? "#f59e0b" : "transparent",
              color: activeTab === tab.id ? "#f59e0b" : "rgba(255,255,255,0.5)",
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>
      <div style={styles.tabContent}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button style={styles.copyButton} onClick={() => copyToClipboard(content[activeTab] || "")}>
            📋 Copy to Clipboard
          </button>
        </div>
        <pre style={styles.deliverableText}>{content[activeTab] || "No data yet for this section."}</pre>
      </div>
    </div>
  );
}

export default function AgentForge() {
  const [view, setView] = useState("intake"); // intake | running | complete
  const [clientData, setClientData] = useState(null);
  const [currentStage, setCurrentStage] = useState("discovery");
  const [stageResults, setStageResults] = useState({});
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (view === "running") {
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [view]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const updateResult = (stageId, text) => {
    setStageResults((prev) => ({ ...prev, [stageId]: text }));
  };

  const runPipeline = async (data) => {
    setClientData(data);
    setView("running");
    setElapsedTime(0);
    setError(null);

    try {
      // STAGE 1: Business Discovery
      setCurrentStage("discovery");
      const discoveryResult = await callClaude(
        `You are a business research analyst for a web development agency. Your job is to thoroughly research a client's business before building their website or app. Search the web to find everything about this business. Be thorough and structured in your findings.`,
        `Research this client's business thoroughly:
        
Business Name: ${data.businessName}
Client Name: ${data.clientName}
Business Type: ${data.businessType}
Existing Website: ${data.existingWebsite || "Not provided - search for it"}
Description: ${data.description}
Known Competitors: ${data.competitors || "Find relevant competitors"}

Please research and provide:
1. **Business Overview** - What does this business do? Industry, size, market position
2. **Online Presence** - Find their website, social media, reviews, directory listings
3. **Brand Identity** - Logo, colors, messaging, tone of voice
4. **Products/Services** - What they offer, pricing if available
5. **Target Market** - Who are their customers?
6. **Unique Selling Points** - What differentiates them?
7. **Digital Maturity** - Current tech stack, online capabilities
8. **Opportunities** - Where can they improve digitally?

Be specific with URLs, data points, and findings. If you can't find the exact business, note what you found and make reasonable inferences based on the business type.`
      );
      updateResult("discovery", discoveryResult);

      // STAGE 2: Design Analysis
      setCurrentStage("design_analysis");
      const websiteUrl = data.existingWebsite || "";
      const designResult = await callClaude(
        `You are a senior UI/UX designer and frontend developer. Analyze websites and extract detailed design specifications. When analyzing, be extremely specific about colors (hex codes), fonts, spacing, layout patterns, and component structures. Search the web to view the site and analyze it.`,
        `Analyze the design of this client's web presence:

Business: ${data.businessName}
Website: ${websiteUrl || "Search for their website"}
Business Type: ${data.businessType}
Service Needed: ${data.serviceType}

${websiteUrl ? `Visit ${websiteUrl} and analyze:` : "Find their website and analyze:"}

1. **Color Palette** - Primary, secondary, accent colors with hex codes
2. **Typography** - Font families for headings and body, sizes, weights
3. **Layout System** - Grid structure, breakpoints, spacing system
4. **Navigation Pattern** - Header type, menu structure, mobile approach
5. **Hero Section** - Style, content approach, CTA placement
6. **Component Library** - Cards, buttons, forms, modals used
7. **Imagery Style** - Photography style, illustrations, icons
8. **Micro-interactions** - Hover effects, transitions, animations
9. **Footer Structure** - Content, layout, links

Also research 3-5 top websites in the ${data.businessType} space for design inspiration and list the best design patterns from each.

For the new ${data.serviceType}, recommend:
- Design direction (modern, classic, bold, minimal, etc.)
- Color scheme suggestions based on brand and industry
- Typography pairing recommendations
- Key component types needed from component libraries like 21st.dev, shadcn/ui, or similar
- Layout approach for the specific service type`
      );
      updateResult("design_analysis", designResult);

      // STAGE 3: Market Research
      setCurrentStage("market_research");
      const marketResult = await callClaude(
        `You are a market research analyst specializing in digital strategy. Provide data-driven insights about markets, competitors, pricing, and best practices. Search the web for current market data and trends.`,
        `Conduct thorough market research for this project:

Business: ${data.businessName}
Industry: ${data.businessType}
Service: ${data.serviceType}
Target Audience: ${data.targetAudience || "Research the typical audience"}
Goals: ${data.goals || "Improve online presence and conversions"}
Competitors: ${data.competitors || "Find top 5 competitors"}

Research and provide:

1. **Competitor Analysis**
   - Find 5 direct competitors with websites
   - Analyze each competitor's website: features, design quality, tech stack, strengths/weaknesses
   - Pricing comparison if applicable
   - Features comparison matrix

2. **Industry Trends**
   - Current web design trends for ${data.businessType}
   - Technology trends (frameworks, tools, integrations)
   - Customer expectation trends
   - Mobile-first considerations

3. **Best Practices**
   - Must-have features for a ${data.businessType} ${data.serviceType}
   - Conversion optimization techniques for this industry
   - SEO considerations specific to this market
   - Accessibility requirements
   - Performance benchmarks

4. **Content Strategy**
   - Key pages needed
   - Content types that work in this industry
   - Call-to-action strategies
   - Trust signals specific to this market

5. **Technology Recommendations**
   - Recommended tech stack
   - Essential integrations (payment, CRM, analytics, etc.)
   - Third-party tools and services
   - Hosting and performance requirements

6. **Revenue & ROI Projections**
   - Expected outcomes from a new ${data.serviceType}
   - Industry conversion benchmarks
   - Estimated timeline to ROI
   - Key metrics to track`
      );
      updateResult("market_research", marketResult);

      // STAGE 4: Architecture
      setCurrentStage("architecture");
      const archResult = await callClaude(
        `You are a senior software architect. Based on research provided, create detailed technical architectures for web projects. Be specific about file structures, component hierarchies, data flows, and technology choices.`,
        `Based on all the research conducted for ${data.businessName}, create a detailed architecture plan:

Business Type: ${data.businessType}
Service Type: ${data.serviceType}
Description: ${data.description}
Target Audience: ${data.targetAudience}
Goals: ${data.goals}
Special Requirements: ${data.specialRequirements}
Budget: ${data.budget}
Timeline: ${data.timeline}

Previous Research Summary:
${discoveryResult?.substring(0, 1000)}
${marketResult?.substring(0, 1000)}

Create:

1. **Technical Architecture**
   - Framework choice and justification (Next.js, React, etc.)
   - Project structure / file tree
   - Component hierarchy diagram (text-based)
   - State management approach
   - API/data layer architecture

2. **Page Structure**
   - Complete sitemap with all pages
   - Each page: purpose, key sections, components needed
   - Navigation flow diagram
   - User journey mapping

3. **Component Plan**
   - List every reusable component needed
   - For each: name, purpose, props, variants
   - Component library sources (21st.dev, shadcn/ui, custom)
   - Specific component recommendations from 21st.dev catalog

4. **Integration Plan**
   - Third-party services and APIs
   - Authentication if needed
   - Database schema if needed
   - CMS integration if needed

5. **Performance Plan**
   - Loading strategy
   - Image optimization approach
   - Bundle optimization
   - Core Web Vitals targets

6. **Deployment Strategy**
   - Hosting recommendation (Vercel, Cloudflare, etc.)
   - CI/CD pipeline
   - Environment setup
   - Domain and DNS configuration`
      );
      updateResult("architecture", archResult);

      // STAGE 5: Code Generation
      setCurrentStage("build");
      const buildResult = await callClaude(
        `You are an expert full-stack developer. Generate production-ready code based on the architecture plan. Write clean, well-commented, modern code using best practices. Use React/Next.js with Tailwind CSS unless otherwise specified.`,
        `Generate the complete codebase for ${data.businessName}'s ${data.serviceType}.

Architecture Plan:
${archResult?.substring(0, 2000)}

Design Specifications:
${designResult?.substring(0, 1000)}

Requirements:
- Business: ${data.businessName} (${data.businessType})
- Service: ${data.serviceType}
- Description: ${data.description}
- Goals: ${data.goals}

Generate production-ready code including:

1. **Project Setup**
   - package.json with all dependencies
   - Configuration files (tailwind.config, next.config, tsconfig)
   - Environment variables template

2. **Core Pages** (generate the most important 3-4 pages)
   - Complete page components with all sections
   - Responsive design (mobile-first)
   - SEO metadata
   - Proper semantic HTML

3. **Reusable Components**
   - Navigation/Header component
   - Footer component
   - Hero section
   - Key feature/service cards
   - CTA sections
   - Contact form

4. **Styling**
   - Global styles
   - Custom Tailwind configuration
   - Color theme matching research
   - Typography setup
   - Animation classes

5. **Functionality**
   - Form handling
   - Navigation logic
   - Any interactive features
   - API route stubs if needed

Write COMPLETE, RUNNABLE code for each file. Don't use placeholders or "...". Every component should be fully implemented with real content based on the client's business research.`
      );
      updateResult("build", buildResult);

      // STAGE 6: Deliverables
      setCurrentStage("deliverables");
      const deliverablesResult = await callClaude(
        `You are a project manager creating a comprehensive deliverables package for a client project.`,
        `Create a final deliverables summary for the ${data.businessName} project:

Research conducted: Business discovery, design analysis, market research
Architecture planned: Complete technical architecture
Code generated: Production-ready codebase

Create:

1. **Executive Summary** - 2-3 paragraph overview of the project, approach, and expected outcomes
2. **Project Scope Document** - What's included, what's not, assumptions
3. **Implementation Roadmap** - Step-by-step plan to go from code to deployed site
4. **Deployment Checklist** - Everything needed to launch
5. **Cost Breakdown** - Estimated costs for hosting, domains, tools, ongoing maintenance
6. **Next Steps** - What the client needs to do, what we handle, timeline
7. **Maintenance Plan** - Post-launch support, updates, monitoring

Budget reference: ${data.budget || "Not specified"}
Timeline reference: ${data.timeline || "Not specified"}`
      );
      updateResult("deliverables", deliverablesResult);

      setCurrentStage("complete");
      setView("complete");
    } catch (err) {
      setError(`Pipeline error: ${err.message}`);
    }
  };

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 3px; }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>⚡</div>
            <div>
              <h1 style={styles.logoText}>AgentForge</h1>
              <p style={styles.logoSub}>Autonomous Web Dev Agent</p>
            </div>
          </div>
          {view !== "intake" && (
            <div style={styles.headerMeta}>
              <div style={styles.timerBox}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>ELAPSED</span>
                <span style={styles.timerValue}>{formatTime(elapsedTime)}</span>
              </div>
              {clientData && (
                <div style={styles.clientBadge}>
                  {clientData.businessName}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️</span> {error}
            <button style={styles.errorDismiss} onClick={() => setError(null)}>×</button>
          </div>
        )}

        {view === "intake" && (
          <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={styles.heroSection}>
              <h1 style={styles.heroTitle}>
                Build anything.{" "}
                <span style={styles.heroAccent}>Autonomously.</span>
              </h1>
              <p style={styles.heroDesc}>
                Submit a client brief and watch the AI agent research, design, architect,
                and generate a complete project — from discovery to deployment-ready code.
              </p>
            </div>
            <IntakeForm onSubmit={runPipeline} />
          </div>
        )}

        {view === "running" && (
          <div style={{ display: "flex", gap: 32, animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.runningHeader}>
                <div style={styles.spinnerLarge} />
                <div>
                  <h2 style={styles.runningTitle}>Agent Pipeline Active</h2>
                  <p style={styles.runningDesc}>
                    Processing <strong>{clientData?.businessName}</strong> — {clientData?.serviceType}
                  </p>
                </div>
              </div>
              <StageProgress stages={STAGES.slice(1)} currentStage={currentStage} stageResults={stageResults} />
            </div>
          </div>
        )}

        {view === "complete" && (
          <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={styles.completeHeader}>
              <div style={styles.completeBadgeLarge}>✓</div>
              <div>
                <h2 style={styles.completeTitle}>Pipeline Complete</h2>
                <p style={styles.completeDesc}>
                  All stages finished in {formatTime(elapsedTime)} for <strong>{clientData?.businessName}</strong>
                </p>
              </div>
              <button
                style={{ ...styles.primaryButton, marginLeft: "auto", padding: "10px 20px" }}
                onClick={() => {
                  setView("intake");
                  setStageResults({});
                  setCurrentStage("discovery");
                  setClientData(null);
                }}
              >
                🔄 New Project
              </button>
            </div>
            <DeliverablesPanel results={stageResults} clientData={clientData} />
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#e2e2e2",
    fontFamily: "'Outfit', sans-serif",
  },
  header: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(10,10,15,0.95)",
    backdropFilter: "blur(20px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  logoSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    margin: 0,
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  headerMeta: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  timerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  timerValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 16,
    fontWeight: 600,
    color: "#f59e0b",
  },
  clientBadge: {
    padding: "6px 14px",
    borderRadius: 20,
    background: "rgba(245,158,11,0.1)",
    border: "1px solid rgba(245,158,11,0.2)",
    color: "#f59e0b",
    fontSize: 13,
    fontWeight: 500,
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 24px",
  },
  heroSection: {
    textAlign: "center",
    marginBottom: 40,
    padding: "20px 0",
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 16px",
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
  },
  heroAccent: {
    background: "linear-gradient(135deg, #f59e0b, #ef4444, #f59e0b)",
    backgroundSize: "200% 200%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "gradientShift 3s ease infinite",
  },
  heroDesc: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    maxWidth: 560,
    margin: "0 auto",
    lineHeight: 1.6,
  },
  formContainer: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 32,
    maxWidth: 800,
    margin: "0 auto",
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 6px",
  },
  formSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    margin: 0,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 28,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontFamily: "'JetBrains Mono', monospace",
  },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  },
  select: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
    cursor: "pointer",
  },
  primaryButton: {
    width: "100%",
    padding: "14px 28px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "transform 0.15s, opacity 0.2s",
  },
  pipelineContainer: {
    marginTop: 24,
  },
  stageRow: {
    display: "flex",
    gap: 16,
  },
  stageIndicatorCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 40,
    flexShrink: 0,
  },
  stageIndicator: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
    transition: "all 0.3s",
  },
  stageLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    transition: "background 0.3s",
  },
  stageHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  stageLabel: {
    fontSize: 15,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "color 0.3s",
  },
  stageDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },
  activeBadge: {
    padding: "2px 8px",
    borderRadius: 4,
    background: "rgba(245,158,11,0.15)",
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.05em",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  completeBadge: {
    padding: "2px 8px",
    borderRadius: 4,
    background: "rgba(16,185,129,0.15)",
    color: "#10b981",
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.05em",
  },
  stageResultBox: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    maxHeight: 300,
    overflowY: "auto",
  },
  stageResultText: {
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: "rgba(255,255,255,0.7)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
    lineHeight: 1.6,
  },
  spinnerSmall: {
    width: 16,
    height: 16,
    border: "2px solid rgba(245,158,11,0.2)",
    borderTop: "2px solid #f59e0b",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  spinnerLarge: {
    width: 32,
    height: 32,
    border: "3px solid rgba(245,158,11,0.2)",
    borderTop: "3px solid #f59e0b",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
  },
  runningHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
    padding: 20,
    background: "rgba(245,158,11,0.05)",
    border: "1px solid rgba(245,158,11,0.1)",
    borderRadius: 12,
  },
  runningTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 4px",
  },
  runningDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    margin: 0,
  },
  completeHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
    padding: 20,
    background: "rgba(16,185,129,0.05)",
    border: "1px solid rgba(16,185,129,0.15)",
    borderRadius: 12,
  },
  completeBadgeLarge: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    color: "#fff",
    fontWeight: 700,
    flexShrink: 0,
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 4px",
  },
  completeDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    margin: 0,
  },
  deliverablesContainer: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    overflow: "hidden",
  },
  deliverablesHeader: {
    padding: "24px 28px 0",
  },
  deliverablesTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 4px",
  },
  deliverablesSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    margin: 0,
  },
  tabBar: {
    display: "flex",
    gap: 4,
    padding: "20px 28px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tab: {
    padding: "10px 18px",
    borderRadius: "8px 8px 0 0",
    border: "1px solid transparent",
    borderBottom: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s",
  },
  tabContent: {
    padding: 28,
  },
  copyButton: {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deliverableText: {
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    color: "rgba(255,255,255,0.75)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
    lineHeight: 1.7,
    maxHeight: 600,
    overflowY: "auto",
  },
  errorBanner: {
    padding: "12px 20px",
    borderRadius: 10,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  errorDismiss: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: 18,
    cursor: "pointer",
  },
};
