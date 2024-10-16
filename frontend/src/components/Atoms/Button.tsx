// src/components/Atoms/Button.tsx

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...rest }) => (
  <button
    className={`focus:outline-none ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
