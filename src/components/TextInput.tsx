import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Globe, Sparkles } from 'lucide-react';

interface TextInputProps {
  onAnalyze: (data: { text: string; language: string }) => void;
}

const TextInput: React.FC<TextInputProps> = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('auto');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze({ text: text.trim(), language });
    }
  };

  const sampleTexts = [
    "I absolutely love this product! The quality is outstanding and the customer service was excellent.",
    "This was a disappointing experience. The product didn't meet my expectations and arrived damaged.",
    "The service was okay, nothing special but not terrible either. Average experience overall.",
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

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            type="submit"
            disabled={!text.trim()}
            className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: text.trim() ? 1.02 : 1 }}
            whileTap={{ scale: text.trim() ? 0.98 : 1 }}
          >
            <Send className="w-4 h-4" />
            <span>Analyze Sentiment</span>
          </motion.button>
        </div>
      </form>

      <div className="mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Texts:</h4>
        <div className="space-y-2">
          {sampleTexts.map((sample, index) => (
            <motion.button
              key={index}
              onClick={() => setText(sample)}
              className="w-full text-left p-3 bg-gray-50 hover:bg-primary-50 rounded-lg text-sm text-gray-700 hover:text-primary-700 transition-colors duration-200"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
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