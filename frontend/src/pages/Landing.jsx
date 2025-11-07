import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { courseApi } from "@/lib/api";
import heroBackground from "../assets/hero-bg.svg";
import Carousel from "../components/Carousel";
import UpdateNotification from "../components/UpdateNotification";
import IntegrationsCarousel from "../components/ui/IntegrationsCarousel";
import FeedbackSection from "../components/FeedbackSection";

const Landing = () => {
  const [featured, setFeatured] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadFeatured() {
      try {
        setLoadingFeatured(true);
        const res = await courseApi.get('/courses?featured=true&limit=1');
        const items = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
        if (mounted) setFeatured(items[0] || null);
      } catch (e) {
        // Silenciar errores en landing; sección es opcional
      } finally {
        if (mounted) setLoadingFeatured(false);
      }
    }
    loadFeatured();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="bg-gradient-to-br from-[#0b0121] via-[#1a0333] to-[#0b0121] text-white">
      {/* Update Notification */}
      <UpdateNotification />

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-fuchsia-500/20 to-indigo-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-7xl ml-0 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="relative lg:max-w-2xl">
            <div className="text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-500 sm:text-5xl md:text-6xl animate-slide-up">
                <span className="block">Aprende con</span>
                <span className="block">EduPlus Academy</span>
              </h1>
              <p
                className="mt-6 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed text-neutral-200 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                Transforma tu futuro con nuestra plataforma educativa de
                vanguardia. Cursos diseñados por expertos para desarrollar tus
                habilidades y alcanzar tus metas profesionales.
              </p>
              <div
                className="mt-8 flex flex-col sm:flex-row justify-start gap-4 animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
                <Link
                  to="/register"
                  className="group px-8 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-pink-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/40 transform hover:-translate-y-1 hover:scale-105 active:scale-95 md:py-4 md:text-lg md:px-10"
                >
                  <span className="flex items-center gap-2">
                    Comenzar ahora
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/courses"
                  className="group px-8 py-3 rounded-xl text-base font-medium text-[#0b0121] bg-white hover:bg-neutral-200 transition-all duration-300 shadow-lg hover:shadow-white/40 transform hover:-translate-y-1 hover:scale-105 active:scale-95 md:py-4 md:text-lg md:px-10"
                >
                  <span className="flex items-center gap-2">
                    Ver cursos
                    <svg
                      className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Imagen lateral */}
        <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="relative h-full">
            <img
              className="h-full w-full object-cover object-center rounded-l-3xl shadow-2xl transition-transform duration-700 hover:scale-105"
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1471&q=80"
              alt="Estudiantes aprendiendo"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0b0121]/30 to-[#0b0121]/70 rounded-l-3xl"></div>
          </div>
        </div>
      </div>

      {/* Featured Course */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Curso destacado
            </h2>
            <p className="mt-3 text-neutral-300">Una recomendación seleccionada para comenzar hoy.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            {loadingFeatured && (
              <div className="text-center text-white/70">Cargando curso...</div>
            )}
            {!loadingFeatured && !featured && (
              <div className="text-center text-white/60">No hay cursos destacados por ahora.</div>
            )}
            {!loadingFeatured && featured && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold">{featured.title}</h3>
                  <p className="mt-2 text-white/80">{featured.short_description || featured.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/70">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-pink-500/20">{featured.category_name || 'Categoría'}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-fuchsia-500/20 capitalize">{featured.level || 'beginner'}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20">{featured.duration_hours || 0} horas</span>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Link
                      to={`/courses/${featured.slug || featured.id}`}
                      className="group inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-pink-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-pink-500/40"
                    >
                      Ver curso
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl text-[#0b0121] bg-white hover:bg-neutral-200 transition-all shadow-lg hover:shadow-white/40"
                    >
                      Matricularme ahora
                    </Link>
                  </div>
                </div>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/10">
                  <img src={featured.thumbnail_url} alt={featured.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0b0121]/40 to-transparent"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
            Nunca dejes de aprender!
          </h2>
          <p className="mt-4 text-neutral-300 text-lg">
            ¡Aprende con nosotros y diviertete!
          </p>
        </div>
        <IntegrationsCarousel />
      </section>

      {/* Feedback Section */}
      <FeedbackSection />

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-fuchsia-700 via-purple-800 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-fuchsia-700/10 to-indigo-700/10"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center py-20 px-4 sm:py-24 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl animate-slide-up">
            <span className="block mb-2">¿Listo para comenzar?</span>
            <span className="block bg-gradient-to-r from-orange-300 to-pink-300 bg-clip-text text-transparent">
              Únete a EduPlus Academy hoy.
            </span>
          </h2>
          <p
            className="mt-6 text-xl leading-8 text-neutral-200 max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Comienza tu viaje de aprendizaje con nosotros y transforma tu futuro
            profesional con la mejor educación en línea.
          </p>
          <div
            className="mt-10 animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              to="/register"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl text-[#0b0121] bg-gradient-to-r from-orange-300 to-pink-300 hover:from-orange-200 hover:to-pink-200 shadow-lg hover:shadow-pink-400/40 transform hover:scale-105 transition-all duration-300 ease-out"
            >
              <span>Registrarse ahora</span>
              <svg
                className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
