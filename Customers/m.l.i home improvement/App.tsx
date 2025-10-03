import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import EstimationForm from './components/EstimationForm';
import EstimateResults from './components/EstimateResults';
import LoadingSpinner from './components/LoadingSpinner';
import type { ProjectDetails, Estimate } from './types';
import { generateEstimate } from './services/geminiService';

type AppState = 'form' | 'loading' | 'results' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('form');
  const [estimateData, setEstimateData] = useState<Estimate | null>(null);
  const [userImages, setUserImages] = useState<ProjectDetails['images']>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleGenerateEstimate = useCallback(async (details: ProjectDetails) => {
    setAppState('loading');
    setErrorMessage('');
    setUserImages(details.images); // Store user images for the results page
    try {
      const result = await generateEstimate(details);
      setEstimateData(result);
      setAppState('results');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'אירעה שגיאה לא ידועה.';
      setErrorMessage(message);
      setAppState('error');
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState('form');
    setEstimateData(null);
    setErrorMessage('');
    setUserImages([]);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <LoadingSpinner />;
      case 'results':
        return estimateData ? <EstimateResults estimate={estimateData} userImages={userImages} onReset={handleReset} /> : null;
      case 'error':
          return (
            <div className="text-center bg-surface p-8 rounded-lg shadow-md max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-red-600">יצירת האומדן נכשלה</h2>
              <p className="text-textSecondary my-4">{errorMessage}</p>
              <button onClick={handleReset} className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-800">
                נסה שנית
              </button>
            </div>
          );
      case 'form':
      default:
        return <EstimationForm onSubmit={handleGenerateEstimate} isLoading={false} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex items-center justify-center">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;