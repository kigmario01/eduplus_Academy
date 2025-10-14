import { motion } from 'framer-motion';
import { ArrowUpRight, Newspaper } from 'lucide-react';

const newsVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.35,
      ease: 'easeOut',
    },
  }),
};

const NoticiasDestacadas = ({ news = [] }) => {
  if (!news.length) {
    return (
      <section className="flex flex-col gap-4 rounded-3xl border border-dashed border-white/10 bg-[#0B1430] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
          <Newspaper className="h-6 w-6 text-blue-300" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Sin novedades por el momento</h2>
          <p className="mt-1 text-sm text-gray-400">
            Te notificaremos en cuanto haya anuncios importantes para tu cuenta.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col rounded-3xl border border-white/5 bg-[#0B1430] p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Noticias relevantes</h2>
          <p className="text-sm text-gray-400">Actualizaciones y anuncios sobre tus programas y EduPlus.</p>
        </div>
        <button className="text-sm font-semibold text-blue-300 transition hover:text-blue-200">Ver todas</button>
      </div>

      <div className="mt-6 space-y-4">
        {news.map((item, index) => (
          <motion.article
            key={item.id || item.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={newsVariants}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#111C3A] p-5"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gray-500">
                <span>{item.category}</span>
                {item.publishedAt && <span>{item.publishedAt}</span>}
              </div>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              {item.summary && <p className="text-sm text-gray-400">{item.summary}</p>}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
                >
                  Leer más
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default NoticiasDestacadas;
