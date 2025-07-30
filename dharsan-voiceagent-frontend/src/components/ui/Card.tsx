import React from 'react';
import type { BaseComponentProps } from '../../types';

interface CardProps extends BaseComponentProps {
  title?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact' | 'elevated';
}

const Card: React.FC<CardProps> = ({
  title,
  icon,
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300';
  
  const variantClasses = {
    default: 'p-4',
    compact: 'p-3',
    elevated: 'p-4 shadow-2xl hover:shadow-3xl',
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {title && (
        <div className="flex items-center gap-1 mb-3">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <h3 className="text-sm font-bold text-gray-400">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card; 