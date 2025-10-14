import React, { useState, useEffect } from 'react';

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Aprende con Expertos',
      description: 'Nuestros instructores son profesionales con años de experiencia en la industria.',
      gradient: 'from-primary-600/80 to-primary-800/80'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Tecnología de Vanguardia',
      description: 'Plataforma moderna con las últimas herramientas de aprendizaje interactivo.',
      gradient: 'from-secondary-600/80 to-secondary-800/80'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Comunidad Global',
      description: 'Conecta con estudiantes de todo el mundo y amplía tu red profesional.',
      gradient: 'from-success-600/80 to-success-800/80'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Certificaciones Reconocidas',
      description: 'Obtén certificados válidos en la industria que impulsen tu carrera profesional.',
      gradient: 'from-accent-600/80 to-accent-800/80'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Flexibilidad Total',
      description: 'Estudia a tu ritmo, cuando quieras y desde donde quieras.',
      gradient: 'from-warning-600/80 to-warning-800/80'
    }
  ];

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [slides.length, isHovered]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div 
      className="relative w-full h-96 overflow-hidden rounded-2xl shadow-large group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : index === (currentSlide - 1 + slides.length) % slides.length
                ? 'opacity-0 scale-105 -translate-x-full'
                : index === (currentSlide + 1) % slides.length
                ? 'opacity-0 scale-105 translate-x-full'
                : 'opacity-0 scale-95'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} backdrop-blur-xs flex items-center justify-start transition-all duration-500`}>
              <div className="text-white px-8 max-w-md animate-slide-up">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-soft hover:shadow-glow transition-all duration-300 hover:bg-white/15">
                  <h3 className="text-2xl font-bold mb-3 leading-tight animate-fade-in">{slide.title}</h3>
                  <p className="text-base leading-relaxed opacity-90 animate-fade-in">{slide.description}</p>
                  <div className="mt-4 w-12 h-1 bg-gradient-to-r from-white to-white/50 rounded-full animate-scale-in"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/20 hover:border-white/40 hover:shadow-glow opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/20 hover:border-white/40 hover:shadow-glow opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative transition-all duration-300 hover:scale-125 ${
              index === currentSlide
                ? 'w-8 h-3 bg-white rounded-full shadow-glow'
                : 'w-3 h-3 bg-white/50 hover:bg-white/75 rounded-full'
            }`}
          >
            {index === currentSlide && (
              <div className="absolute inset-0 bg-white rounded-full animate-pulse-soft"></div>
            )}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div 
          className="h-full bg-gradient-to-r from-white to-white/80 transition-all duration-300 ease-linear"
          style={{ 
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            animation: isHovered ? 'none' : 'none'
          }}
        ></div>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
};

export default Carousel;