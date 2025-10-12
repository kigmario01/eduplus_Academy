// Animaciones reutilizables para framer-motion

// Animación de entrada para contenedores con elementos escalonados
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Animación de entrada desde abajo para elementos individuales
export const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

// Animación de entrada desde la izquierda
export const fadeInLeft = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

// Animación de entrada desde la derecha
export const fadeInRight = {
  hidden: { x: 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

// Animación de escala para botones
export const buttonTap = {
  scale: 0.95,
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 15
  }
};

// Animación de hover para tarjetas
export const cardHover = {
  y: -5,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 15
  }
};

// Animación para transiciones de página
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

// Animación para elementos que aparecen en secuencia
export const sequentialFadeIn = (delay = 0) => ({
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.3,
      ease: 'easeOut'
    }
  }
});

// Animación para notificaciones o toasts
export const notificationAnimation = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

// Animación para modales
export const modalAnimation = {
  hidden: { 
    opacity: 0,
    scale: 0.9
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

// Animación para el fondo oscuro de modales
export const backdropAnimation = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      delay: 0.1
    }
  }
};

// Animación para listas
export const listAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

// Animación para elementos de lista
export const listItemAnimation = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10
    }
  }
};