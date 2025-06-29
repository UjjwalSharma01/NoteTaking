import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const alertTypes = {
  success: {
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-500 dark:text-green-400',
    icon: CheckCircleIcon
  },
  error: {
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-500 dark:text-red-400',
    icon: ExclamationTriangleIcon
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
    icon: ExclamationTriangleIcon
  },
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500 dark:text-blue-400',
    icon: InformationCircleIcon
  }
};

export default function Alert({ 
  type = 'info', 
  title, 
  message, 
  dismissible = true, 
  onDismiss,
  className = '',
  autoHide = false,
  autoHideDelay = 5000
}) {
  const [isVisible, setIsVisible] = useState(true);
  const alertConfig = alertTypes[type];
  const Icon = alertConfig.icon;

  // Auto-hide functionality
  useState(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      setTimeout(onDismiss, 150); // Wait for animation to complete
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className={`
            ${alertConfig.bgColor} 
            ${alertConfig.borderColor} 
            border rounded-lg p-4 
            ${className}
          `}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <Icon className={`w-5 h-5 ${alertConfig.iconColor}`} />
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <h3 className={`text-sm font-medium ${alertConfig.textColor} mb-1`}>
                  {title}
                </h3>
              )}
              <div className={`text-sm ${alertConfig.textColor}`}>
                {message}
              </div>
            </div>
            {dismissible && (
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className={`
                    inline-flex rounded-md p-1.5 
                    ${alertConfig.textColor} 
                    hover:bg-black hover:bg-opacity-10 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-offset-transparent focus:ring-blue-500
                    transition-colors duration-200
                  `}
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast notification component for global alerts
export function Toast({ alerts = [], removeAlert }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              {...alert}
              onDismiss={() => removeAlert(alert.id)}
              autoHide={true}
              className="shadow-lg"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
