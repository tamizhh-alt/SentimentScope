import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Type, FileText, Loader, CheckCircle } from 'lucide-react';
import TextInput from './TextInput';
import FileUpload from './FileUpload';
import { useAnalysis } from '../context/AnalysisContext';

interface InputSectionProps {
  onAnalysisComplete: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalysisComplete }) => {
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { addAnalysisResult } = useAnalysis();

  const inputMethods = [
    {
      id: 'text' as const,
      label: 'Text Input',
      icon: Type,
      description: 'Analyze individual text entries',
    },
    {
      id: 'file' as const,
      label: 'File Upload',
      icon: Upload,
      description: 'Batch process CSV, JSON, or Excel files',
    },
  ];

  const handleAnalysis = async (data: any) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Normalize backend result into AnalysisResult
      const normalized = {
        id: data.id || Date.now().toString(),
        timestamp: data.timestamp || new Date().toISOString(),
        type: inputMethod,
        text: data.text,
        file: data.file,
        sentiment: {
          label: data.sentiment?.label || 'neutral',
          confidence: data.sentiment?.confidence ?? 0.5,
          scores: data.sentiment?.scores || {},
        },
        emotions: Array.isArray(data.emotions)
          ? data.emotions.reduce((acc: Record<string, number>, e: any) => {
              const key = String(e.label || '').toLowerCase();
              const val = typeof e.percent === 'number' ? e.percent / 100 : (e.score ?? 0);
              if (Number.isFinite(val)) acc[key] = val;
              return acc;
            }, {})
          : (data.emotions || {}),
        keywords: data.keywords || [],
        summary: data.summary || null,
        language: data.language || null,
        processingTime: data.processingTime || 0,
        raw: data,
      };

      addAnalysisResult(normalized as any);

      // Complete progress
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      // Small delay to show completion
      setTimeout(() => {
        setIsProcessing(false);
        onAnalysisComplete();
      }, 500);
      
    } catch (error) {
      console.error('Analysis processing error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Input Method</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select how you'd like to input your data for sentiment analysis. 
            You can analyze individual text or upload files for batch processing.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 flex space-x-2 shadow-lg border border-white/20">
            {inputMethods.map((method) => {
              const Icon = method.icon;
              const isActive = inputMethod === method.id;
              
              return (
                <motion.button
                  key={method.id}
                  onClick={() => setInputMethod(method.id)}
                  disabled={isProcessing}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                  whileHover={{ scale: !isProcessing ? 1.02 : 1 }}
                  whileTap={{ scale: !isProcessing ? 0.98 : 1 }}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">{method.label}</div>
                    <div className="text-xs opacity-80">{method.description}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-12 text-center shadow-lg border border-white/20"
            >
              <div className="flex items-center justify-center mb-4">
                {processingProgress === 100 ? (
                  <CheckCircle className="w-12 h-12 text-green-600" />
                ) : (
                  <Loader className="w-12 h-12 text-primary-600 animate-spin" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {processingProgress === 100 ? 'Analysis Complete!' : 'Processing Your Data'}
              </h3>
              <p className="text-gray-600 mb-6">
                {processingProgress === 100 
                  ? 'Your sentiment analysis is ready to view'
                  : 'Our AI models are analyzing your content...'
                }
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <motion.div
                  className="bg-gradient-to-r from-primary-600 to-accent-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${processingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-500">{processingProgress}% complete</p>
            </motion.div>
          ) : (
            <motion.div
              key={inputMethod}
              initial={{ opacity: 0, x: inputMethod === 'text' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: inputMethod === 'text' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {inputMethod === 'text' ? (
                <TextInput onAnalyze={handleAnalysis} />
              ) : (
                <FileUpload onAnalyze={handleAnalysis} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default InputSection;