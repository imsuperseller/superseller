
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
