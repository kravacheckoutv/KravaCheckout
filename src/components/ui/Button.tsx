import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      href,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'bg-krava-green text-krava-black hover:bg-opacity-90 focus:ring-krava-green',
      secondary: 'bg-krava-gray-700 text-krava-white hover:bg-krava-gray-600 focus:ring-krava-gray-600',
      outline: 'bg-transparent border border-krava-gray-600 text-krava-white hover:bg-krava-gray-800 focus:ring-krava-gray-600',
      danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
      ghost: 'bg-transparent text-krava-white hover:bg-krava-gray-800 focus:ring-krava-gray-600',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
    };

    const baseClasses = `inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-krava-black disabled:opacity-50 disabled:cursor-not-allowed`;
    const widthClass = fullWidth ? 'w-full' : '';
    
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

    const content = (
      <>
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        
        {children}
        
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    );

    if (href) {
      return (
        <a href={href} className={buttonClasses}>
          {content}
        </a>
      );
    }

    return (
      <button ref={ref} className={buttonClasses} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;