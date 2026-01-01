import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Componente Button reutilizable
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  children: ReactNode;
}

function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-400 to-primary-600 text-white hover:from-primary-500 hover:to-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50',
    secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

