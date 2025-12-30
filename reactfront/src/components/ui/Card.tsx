import { ReactNode } from 'react';

/**
 * Componente Card reutilizable
 */
interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

export default Card;

