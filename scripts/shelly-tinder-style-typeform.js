#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';

/**
 * 🎯 SHELLY'S TINDER-STYLE TYPEFORM - HEBREW JOURNEY
 * 
 * This script creates a Tinder-style swiping interface for Shelly's Typeform:
 * 1. Tinder-style card swiping for decisions
 * 2. Side-by-side decision cards
 * 3. Smooth animations and transitions
 * 4. Hebrew RTL support
 * 5. Decision tracking and analytics
 * 6. Integration with existing Hebrew journey
 */

class ShellyTinderStyleTypeform {
    constructor() {
        this.customerId = 'shelly-mizrahi';
        this.decisions = [];
        this.currentDecisionIndex = 0;
        this.swipeHistory = [];
    }

    async createTinderStyleTypeform() {
        console.log('🎯 SHELLY\'S TINDER-STYLE TYPEFORM - HEBREW JOURNEY');
        console.log('==================================================');

        try {
            // Step 1: Create Tinder-style decision cards
            await this.createDecisionCards();

            // Step 2: Create Tinder-style interface
            await this.createTinderInterface();

            // Step 3: Create swipe animations
            await this.createSwipeAnimations();

            // Step 4: Create decision tracking
            await this.createDecisionTracking();

            // Step 5: Create Hebrew RTL support
            await this.createHebrewRTLSupport();

            // Step 6: Create integration with existing journey
            await this.createJourneyIntegration();

            console.log('\n🎉 TINDER-STYLE TYPEFORM IMPLEMENTED SUCCESSFULLY!');
            return true;

        } catch (error) {
            console.error('❌ Tinder-style Typeform implementation failed:', error.message);
            return false;
        }
    }

