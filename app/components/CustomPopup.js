// app/components/CustomPopup.js
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';

const CustomPopup = ({ isOpen, onClose, onConfirm, title, warning, message }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center z-[999] p-4"
        >
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-gray-900 rounded shadow-2xl overflow-hidden w-full max-w-md border border-gray-700"
          >
            {/* Content */}
            <div className="p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all"
              >
                <FiX className="w-6 h-6 text-gray-300" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-gray-800 rounded-full shadow-lg">
                  <FiAlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-100">
                    {title}
                  </h2>
                  <p className="text-yellow-400 text-lg leading-relaxed">
                    {warning}
                  </p>
                  <p className="text-red-400 text-md leading-relaxed">
                    {message}
                  </p>
                </div>

                <div className="flex gap-4 w-full">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-all border border-gray-700"
                  >
                    <FiX className="w-5 h-5" />
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onConfirm}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-all border border-blue-700/20"
                  >
                    <FiCheck className="w-5 h-5" />
                    Confirm
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomPopup;