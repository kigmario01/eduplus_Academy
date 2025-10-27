import React from "react";
import { INTEGRATIONS } from "../../data/integrations";

/**
 * Carrusel infinito de íconos con dos filas, efecto de brillo,
 * fondo con degradado, y pausa suave al pasar el mouse.
 */
const IntegrationsCarousel = () => {
  const track = [...INTEGRATIONS, ...INTEGRATIONS]; // duplicamos para loop infinito

  return (
    <section className="relative py-16 bg-gradient-to-br from-[#0b0121] via-[#1a0333] to-[#0b0121] rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
      {/* Desvanecido lateral */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fila 1 */}
        <CarouselRow items={track} duration={25} reverse={false} />
        <div className="h-6" />
        {/* Fila 2 */}
        <CarouselRow items={track} duration={25} reverse />
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-x-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .carousel-track {
          display: flex;
          width: max-content;
          animation: scroll-x linear infinite;
        }
        .carousel-track.reverse {
          animation-name: scroll-x-reverse;
        }
        .carousel-paused:hover .carousel-track {
          animation-play-state: paused;
          transition: transform 1s ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .carousel-track { animation: none; }
        }
      `}</style>
    </section>
  );
};

const CarouselRow = ({ items, duration = 25, reverse = false }) => {
  return (
    <div
      className="carousel-paused overflow-hidden bg-white/5 rounded-2xl backdrop-blur-sm ring-1 ring-white/10 p-3"
      role="region"
      aria-label="Integraciones disponibles"
    >
      <div
        className={`carousel-track ${reverse ? "reverse" : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {items.map((item, idx) => (
          <LogoCard key={`${item.name}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
};

const LogoCard = ({ item }) => {
  return (
    <div className="mx-3">
      <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white/10 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110">
        <img
          src={item.src}
          alt={item.name}
          className="h-12 w-12 object-contain opacity-80 grayscale hover:grayscale-0 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition duration-300"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default IntegrationsCarousel;
