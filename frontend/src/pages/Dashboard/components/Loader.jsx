import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Cargando tu experiencia personalizada...' }) => {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-[#0B1430] p-8 text-center text-gray-300">
      <div className="flex items-center justify-center rounded-full bg-white/5 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-300" />
      </div>
      <p className="text-sm font-medium text-white">{message}</p>
      <p className="max-w-sm text-xs text-gray-500">
        Este proceso puede tardar unos segundos. Estamos conectando con tu espacio de aprendizaje.
      </p>
    </div>
  );
};

export default Loader;
