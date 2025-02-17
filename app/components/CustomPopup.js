import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';

const CustomPopup = ({ isOpen, onClose, onConfirm, title, message }) => {
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
          className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[999] p-4"
        >
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-white/20"
          >
            {/* Content */}
            <div className="p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all"
              >
                <FiX className="w-6 h-6 text-gray-700" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-full shadow-lg">
                  <FiAlertTriangle className="w-8 h-8 text-blue-600" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {message}
                  </p>
                </div>

                <div className="flex gap-4 w-full">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 backdrop-blur-sm text-gray-700 font-semibold transition-all border border-white/20"
                  >
                    <FiX className="w-5 h-5" />
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onConfirm}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm text-white font-semibold shadow-lg transition-all border border-blue-700/20"
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