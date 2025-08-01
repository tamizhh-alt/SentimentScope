import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnalysisResult } from '../types';

interface AnalysisContextType {
  analysisResults: AnalysisResult[];
  addAnalysisResult: (result: AnalysisResult) => void;
  clearResults: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  const addAnalysisResult = (result: AnalysisResult) => {
    setAnalysisResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setAnalysisResults([]);
  };

  return (
    <AnalysisContext.Provider value={{ analysisResults, addAnalysisResult, clearResults }}>
      {children}
    </AnalysisContext.Provider>
  );
};