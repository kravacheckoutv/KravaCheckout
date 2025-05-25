import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      fullWidth = true,
      ...props
    },
    ref
  ) => {
    const inputWrapperClasses = `relative ${fullWidth ? 'w-full' : ''}`;
    const inputClasses = `input ${
      error ? 'border-error-500 focus:ring-error-500' : ''
    } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`;
    
    const iconClasses = 'absolute inset-y-0 flex items-center pointer-events-none text-krava-gray-400';
    
    return (
      <div className={inputWrapperClasses}>
        {label && (
          <label htmlFor={props.id} className="label">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={`${iconClasses} left-3`}>{leftIcon}</div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className={`${iconClasses} right-3`}>{rightIcon}</div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-krava-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;