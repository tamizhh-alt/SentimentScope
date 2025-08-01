import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Home, Settings } from 'lucide-react';

interface HeaderProps {
  currentView: 'input' | 'results' | 'dashboard';
  setCurrentView: (view: 'input' | 'results' | 'dashboard') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'input', label: 'Analyze', icon: Home },
    { id: 'results', label: 'Results', icon: FileText },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ] as const;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              SentimentScope
            </h1>
          </motion.div>

          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <motion.button
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;