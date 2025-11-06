import { useEffect, useState } from 'react';
import { courseApi } from '@/lib/api';
import { Link } from 'react-router-dom';
import { authService } from '@/services/api';

const FeedbackItem = ({ item }) => {
  return (
    <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
      <img
        src={item.user_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(item.user_name || 'Usuario')}
        alt={item.user_name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{item.user_name || 'Usuario'}</span>
          <span className="text-xs text-white/60">{new Date(item.created_at).toLocaleString()}</span>
        </div>
        <p className="mt-1 text-white/90 whitespace-pre-wrap">{item.content}</p>
      </div>
    </div>
  );
};

const FeedbackSection = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const user = authService.getCurrentUser();

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await courseApi.get('/feedback?limit=10');
      const items = res?.data?.data?.feedback || res?.data?.feedback || [];
      setFeedback(items);
    } catch (e) {
      setError(e?.message || 'No se pudo cargar el feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Debes iniciar sesión para comentar');
      return;
    }
    if (!content.trim()) return;
    try {
      setLoading(true);
      setError('');
      const res = await courseApi.post('/feedback', { content: content.trim() });
      const created = res?.data?.data;
      if (created) {
        setFeedback((prev) => [created, ...prev]);
      }
      setContent('');
    } catch (e) {
      setError(e?.message || 'No se pudo enviar el comentario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
            Feedback de la comunidad
          </h2>
          <p className="mt-3 text-neutral-300">Comparte tu experiencia y sugerencias. Comentarios abiertos para usuarios registrados.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Formulario de comentario */}
        <div className="bg-[#0f0824]/70 rounded-2xl border border-white/10 p-5 mb-8">
          {user ? (
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder="Escribe tu comentario"
                className="w-full rounded-xl bg-[#1e103d]/60 text-white placeholder-gray-400 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition p-3"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-white/60">Tu comentario será público</span>
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-fuchsia-700 disabled:opacity-50"
                >
                  {loading ? 'Enviando…' : 'Enviar comentario'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-white/80">Inicia sesión para comentar.</p>
              <div className="flex gap-3">
                <Link to="/login" className="px-4 py-2 rounded-xl bg-white text-[#0b0121] font-semibold">Iniciar sesión</Link>
                <Link to="/register" className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-300 to-pink-300 text-[#0b0121] font-bold">Registrarse</Link>
              </div>
            </div>
          )}
        </div>

        {/* Lista de comentarios */}
        <div className="space-y-4">
          {loading && feedback.length === 0 && (
            <div className="text-center text-white/70">Cargando feedback…</div>
          )}
          {!loading && feedback.length === 0 && (
            <div className="text-center text-white/70">Aún no hay comentarios. ¡Sé el primero!</div>
          )}
          {feedback.map((item) => (
            <FeedbackItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;