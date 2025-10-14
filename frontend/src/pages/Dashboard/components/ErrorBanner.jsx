import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorBanner = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center justify-between gap-4 rounded-3xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-sm text-red-200"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-red-500/20 p-2">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">No pudimos actualizar la información</p>
            <p className="text-red-200/80">{message}</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorBanner;