    async createDecisionCards() {
        console.log('\n🎴 Creating Tinder-style Decision Cards...');

        // Tinder-style decision cards for Shelly's Hebrew journey
        this.decisions = [
            {
                id: 'automation-type',
                title: 'איזה סוג אוטומציה אתה צריך?',
                description: 'בחר את סוג האוטומציה המתאים ביותר לעסק שלך',
                options: [
                    {
                        id: 'content-automation',
                        title: 'אוטומציית תוכן',
                        description: 'יצירת תוכן אוטומטית לבלוגים, פוסטים ופרסומים',
                        icon: '📝',
                        color: '#fe3d51',
                        benefits: ['חוסך 10 שעות בשבוע', 'תוכן איכותי', 'עקביות']
                    },
                    {
                        id: 'data-processing',
                        title: 'עיבוד נתונים',
                        description: 'עיבוד וניתוח קבצי אקסל ונתונים',
                        icon: '📊',
                        color: '#1eaef7',
                        benefits: ['חוסך 15 שעות בשבוע', 'דיוק גבוה', 'דוחות אוטומטיים']
                    },
                    {
                        id: 'communication',
                        title: 'אוטומציית תקשורת',
                        description: 'ניהול תקשורת אוטומטית עם לקוחות',
                        icon: '💬',
                        color: '#bf5700',
                        benefits: ['חוסך 8 שעות בשבוע', 'תגובות מהירות', 'מעקב אוטומטי']
                    },
                    {
                        id: 'workflow',
                        title: 'אוטומציית תהליכים',
                        description: 'אוטומציה של תהליכים עסקיים מורכבים',
                        icon: '⚙️',
                        color: '#5ffbfd',
                        benefits: ['חוסך 20 שעות בשבוע', 'יעילות גבוהה', 'פחות שגיאות']
                    }
                ]
            },
            {
                id: 'current-process',
                title: 'תאר את התהליך הנוכחי שלך',
                description: 'איך אתה עושה את זה עכשיו?',
                options: [
                    {
                        id: 'manual-process',
                        title: 'תהליך ידני',
                        description: 'עושה הכל ביד, לוקח הרבה זמן',
                        icon: '✋',
                        color: '#fe3d51',
                        benefits: ['שליטה מלאה', 'פשוט להבנה', 'ללא תלות בטכנולוגיה']
                    },
                    {
                        id: 'basic-tools',
                        title: 'כלים בסיסיים',
                        description: 'משתמש באקסל, וורד, כלים פשוטים',
                        icon: '🛠️',
                        color: '#1eaef7',
                        benefits: ['מוכר ופשוט', 'ללא עלות נוספת', 'גמישות']
                    },
                    {
                        id: 'partial-automation',
                        title: 'אוטומציה חלקית',
                        description: 'יש כבר חלק מהתהליכים אוטומטיים',
                        icon: '🔧',
                        color: '#bf5700',
                        benefits: ['חלק מהעבודה נעשה', 'ניסיון קיים', 'יכולת שיפור']
                    },
                    {
                        id: 'advanced-tools',
                        title: 'כלים מתקדמים',
                        description: 'משתמש בכלים מתקדמים אבל לא אוטומטיים',
                        icon: '🚀',
                        color: '#5ffbfd',
                        benefits: ['יכולות מתקדמות', 'יעילות גבוהה', 'מוכן לאוטומציה']
                    }
                ]
            },
            {
                id: 'weekly-hours',
                title: 'כמה שעות בשבוע זה לוקח כרגע?',
                description: 'בחר את טווח השעות המתאים',
                options: [
                    {
                        id: '1-5-hours',
                        title: '1-5 שעות',
                        description: 'תהליך קל, לא לוקח הרבה זמן',
                        icon: '⏰',
                        color: '#5ffbfd',
                        benefits: ['זמן קצר', 'פשוט', 'לא דחוף']
                    },
                    {
                        id: '5-10-hours',
                        title: '5-10 שעות',
                        description: 'תהליך בינוני, לוקח זמן משמעותי',
                        icon: '⏱️',
                        color: '#1eaef7',
                        benefits: ['חיסכון משמעותי', 'ROI גבוה', 'שווה השקעה']
                    },
                    {
                        id: '10-20-hours',
                        title: '10-20 שעות',
                        description: 'תהליך מורכב, לוקח הרבה זמן',
                        icon: '⏲️',
                        color: '#bf5700',
                        benefits: ['חיסכון גדול', 'יעילות גבוהה', 'ערך עסקי גבוה']
                    },
                    {
                        id: '20-plus-hours',
                        title: '20+ שעות',
                        description: 'תהליך מורכב מאוד, לוקח הרבה זמן',
                        icon: '🕐',
                        color: '#fe3d51',
                        benefits: ['חיסכון עצום', 'ROI גבוה מאוד', 'דחוף לאוטומציה']
                    }
                ]
            },
            {
                id: 'business-value',
                title: 'מה תהיה הערך העסקי של אוטומציה?',
                description: 'בחר את הערך העסקי המתאים',
                options: [
                    {
                        id: 'time-savings',
                        title: 'חיסכון בזמן',
                        description: 'חסוך זמן לעבודה על דברים חשובים יותר',
                        icon: '⏰',
                        color: '#5ffbfd',
                        benefits: ['יותר זמן לגדילה', 'פחות לחץ', 'יעילות גבוהה']
                    },
                    {
                        id: 'cost-reduction',
                        title: 'הפחתת עלויות',
                        description: 'חסוך כסף על שכר ועלויות תפעול',
                        icon: '💰',
                        color: '#1eaef7',
                        benefits: ['ROI מהיר', 'חיסכון כספי', 'יעילות תפעולית']
                    },
                    {
                        id: 'quality-improvement',
                        title: 'שיפור איכות',
                        description: 'שיפור איכות התוצרים והשירות',
                        icon: '⭐',
                        color: '#bf5700',
                        benefits: ['איכות גבוהה', 'שביעות רצון לקוחות', 'מוניטין טוב']
                    },
                    {
                        id: 'scalability',
                        title: 'יכולת צמיחה',
                        description: 'אפשרות לגדול ולטפל ביותר לקוחות',
                        icon: '📈',
                        color: '#fe3d51',
                        benefits: ['צמיחה מהירה', 'יותר לקוחות', 'הכנסות גבוהות']
                    }
                ]
            },
            {
                id: 'timeline',
                title: 'מה לוח הזמנים שלך?',
                description: 'בחר את לוח הזמנים המתאים',
                options: [
                    {
                        id: '1-2-weeks',
                        title: '1-2 שבועות',
                        description: 'דחוף מאוד, צריך פתרון מהיר',
                        icon: '🚨',
                        color: '#fe3d51',
                        benefits: ['פתרון מהיר', 'חיסכון מיידי', 'יעילות מידית']
                    },
                    {
                        id: '1-month',
                        title: 'חודש',
                        description: 'דחוף, אבל יש זמן לתכנון',
                        icon: '📅',
                        color: '#bf5700',
                        benefits: ['תכנון טוב', 'יישום מסודר', 'תוצאות מהירות']
                    },
                    {
                        id: '2-3-months',
                        title: '2-3 חודשים',
                        description: 'יש זמן לתכנון ויישום מסודר',
                        icon: '📋',
                        color: '#1eaef7',
                        benefits: ['תכנון מקיף', 'יישום איכותי', 'תוצאות מיטביות']
                    },
                    {
                        id: 'no-rush',
                        title: 'אין דחיפות',
                        description: 'יש זמן, רוצה פתרון איכותי',
                        icon: '🌱',
                        color: '#5ffbfd',
                        benefits: ['פיתוח איכותי', 'תכנון מקיף', 'תוצאות מיטביות']
                    }
                ]
            }
        ];

        // Save decisions to file
        const decisionsPath = `data/customers/${this.customerId}/tinder-decisions.json`;
        await fs.mkdir(path.dirname(decisionsPath), { recursive: true });
        await fs.writeFile(decisionsPath, JSON.stringify(this.decisions, null, 2));

        console.log('✅ Tinder-style Decision Cards created');
        return this.decisions;
    }

