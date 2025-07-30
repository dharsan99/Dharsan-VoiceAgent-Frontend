import React from 'react';
import type { ButtonProps } from '../../types';
import { UI } from '../../constants';

const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-bold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 shadow-lg transform hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-500/50',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white focus:ring-gray-500/50',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500/50',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-green-500/50',
    warning: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white focus:ring-yellow-500/50',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  const disabledClasses = disabled 
    ? 'bg-gray-600 cursor-not-allowed opacity-50 hover:scale-100 active:scale-100' 
    : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      <div className="flex items-center justify-center gap-1">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
      </div>
    </button>
  );
};

export default Button; 