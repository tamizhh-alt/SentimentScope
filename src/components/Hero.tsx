import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Globe, Zap, Shield } from 'lucide-react';

const Hero: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Advanced machine learning models for accurate sentiment detection',
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'Support for 50+ languages with automatic translation',
    },
    {
      icon: Zap,
      title: 'Real-Time',
      description: 'Instant analysis with sub-2-second response times',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Enterprise-grade security with data encryption',
    },
  ];

  return (
    <section className="text-center py-12 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Advanced{' '}
          <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 bg-clip-text text-transparent">
            Sentiment Analysis
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Unlock deep insights from text data with our comprehensive sentiment analysis platform. 
          Process reviews, social media, and customer feedback with enterprise-grade accuracy.
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default Hero;