    async createTinderInterface() {
        console.log('\n🎨 Creating Tinder-style Interface...');

        const tinderInterface = `
import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Heart, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface DecisionCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  benefits: string[];
}

interface Decision {
  id: string;
  title: string;
  description: string;
  options: DecisionCard[];
}

interface TinderTypeformProps {
  decisions: Decision[];
  onComplete: (results: any) => void;
  language?: 'he' | 'en';
}

export default function TinderTypeform({ decisions, onComplete, language = 'he' }: TinderTypeformProps) {
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [swipeHistory, setSwipeHistory] = useState<Array<{ decisionId: string; optionId: string; direction: 'left' | 'right' }>>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentDecision = decisions[currentDecisionIndex];
  const controls = useAnimation();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // RTL Support
  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleSwipe = async (direction: 'left' | 'right', optionId: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Add to swipe history
    setSwipeHistory(prev => [...prev, {
      decisionId: currentDecision.id,
      optionId,
      direction
    }]);

    // Update selected options
    setSelectedOptions(prev => ({
      ...prev,
      [currentDecision.id]: optionId
    }));

    // Animate card out
    const cardIndex = currentDecision.options.findIndex(option => option.id === optionId);
    const cardRef = cardRefs.current[cardIndex];
    
    if (cardRef) {
      await controls.start({
        x: direction === 'right' ? 300 : -300,
        y: direction === 'right' ? 50 : -50,
        rotate: direction === 'right' ? 15 : -15,
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
      });
    }

    // Move to next decision or complete
    setTimeout(() => {
      if (currentDecisionIndex < decisions.length - 1) {
        setCurrentDecisionIndex(prev => prev + 1);
        controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
      } else {
        onComplete(selectedOptions);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleCardDrag = (event: any, info: PanInfo, optionId: string) => {
    const { offset } = info;
    const threshold = 100;
    
    if (Math.abs(offset.x) > threshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      handleSwipe(direction, optionId);
    }
  };

  const goBack = () => {
    if (currentDecisionIndex > 0) {
      setCurrentDecisionIndex(prev => prev - 1);
      // Remove last swipe from history
      setSwipeHistory(prev => prev.slice(0, -1));
      // Remove last selection
      const newSelectedOptions = { ...selectedOptions };
      delete newSelectedOptions[decisions[currentDecisionIndex - 1].id];
      setSelectedOptions(newSelectedOptions);
    }
  };

  if (!currentDecision) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rensto-dark via-rensto-card to-rensto-dark p-4 hebrew-rtl">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rensto-red via-rensto-orange to-rensto-blue bg-clip-text text-transparent mb-2">
            {language === 'he' ? 'בחר את האפשרות המתאימה' : 'Choose the Right Option'}
          </h1>
          <p className="text-rensto-text/70">
            {language === 'he' ? 'גרור ימינה או שמאלה לבחירה' : 'Swipe right or left to choose'}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-rensto-text/60 mb-2">
              <span>{language === 'he' ? 'התקדמות' : 'Progress'}</span>
              <span>{currentDecisionIndex + 1} / {decisions.length}</span>
            </div>
            <div className="w-full bg-rensto-card rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-rensto-red to-rensto-orange h-2 rounded-full transition-all duration-300"
                style={{ width: \`\${((currentDecisionIndex + 1) / decisions.length) * 100}%\` }}
              />
            </div>
          </div>
        </div>

        {/* Current Decision */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-rensto-text mb-2">
            {currentDecision.title}
          </h2>
          <p className="text-rensto-text/70">
            {currentDecision.description}
          </p>
        </div>

        {/* Decision Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {currentDecision.options.map((option, index) => (
            <motion.div
              key={option.id}
              ref={el => cardRefs.current[index] = el}
              className="relative cursor-pointer"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(event, info) => handleCardDrag(event, info, option.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="bg-rensto-card rounded-2xl p-6 border border-rensto-border shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ borderLeftColor: option.color, borderLeftWidth: '4px' }}
                animate={controls}
              >
                {/* Card Header */}
                <div className="flex items-center mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4"
                    style={{ backgroundColor: \`\${option.color}20\` }}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-rensto-text">
                      {option.title}
                    </h3>
                    <p className="text-rensto-text/70 text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-rensto-text mb-2">
                    {language === 'he' ? 'יתרונות:' : 'Benefits:'}
                  </h4>
                  {option.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-sm text-rensto-text/80">
                      <div 
                        className="w-2 h-2 rounded-full mr-3"
                        style={{ backgroundColor: option.color }}
                      />
                      {benefit}
                    </div>
                  ))}
                </div>

                {/* Swipe Indicators */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
                    <X className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goBack}
            disabled={currentDecisionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-rensto-card text-rensto-text rounded-lg hover:bg-rensto-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'he' ? 'חזור' : 'Back'}</span>
          </button>

          <div className="text-center">
            <p className="text-rensto-text/60 text-sm">
              {language === 'he' ? 'גרור ימינה או שמאלה לבחירה' : 'Swipe right or left to choose'}
            </p>
          </div>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Swipe History */}
        {swipeHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-rensto-text mb-4">
              {language === 'he' ? 'בחירות קודמות:' : 'Previous Choices:'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {swipeHistory.map((swipe, index) => {
                const decision = decisions.find(d => d.id === swipe.decisionId);
                const option = decision?.options.find(o => o.id === swipe.optionId);
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-3 py-1 bg-rensto-card rounded-full text-sm"
                  >
                    <span className="text-rensto-text/70">{decision?.title}</span>
                    <span className="text-rensto-text">→</span>
                    <span className="font-semibold text-rensto-text">{option?.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;

        // Save Tinder interface to file
        const interfacePath = `web/rensto-site/src/components/TinderTypeform.tsx`;
        await fs.mkdir(path.dirname(interfacePath), { recursive: true });
        await fs.writeFile(interfacePath, tinderInterface);

        console.log('✅ Tinder-style Interface created');
        return tinderInterface;
    }

    async createSwipeAnimations() {
        console.log('\n🎬 Creating Swipe Animations...');

        const swipeAnimations = `
/* Tinder-style Swipe Animations */
@keyframes swipeRight {
  0% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(300px) rotate(15deg);
    opacity: 0;
  }
}

@keyframes swipeLeft {
  0% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(-300px) rotate(-15deg);
    opacity: 0;
  }
}

