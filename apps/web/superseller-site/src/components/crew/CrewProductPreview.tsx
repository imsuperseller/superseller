'use client';

import { CrewIcon } from './CrewIcon';
import type { CrewMember } from '@/data/crew';
import * as framer from 'framer-motion';
const { motion } = framer;

/**
 * Stylized product preview mock-up for crew detail pages.
 * Each crew member gets a unique "interface preview" built with CSS.
 */
export function CrewProductPreview({ member }: { member: CrewMember }) {
  return (
    <motion.div
      className="relative rounded-[2rem] overflow-hidden border bg-white/[0.02] backdrop-blur-xl"
      style={{ borderColor: `rgba(${member.accentColorRgb}, 0.15)` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      {/* Faux title bar */}
      <div
        className="flex items-center gap-2 px-6 py-3 border-b"
        style={{ borderColor: `rgba(${member.accentColorRgb}, 0.1)` }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <div className="flex-1 flex justify-center">
          <div
            className="px-4 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{
              background: `rgba(${member.accentColorRgb}, 0.08)`,
              color: member.accentColor,
            }}
          >
            {member.name} Interface
          </div>
        </div>
      </div>

      {/* Product-specific mock-up content */}
      <div className="p-6 min-h-[240px]">
        {getProductMockup(member)}
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: `linear-gradient(to top, rgba(${member.accentColorRgb}, 0.04), transparent)`,
        }}
      />
    </motion.div>
  );
}

