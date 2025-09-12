
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className,
  ...props
}) => {
  const baseClasses =
    'font-bold uppercase tracking-wider transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-md';

  const variantClasses = {
    primary:
      'bg-cyan-500 text-gray-900 hover:bg-cyan-400 focus:ring-cyan-300 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/60',
    secondary:
      'bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-gray-900 focus:ring-cyan-800',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-5 py-2.5 text-base',
    large: 'px-8 py-3 text-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;