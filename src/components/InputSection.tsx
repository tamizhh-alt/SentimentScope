import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Type, FileText, Loader } from 'lucide-react';
import TextInput from './TextInput';
import FileUpload from './FileUpload';
import { useAnalysis } from '../context/AnalysisContext';

interface InputSectionProps {
  onAnalysisComplete: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalysisComplete }) => {
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [isProcessing, setIsProcessing] = useState(false);
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
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add analysis result to context
    addAnalysisResult({
      id: Date.now().toString(),
      timestamp: new Date(),
      type: inputMethod,
      data,
      results: {
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        confidence: Math.random() * 0.4 + 0.6,
        emotions: {
          joy: Math.random(),
          anger: Math.random(),
          sadness: Math.random(),
          fear: Math.random(),
          surprise: Math.random(),
          disgust: Math.random(),
        },
      },
    });
    
    setIsProcessing(false);
    onAnalysisComplete();
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
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
              <Loader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Data</h3>
              <p className="text-gray-600">Our AI models are analyzing your content...</p>
              <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary-600 to-accent-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                />
              </div>
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