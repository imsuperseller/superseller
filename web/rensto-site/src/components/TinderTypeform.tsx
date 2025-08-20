
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
                style={{ width: `${((currentDecisionIndex + 1) / decisions.length) * 100}%` }}
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
                    style={{ backgroundColor: `${option.color}20` }}
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
