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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const user = authService.getCurrentUser();

  const fetchFeedback = async (opts = { append: false }) => {
    try {
      setLoading(true);
      setError('');
      const res = await courseApi.get(`/feedback?page=${page}&limit=10`);
      const items = res?.data?.data?.feedback || res?.data?.feedback || [];
      setFeedback((prev) => (opts.append ? [...prev, ...items] : items));
      const totalPages = res?.data?.data?.pagination?.totalPages || null;
      if (totalPages) setHasMore(page < totalPages);
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar los comentarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const append = page > 1;
    fetchFeedback({ append });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Debe iniciar sesión para publicar comentarios.');
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
      setError(e?.message || 'No se pudo enviar el comentario.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((p) => p + 1);
    }
  };

  const SkeletonItem = () => (
    <div className="flex gap-4 p-4 border border-white/10 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
      <div className="flex-1">
        <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse" />
        <div className="mt-2 h-3 bg-white/10 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Comentarios de usuarios</h2>
          <p className="mt-3 text-white/80">Opiniones verificadas de nuestra comunidad. Publicación disponible para usuarios autenticados.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => fetchFeedback()} className="px-3 py-1.5 rounded-lg bg-red-600/30 text-red-100 hover:bg-red-600/40 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors">Reintentar</button>
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
                placeholder="Escriba su comentario"
                className="w-full rounded-xl bg-[#1e103d]/60 text-white placeholder-gray-400 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition-colors p-3"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-white/60">El comentario será público.</span>
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Enviando' : 'Publicar comentario'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-white/80">Acceda para publicar comentarios.</p>
              <div className="flex gap-3">
                <Link to="/login" className="px-4 py-2 rounded-xl bg-white text-[#0b0121] font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors">Iniciar sesión</Link>
                <Link to="/register" className="px-4 py-2 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors">Registrarse</Link>
              </div>
            </div>
          )}
        </div>

        {/* Lista de comentarios */}
        <div className="space-y-4">
          {loading && feedback.length === 0 && (
            <>
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </>
          )}
          {!loading && feedback.length === 0 && (
            <div className="text-center text-white/70">No hay comentarios disponibles.</div>
          )}
          {feedback.map((item) => (
            <FeedbackItem key={item.id} item={item} />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Cargando' : 'Cargar más'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;