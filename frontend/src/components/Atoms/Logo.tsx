// src/components/Atoms/Logo.tsx

import React from 'react';
import logo from '../../assets/logo.svg'

const Logo: React.FC = () => (
    <img src={logo} alt="Logo" className="h-8 w-auto" />
);

export default Logo;
