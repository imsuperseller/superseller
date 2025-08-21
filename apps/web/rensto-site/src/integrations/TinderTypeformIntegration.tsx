
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
      const customerProfilePath = `data/customers/${customerId}/tinder-typeform-results.json`;
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