function getProductMockup(member: CrewMember) {
  const { accentColor, accentColorRgb } = member;

  switch (member.id) {
    case 'forge':
      return (
        <div className="space-y-4">
          {/* URL input */}
          <div className="flex gap-3">
            <div className="flex-1 h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 flex items-center">
              <span className="text-xs text-white/30 font-mono">your-business.com/listing/123...</span>
            </div>
            <div
              className="h-10 px-4 rounded-lg flex items-center text-xs font-bold text-white"
              style={{ background: accentColor }}
            >
              Generate
            </div>
          </div>
          {/* Video timeline mock */}
          <div className="grid grid-cols-5 gap-2 mt-6">
            {['Living Room', 'Kitchen', 'Master Bed', 'Bathroom', 'Exterior'].map((scene, i) => (
              <div key={scene} className="space-y-1.5">
                <div
                  className="aspect-video rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, rgba(${accentColorRgb}, ${0.08 + i * 0.04}), rgba(${accentColorRgb}, 0.02))`,
                    border: i === 0 ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.05)',
                  }}
                />
                <span className="text-[9px] text-white/30 block text-center">{scene}</span>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full w-3/4 rounded-full" style={{ background: accentColor }} />
            </div>
            <span className="text-[10px] font-mono" style={{ color: accentColor }}>75%</span>
          </div>
        </div>
      );

    case 'spoke':
      return (
        <div className="flex gap-6">
          {/* Left: avatar preview */}
          <div className="w-1/2 space-y-3">
            <div
              className="aspect-[3/4] rounded-2xl flex items-center justify-center"
              style={{
                background: `radial-gradient(ellipse at center, rgba(${accentColorRgb}, 0.08), rgba(${accentColorRgb}, 0.02))`,
                border: `1px solid rgba(${accentColorRgb}, 0.15)`,
              }}
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full mx-auto" style={{ background: `rgba(${accentColorRgb}, 0.12)` }} />
                <div className="text-[10px] text-white/30">Avatar Preview</div>
              </div>
            </div>
          </div>
          {/* Right: waveform + script */}
          <div className="w-1/2 space-y-4">
            {/* Audio waveform */}
            <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `rgba(${accentColorRgb}, 0.1)` }}>
                  <div className="w-0 h-0 border-l-[5px] border-y-[3px] border-y-transparent ml-0.5" style={{ borderLeftColor: accentColor }} />
                </div>
                <span className="text-[10px] text-white/30">Audio Input</span>
              </div>
              <div className="flex items-end gap-px h-8">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${20 + Math.sin(i * 0.7) * 60 + ((i * 7 + 3) % 20)}%`,
                      background: accentColor,
                      opacity: 0.3 + Math.sin(i * 0.5) * 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Script preview */}
            <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-white/30 block mb-2">AI Script</span>
              <div className="space-y-1.5">
                {['Welcome to my...', 'Let me show you...', 'Contact me at...'].map((line) => (
                  <div key={line} className="h-2 rounded-full bg-white/5" style={{ width: `${[78, 92, 65][['Welcome to my...', 'Let me show you...', 'Contact me at...'].indexOf(line)]}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'frontdesk':
      return (
        <div className="space-y-4">
          {/* Live call indicator */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `rgba(${accentColorRgb}, 0.06)`, border: `1px solid rgba(${accentColorRgb}, 0.12)` }}>
            <div className="relative">
              <div className="w-3 h-3 rounded-full" style={{ background: accentColor }} />
              <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ background: accentColor, opacity: 0.4 }} />
            </div>
            <span className="text-xs font-bold" style={{ color: accentColor }}>Live Call — 0:42</span>
            <span className="text-[10px] text-white/30 ml-auto">(310) 555-0147</span>
          </div>
          {/* Chat transcript */}
          <div className="space-y-3">
            {[
              { from: 'caller', text: 'Hi, I need an emergency lockout service at...' },
              { from: 'ai', text: 'I can help! Can I get your exact address and the type of lock?' },
              { from: 'caller', text: '450 Oak Street, it\'s a deadbolt on the front door.' },
              { from: 'ai', text: 'Got it. Dispatching a technician now. ETA 15 minutes.' },
            ].map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'ai' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
                    msg.from === 'ai'
                      ? 'text-white'
                      : 'text-white/60 bg-white/[0.04] border border-white/5'
                  }`}
                  style={msg.from === 'ai' ? { background: `rgba(${accentColorRgb}, 0.12)`, color: 'rgba(255,255,255,0.8)' } : undefined}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'scout':
      return (
        <div className="space-y-4">
          {/* Lead cards */}
          {[
            { name: 'Sarah M.', score: 92, source: 'Facebook Ad', time: '2 min ago' },
            { name: 'James K.', score: 87, source: 'Google Search', time: '8 min ago' },
            { name: 'Lisa R.', score: 78, source: 'Landing Page', time: '15 min ago' },
          ].map((lead, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.02]"
            >
              <div className="w-8 h-8 rounded-full" style={{ background: `rgba(${accentColorRgb}, ${0.15 - i * 0.03})` }} />
              <div className="flex-1">
                <div className="text-xs font-bold text-white">{lead.name}</div>
                <div className="text-[10px] text-white/30">{lead.source}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold" style={{ color: accentColor }}>{lead.score}%</div>
                <div className="text-[10px] text-white/20">{lead.time}</div>
              </div>
            </div>
          ))}
          {/* Score bar */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-white/30">Quality Score</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '86%', background: `linear-gradient(to right, ${accentColor}66, ${accentColor})` }} />
            </div>
            <span className="text-[10px] font-mono" style={{ color: accentColor }}>86</span>
          </div>
        </div>
      );

    case 'buzz':
      return (
        <div className="space-y-4">
          {/* Platform tabs */}
          <div className="flex gap-2">
            {['Instagram', 'Facebook', 'TikTok', 'LinkedIn'].map((platform, i) => (
              <div
                key={platform}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold"
                style={i === 0
                  ? { background: `rgba(${accentColorRgb}, 0.12)`, color: accentColor }
                  : { color: 'rgba(255,255,255,0.3)' }
                }
              >
                {platform}
              </div>
            ))}
          </div>
          {/* Post preview grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg"
                style={{
                  background: `linear-gradient(${135 + i * 30}deg, rgba(${accentColorRgb}, ${0.06 + i * 0.02}), rgba(${accentColorRgb}, 0.01))`,
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              />
            ))}
          </div>
          {/* Schedule bar */}
          <div className="flex items-center gap-3 p-2 rounded-lg border border-white/5">
            <span className="text-[10px] text-white/30">Next post:</span>
            <span className="text-[10px] font-bold" style={{ color: accentColor }}>Today 6:00 PM</span>
            <span className="text-[10px] text-white/20 ml-auto">Auto-scheduled</span>
          </div>
        </div>
      );

    case 'cortex':
      return (
        <div className="space-y-4">
          {/* Search input */}
          <div className="flex gap-3">
            <div className="flex-1 h-10 rounded-lg border border-white/10 bg-white/[0.02] px-3 flex items-center">
              <span className="text-xs text-white/30">What&apos;s our refund policy for...</span>
            </div>
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ background: `rgba(${accentColorRgb}, 0.12)` }}
            >
              <CrewIcon name="Brain" className="w-4 h-4" style={{ color: accentColor }} />
            </div>
          </div>
          {/* Answer block */}
          <div className="p-4 rounded-xl" style={{ background: `rgba(${accentColorRgb}, 0.04)`, border: `1px solid rgba(${accentColorRgb}, 0.1)` }}>
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-white/8 w-full" />
              <div className="h-2 rounded-full bg-white/6 w-[90%]" />
              <div className="h-2 rounded-full bg-white/5 w-[75%]" />
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <span className="text-[10px] text-white/30">Source: company-handbook.pdf, page 12</span>
            </div>
          </div>
          {/* Related docs */}
          <div className="grid grid-cols-2 gap-2">
            {['Refund Policy', 'Customer FAQ', 'SLA Terms', 'Pricing Guide'].map((doc) => (
              <div key={doc} className="p-2 rounded-lg border border-white/5 bg-white/[0.02] text-[10px] text-white/30">
                {doc}
              </div>
            ))}
          </div>
        </div>
      );

    case 'market':
      return (
        <div className="space-y-4">
          {/* Listing queue */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: `rgba(${accentColorRgb}, 0.06)`, border: `1px solid rgba(${accentColorRgb}, 0.12)` }}>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 rounded-full" style={{ background: accentColor }} />
                <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ background: accentColor, opacity: 0.4 }} />
              </div>
              <span className="text-xs font-bold" style={{ color: accentColor }}>24/7 Auto-Posting</span>
            </div>
            <span className="text-[10px] text-white/30">147 listed today</span>
          </div>
          {/* Listing cards */}
          {[
            { title: 'Professional Garage Door Repair', city: 'Dallas, TX', status: 'posted' },
            { title: 'Emergency Lockout Service 24/7', city: 'Plano, TX', status: 'posting' },
            { title: 'Custom Kitchen Renovation', city: 'Frisco, TX', status: 'queued' },
          ].map((listing, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="w-10 h-10 rounded-lg" style={{ background: `rgba(${accentColorRgb}, ${0.08 + i * 0.04})` }} />
              <div className="flex-1">
                <div className="text-[11px] font-bold text-white">{listing.title}</div>
                <div className="text-[10px] text-white/30">{listing.city}</div>
              </div>
              <div
                className="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                style={{
                  background: listing.status === 'posted' ? 'rgba(34,197,94,0.1)' : `rgba(${accentColorRgb}, 0.1)`,
                  color: listing.status === 'posted' ? '#22c55e' : accentColor,
                }}
              >
                {listing.status}
              </div>
            </div>
          ))}
          {/* Location rotation */}
          <div className="flex flex-wrap gap-1.5">
            {['Dallas', 'Fort Worth', 'Plano', 'Arlington', 'Frisco', '+25'].map((city) => (
              <span key={city} className="px-2 py-1 rounded-md text-[9px] text-white/30 border border-white/5 bg-white/[0.02]">
                {city}
              </span>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
