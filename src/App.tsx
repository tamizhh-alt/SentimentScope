import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import InputSection from './components/InputSection';
import Dashboard from './components/Dashboard';
import ResultsSection from './components/ResultsSection';
import { AnalysisProvider } from './context/AnalysisContext';

function App() {
  const [currentView, setCurrentView] = useState<'input' | 'results' | 'dashboard'>('input');

  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        
        <motion.main 
          className="container mx-auto px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {currentView === 'input' && (
            <>
              <Hero />
              <InputSection onAnalysisComplete={() => setCurrentView('results')} />
            </>
          )}
          
          {currentView === 'results' && (
            <ResultsSection onViewDashboard={() => setCurrentView('dashboard')} />
          )}
          
          {currentView === 'dashboard' && (
            <Dashboard />
          )}
        </motion.main>
      </div>
    </AnalysisProvider>
  );
}

export default App;