@keyframes cardHover {
  0% {
    transform: translateY(0) scale(1);
  }
  100% {
    transform: translateY(-5px) scale(1.02);
  }
}

@keyframes cardTap {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes progressFill {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes xShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

/* RTL Support for Hebrew */
.hebrew-rtl .swipe-card {
  direction: rtl;
}

.hebrew-rtl .swipe-indicators {
  flex-direction: row-reverse;
}

.hebrew-rtl .card-content {
  text-align: right;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tinder-grid {
    grid-template-columns: 1fr;
  }
  
  .swipe-card {
    margin: 0 1rem;
  }
}

/* Accessibility */
.swipe-card:focus {
  outline: 2px solid #1eaef7;
  outline-offset: 2px;
}

.swipe-card:focus-visible {
  outline: 2px solid #1eaef7;
  outline-offset: 2px;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .swipe-card {
    border: 2px solid #ffffff;
  }
  
  .swipe-indicators {
    border: 1px solid #ffffff;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .swipe-card {
    transition: none;
  }
  
  .swipe-animation {
    animation: none;
  }
}
`;

        // Save swipe animations to file
        const animationsPath = `web/rensto-site/src/styles/tinder-animations.css`;
        await fs.mkdir(path.dirname(animationsPath), { recursive: true });
        await fs.writeFile(animationsPath, swipeAnimations);

        console.log('✅ Swipe Animations created');
        return swipeAnimations;
    }

    async createDecisionTracking() {
        console.log('\n📊 Creating Decision Tracking...');

        const decisionTracking = `
import { useState, useEffect } from 'react';

interface DecisionTracker {
  decisionId: string;
  optionId: string;
  direction: 'left' | 'right';
  timestamp: number;
  timeSpent: number;
  confidence: number;
}

interface DecisionAnalytics {
  totalDecisions: number;
  averageTimePerDecision: number;
  mostPopularOptions: Record<string, number>;
  swipePatterns: Array<{ decisionId: string; pattern: string }>;
  completionRate: number;
}

export class TinderDecisionTracker {
  private decisions: DecisionTracker[] = [];
  private startTimes: Record<string, number> = {};

  startDecision(decisionId: string) {
    this.startTimes[decisionId] = Date.now();
  }

  recordDecision(decisionId: string, optionId: string, direction: 'left' | 'right', confidence: number = 0.8) {
    const startTime = this.startTimes[decisionId] || Date.now();
    const timeSpent = Date.now() - startTime;

    this.decisions.push({
      decisionId,
      optionId,
      direction,
      timestamp: Date.now(),
      timeSpent,
      confidence
    });

    // Remove start time
    delete this.startTimes[decisionId];
  }

  getAnalytics(): DecisionAnalytics {
    const totalDecisions = this.decisions.length;
    const averageTimePerDecision = totalDecisions > 0 
      ? this.decisions.reduce((sum, d) => sum + d.timeSpent, 0) / totalDecisions 
      : 0;

    // Count most popular options
    const optionCounts: Record<string, number> = {};
    this.decisions.forEach(decision => {
      optionCounts[decision.optionId] = (optionCounts[decision.optionId] || 0) + 1;
    });

    // Analyze swipe patterns
    const swipePatterns = this.decisions.reduce((patterns, decision) => {
      const existing = patterns.find(p => p.decisionId === decision.decisionId);
      if (existing) {
        existing.pattern += decision.direction === 'right' ? 'R' : 'L';
      } else {
        patterns.push({
          decisionId: decision.decisionId,
          pattern: decision.direction === 'right' ? 'R' : 'L'
        });
      }
      return patterns;
    }, [] as Array<{ decisionId: string; pattern: string }>);

    return {
      totalDecisions,
      averageTimePerDecision,
      mostPopularOptions: optionCounts,
      swipePatterns,
      completionRate: totalDecisions / 5 // Assuming 5 decisions total
    };
  }

  exportData() {
    return {
      decisions: this.decisions,
      analytics: this.getAnalytics(),
      timestamp: new Date().toISOString()
    };
  }

  clearData() {
    this.decisions = [];
    this.startTimes = {};
  }
}

// React Hook for Decision Tracking
export function useDecisionTracking() {
  const [tracker] = useState(() => new TinderDecisionTracker());
  const [analytics, setAnalytics] = useState<DecisionAnalytics | null>(null);

  const startDecision = (decisionId: string) => {
    tracker.startDecision(decisionId);
  };

  const recordDecision = (decisionId: string, optionId: string, direction: 'left' | 'right', confidence?: number) => {
    tracker.recordDecision(decisionId, optionId, direction, confidence);
    setAnalytics(tracker.getAnalytics());
  };

  const getAnalytics = () => {
    return tracker.getAnalytics();
  };

  const exportData = () => {
    return tracker.exportData();
  };

  const clearData = () => {
    tracker.clearData();
    setAnalytics(null);
  };

  return {
    startDecision,
    recordDecision,
    getAnalytics,
    exportData,
    clearData,
    analytics
  };
}
`;

        // Save decision tracking to file
        const trackingPath = `web/rensto-site/src/hooks/useDecisionTracking.ts`;
        await fs.mkdir(path.dirname(trackingPath), { recursive: true });
        await fs.writeFile(trackingPath, decisionTracking);

        console.log('✅ Decision Tracking created');
        return decisionTracking;
    }

    async createHebrewRTLSupport() {
        console.log('\n📝 Creating Hebrew RTL Support...');

        const hebrewRTLSupport = `
/* Hebrew RTL Support for Tinder Typeform */

.hebrew-rtl {
  direction: rtl;
  text-align: right;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.hebrew-rtl .tinder-grid {
  direction: rtl;
}

.hebrew-rtl .swipe-card {
  direction: rtl;
  text-align: right;
}

.hebrew-rtl .card-header {
  flex-direction: row-reverse;
}

.hebrew-rtl .card-icon {
  margin-left: 1rem;
  margin-right: 0;
}

.hebrew-rtl .swipe-indicators {
  flex-direction: row-reverse;
}

.hebrew-rtl .navigation-buttons {
  flex-direction: row-reverse;
}

.hebrew-rtl .progress-bar {
  direction: ltr; /* Keep progress bar left-to-right */
}

.hebrew-rtl .swipe-history {
  direction: rtl;
}

.hebrew-rtl .history-item {
  flex-direction: row-reverse;
}

/* Hebrew-specific animations */
.hebrew-rtl .swipe-right {
  animation: swipeRightRTL 0.3s ease-out;
}

.hebrew-rtl .swipe-left {
  animation: swipeLeftRTL 0.3s ease-out;
}

@keyframes swipeRightRTL {
  0% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(-300px) rotate(-15deg);
    opacity: 0;
  }
}

@keyframes swipeLeftRTL {
  0% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(300px) rotate(15deg);
    opacity: 0;
  }
}

/* Hebrew text styling */
.hebrew-rtl .hebrew-text {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  letter-spacing: 0.5px;
}

.hebrew-rtl .hebrew-title {
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.4;
}

.hebrew-rtl .hebrew-description {
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
}

/* Hebrew number formatting */
.hebrew-rtl .hebrew-number {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

/* Hebrew date formatting */
.hebrew-rtl .hebrew-date {
  direction: rtl;
  unicode-bidi: embed;
}
`;

        // Save Hebrew RTL support to file
        const rtlPath = `web/rensto-site/src/styles/hebrew-rtl.css`;
        await fs.mkdir(path.dirname(rtlPath), { recursive: true });
        await fs.writeFile(rtlPath, hebrewRTLSupport);

        console.log('✅ Hebrew RTL Support created');
        return hebrewRTLSupport;
    }

    async createJourneyIntegration() {
        console.log('\n🔗 Creating Journey Integration...');

        const journeyIntegration = `
import { TinderTypeform } from '../components/TinderTypeform';
import { useDecisionTracking } from '../hooks/useDecisionTracking';
import { enhancedMCPEcosystem } from '../../../infra/mcp-servers/enhanced-mcp-ecosystem.js';

interface TinderTypeformIntegrationProps {
  customerId: string;
  onComplete: (results: any) => void;
  language?: 'he' | 'en';
}

export function TinderTypeformIntegration({ 
  customerId, 
  onComplete, 
  language = 'he' 
}: TinderTypeformIntegrationProps) {
  const { startDecision, recordDecision, exportData } = useDecisionTracking();

  const handleDecisionStart = (decisionId: string) => {
    startDecision(decisionId);
  };

  const handleDecisionComplete = (decisionId: string, optionId: string, direction: 'left' | 'right') => {
    recordDecision(decisionId, optionId, direction);
  };

  const handleTypeformComplete = async (results: any) => {
    try {
      // Export decision data
      const decisionData = exportData();
      
      // Save to customer profile
      const customerProfilePath = \`data/customers/\${customerId}/tinder-typeform-results.json\`;
      await fs.writeFile(customerProfilePath, JSON.stringify({
        results,
        decisionData,
        timestamp: new Date().toISOString(),
        language
      }, null, 2));

      // Send to MCP ecosystem for processing
      const mcpResults = await enhancedMCPEcosystem.executeStep('typeform.processResults', {
        customerId,
        results,
        decisionData,
        language,
        type: 'tinder-style'
      });

      // Update customer portal
      await enhancedMCPEcosystem.executeStep('portal.updateCustomerData', {
        customerId,
        data: {
          typeformCompleted: true,
          typeformResults: results,
          decisionAnalytics: decisionData.analytics,
          lastUpdated: new Date().toISOString()
        }
      });

      // Call original onComplete
      onComplete({
        results,
        decisionData,
        mcpResults
      });

    } catch (error) {
      console.error('Error processing Tinder Typeform results:', error);
      // Still call onComplete with basic results
      onComplete({ results, error: error.message });
    }
  };

  return (
    <TinderTypeform
      decisions={decisions}
      onComplete={handleTypeformComplete}
      language={language}
      onDecisionStart={handleDecisionStart}
      onDecisionComplete={handleDecisionComplete}
    />
  );
}

// Integration with existing Hebrew journey
export function integrateTinderTypeform() {
  return {
    component: TinderTypeformIntegration,
    props: {
      customerId: 'shelly-mizrahi',
      language: 'he',
      onComplete: (results) => {
        console.log('Tinder Typeform completed:', results);
        // Continue with Hebrew journey
        continueHebrewJourney(results);
      }
    }
  };
}

async function continueHebrewJourney(typeformResults) {
  // Continue with existing Hebrew journey flow
  const hebrewJourney = await enhancedMCPEcosystem.executeStep('hebrew.continueJourney', {
    customerId: 'shelly-mizrahi',
    typeformResults,
    nextStep: 'ai-planning'
  });
  
  return hebrewJourney;
}
`;

        // Save journey integration to file
        const integrationPath = `web/rensto-site/src/integrations/TinderTypeformIntegration.tsx`;
        await fs.mkdir(path.dirname(integrationPath), { recursive: true });
        await fs.writeFile(integrationPath, journeyIntegration);

        console.log('✅ Journey Integration created');
        return journeyIntegration;
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tinderTypeform = new ShellyTinderStyleTypeform();
    tinderTypeform.createTinderStyleTypeform()
        .then(success => {
            if (success) {
                console.log('\n🎉 TINDER-STYLE TYPEFORM READY!');
                console.log('📋 What\'s implemented:');
                console.log('  ✅ Tinder-style Decision Cards');
                console.log('  ✅ Tinder-style Interface with Swipe Animations');
                console.log('  ✅ Decision Tracking and Analytics');
                console.log('  ✅ Hebrew RTL Support');
                console.log('  ✅ Journey Integration');
                console.log('  ✅ Complete Tinder Experience');
                process.exit(0);
            } else {
                console.log('\n❌ Tinder-style Typeform implementation failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Tinder-style Typeform execution failed:', error);
            process.exit(1);
        });
}

export { ShellyTinderStyleTypeform };
