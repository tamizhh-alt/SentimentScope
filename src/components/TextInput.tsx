import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Globe, Sparkles, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface TextInputProps {
  onAnalyze: (data: any) => void;
}

const TextInput: React.FC<TextInputProps> = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('auto');
  const [includeEmotions, setIncludeEmotions] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3001/api/sentiment/analyze', {
        text: text.trim(),
        language,
        includeEmotions,
        includeSummary,
        detectLanguage: true
      });

      onAnalyze(response.data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sampleTexts = [
    "I absolutely love this product! The quality is outstanding and the customer service was excellent. Highly recommended!",
    "This was a disappointing experience. The product didn't meet my expectations and arrived damaged. Very frustrating.",
    "The service was okay, nothing special but not terrible either. Average experience overall, could be better.",
    "I'm amazed by how well this works! It exceeded all my expectations and the team was incredibly helpful throughout.",
    "Terrible quality and poor customer support. I regret this purchase and would not recommend to anyone."
  ];

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Text Analysis</h3>
          <p className="text-gray-600 text-sm">Enter your text for real-time sentiment analysis</p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Analysis Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeEmotions}
                  onChange={(e) => setIncludeEmotions(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Include emotion analysis</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Generate summary (for long texts)</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            Text Content
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here for sentiment analysis..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            disabled={isAnalyzing}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {text.length} characters
            </span>
            <span className="text-sm text-gray-500">
              {text.trim().split(/\s+/).filter(word => word.length > 0).length} words
            </span>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={!text.trim() || isAnalyzing}
          className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
          whileHover={{ scale: text.trim() && !isAnalyzing ? 1.02 : 1 }}
          whileTap={{ scale: text.trim() && !isAnalyzing ? 0.98 : 1 }}
        >
          {isAnalyzing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Analyze Sentiment</span>
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Texts:</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {sampleTexts.map((sample, index) => (
            <motion.button
              key={index}
              onClick={() => setText(sample)}
              disabled={isAnalyzing}
              className="w-full text-left p-3 bg-gray-50 hover:bg-primary-50 rounded-lg text-sm text-gray-700 hover:text-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: !isAnalyzing ? 1.01 : 1 }}
              whileTap={{ scale: !isAnalyzing ? 0.99 : 1 }}
            >
              {sample}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextInput;