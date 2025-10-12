import { motion } from 'framer-motion';
import { buttonTap } from './animations';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  info: 'bg-blue-400 hover:bg-blue-500 text-white',
  light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200',
  dark: 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600',
  link: 'bg-transparent text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline',
  outline: 'bg-transparent border border-current hover:bg-opacity-10'
};

const sizes = {
  xs: 'py-1 px-2 text-xs',
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-2.5 px-5 text-lg',
  xl: 'py-3 px-6 text-xl'
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
  rounded = false,
  withRipple = true,
  isLoading = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  type = 'button',
  ...props
}) => {
  // Combinar clases para el botón
  const buttonClasses = `
    ${variants[variant]} 
    ${sizes[size]} 
    ${fullWidth ? 'w-full' : ''} 
    ${rounded ? 'rounded-full' : 'rounded-md'} 
    ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} 
    font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    ${className}
  `;

  // Efecto de ripple para el botón
  const handleRipple = (e) => {
    if (!withRipple || disabled || isLoading) return;
    
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'absolute rounded-full bg-white bg-opacity-30 transform scale-0 animate-ripple';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return (
    <motion.button
      type={type}
      className={`relative overflow-hidden ${buttonClasses}`}
      disabled={disabled || isLoading}
      onClick={(e) => {
        handleRipple(e);
        onClick && onClick(e);
      }}
      whileTap={!disabled && !isLoading ? buttonTap : {}}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      
      <span className={`flex items-center justify-center ${isLoading ? 'opacity-0' : ''}`}>
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </span>
    </motion.button>
  );
};

export default Button;