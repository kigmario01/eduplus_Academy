import { motion } from 'framer-motion';

const EmptyState = ({ 
  icon = "📊", 
  title = "Datos no disponibles", 
  description = "Los datos aún no están disponibles. Inténtalo más tarde.",
  action = null 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;