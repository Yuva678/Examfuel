import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className={`flex items-center space-x-3 cursor-pointer ${className}`}>
        <input
          type="checkbox"
          ref={ref}
          className="form-checkbox h-5 w-5 text-brand-600 rounded border-gray-300 dark:border-gray-700 focus:ring-brand-500 bg-white dark:bg-gray-800 transition-colors cursor-pointer"
          {...props}
        />
        <span className="text-gray-700 dark:text-gray-300 font-medium select-none">{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export default Checkbox;
