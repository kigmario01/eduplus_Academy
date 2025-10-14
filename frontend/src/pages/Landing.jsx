import { Link } from 'react-router-dom';
import heroBackground from '../assets/hero-bg.svg';
import Carousel from '../components/Carousel';

const Landing = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent-400/20 to-primary-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl ml-0 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="relative lg:max-w-2xl">
            <div className="text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl animate-slide-up">
                <span className="block">Aprende con</span>
                <span className="block bg-gradient-to-r from-secondary-200 to-accent-200 bg-clip-text text-transparent animate-fade-in">EduPlus Academy</span>
              </h1>
              <p className="mt-6 text-base text-neutral-100 sm:text-lg md:text-xl max-w-3xl leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
                Transforma tu futuro con nuestra plataforma educativa de vanguardia. Cursos diseñados por expertos para desarrollar tus habilidades y alcanzar tus metas profesionales.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-start gap-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <Link
                  to="/register"
                  className="group px-8 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 transition-all duration-300 shadow-medium hover:shadow-glow-accent transform hover:-translate-y-1 hover:scale-105 active:scale-95 md:py-4 md:text-lg md:px-10"
                >
                  <span className="flex items-center gap-2">
                    Comenzar ahora
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/courses"
                  className="group px-8 py-3 rounded-xl text-base font-medium text-primary-700 bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-medium hover:shadow-large transform hover:-translate-y-1 hover:scale-105 active:scale-95 md:py-4 md:text-lg md:px-10 border border-white/20"
                >
                  <span className="flex items-center gap-2">
                    Ver cursos
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="relative h-full">
            <img
              className="h-full w-full object-cover object-center rounded-l-3xl shadow-large transition-transform duration-700 hover:scale-105"
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
              alt="Estudiantes aprendiendo"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary-600/10 to-primary-600/30 rounded-l-3xl"></div>
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="py-20 bg-gradient-to-br from-neutral-50 via-secondary-50 to-primary-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase mb-3 animate-fade-in">Descubre</h2>
            <p className="text-3xl leading-8 font-extrabold tracking-tight bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent sm:text-4xl animate-slide-up" style={{animationDelay: '0.1s'}}>
              Lo que hace especial a EduPlus Academy
            </p>
            <p className="mt-6 max-w-3xl text-xl text-neutral-600 mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
              Explora las características que nos convierten en la mejor opción para tu educación y desarrollo profesional
            </p>
          </div>
          <div className="animate-scale-in" style={{animationDelay: '0.3s'}}>
            <Carousel />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-br from-white via-neutral-50 to-secondary-50 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent-200 to-primary-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase animate-fade-in">Características</h2>
            <p className="mt-4 text-3xl leading-8 font-extrabold tracking-tight bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent sm:text-4xl animate-slide-up" style={{animationDelay: '0.1s'}}>
              Una mejor forma de aprender
            </p>
            <p className="mt-6 max-w-3xl text-xl text-neutral-600 lg:mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
              Nuestra plataforma está diseñada para ofrecerte la mejor experiencia educativa posible con tecnología de vanguardia
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-16">
              {/* Feature 1 */}
              <div className="relative group animate-slide-up" style={{animationDelay: '0.3s'}}>
                <div className="absolute flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ease-out">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-20">
                  <h3 className="text-xl leading-6 font-bold text-neutral-900 group-hover:text-primary-700 transition-colors duration-300">Cursos en línea</h3>
                  <p className="mt-3 text-base text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
                    Accede a nuestros cursos desde cualquier dispositivo, en cualquier momento y lugar.
                  </p>
                </div>
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 transform scale-105"></div>
              </div>

              {/* Feature 2 */}
              <div className="relative group animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="absolute flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ease-out">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-20">
                  <h3 className="text-xl leading-6 font-bold text-neutral-900 group-hover:text-primary-700 transition-colors duration-300">Contenido de calidad</h3>
                  <p className="mt-3 text-base text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
                    Material educativo creado por expertos en cada área, actualizado constantemente.
                  </p>
                </div>
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 transform scale-105"></div>
              </div>

              {/* Feature 3 */}
              <div className="relative group animate-slide-up" style={{animationDelay: '0.5s'}}>
                <div className="absolute flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ease-out">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-20">
                  <h3 className="text-xl leading-6 font-bold text-neutral-900 group-hover:text-primary-700 transition-colors duration-300">Comunidad activa</h3>
                  <p className="mt-3 text-base text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
                    Conecta con otros estudiantes y profesores para resolver dudas y compartir conocimientos.
                  </p>
                </div>
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 transform scale-105"></div>
              </div>

              {/* Feature 4 */}
              <div className="relative group animate-slide-up" style={{animationDelay: '0.6s'}}>
                <div className="absolute flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ease-out">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-20">
                  <h3 className="text-xl leading-6 font-bold text-neutral-900 group-hover:text-primary-700 transition-colors duration-300">Certificaciones</h3>
                  <p className="mt-3 text-base text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
                    Obtén certificados reconocidos que validen tus conocimientos y mejoren tu perfil profesional.
                  </p>
                </div>
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 transform scale-105"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-secondary-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-600/20 to-secondary-600/20"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center py-20 px-4 sm:py-24 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl animate-slide-up">
            <span className="block mb-2">¿Listo para comenzar?</span>
            <span className="block bg-gradient-to-r from-accent-300 to-secondary-300 bg-clip-text text-transparent">
              Únete a EduPlus Academy hoy.
            </span>
          </h2>
          <p className="mt-6 text-xl leading-8 text-primary-100 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.1s'}}>
            Comienza tu viaje de aprendizaje con nosotros y transforma tu futuro profesional con la mejor educación en línea.
          </p>
          <div className="mt-10 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <Link
              to="/register"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl text-primary-700 bg-gradient-to-r from-white to-neutral-50 hover:from-accent-50 hover:to-secondary-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out"
            >
              <span>Registrarse ahora</span>
              <svg className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;