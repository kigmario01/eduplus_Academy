import { useEffect, useState } from 'react';
import { evaluationService } from '@/services/evaluationService';

export default function MyCertificates() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const { certificates } = await evaluationService.getMyCertificates();
        if (mounted) {
          setItems(certificates || []);
        }
      } catch (e) {
        if (mounted) setError(e.message || 'No se pudieron cargar tus certificados');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleDownload = (id) => {
    const url = evaluationService.getCertificatePdfUrl(id);
    // Abrir descarga en nueva pestaña para no bloquear la UI
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Mis certificados</h2>
        <p className="text-sm text-white/60">Visualiza y descarga tus certificados de finalización.</p>
      </div>

      {loading && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
          Cargando certificados...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
          Aún no tienes certificados.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((c) => {
            const payload = c.payload || {};
            const courseTitle = payload.course?.title || payload.course_title || 'Curso';
            const studentName = payload.student?.name || payload.student_name || '';
            const issuedAt = payload.issued_at || c.created_at || '';
            return (
              <div key={c.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{courseTitle}</p>
                  <p className="text-sm text-white/70">Otorgado a: {studentName || 'Tú'}</p>
                  <p className="text-xs text-white/50">Código: <code>{c.code}</code></p>
                  {issuedAt && (
                    <p className="text-xs text-white/50">Emitido: {new Date(issuedAt).toLocaleDateString('es-MX')}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownload(c.id)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white hover:from-pink-500 hover:to-fuchsia-600 transition-all"
                  >
                    Descargar PDF
                  </button>
                  <a
                    href={`/api/evaluations/certificates/${c.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-md text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-all"
                  >
                    Verificar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}