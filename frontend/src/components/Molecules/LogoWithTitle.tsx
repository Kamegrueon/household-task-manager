// src/components/Molecules/LogoWithTitle.tsx

import React from 'react';
import Logo from '../Atoms/Logo';
import AppTitle from '../Atoms/AppTitle';

const LogoWithTitle: React.FC = () => (
  <div className="flex items-center">
    <Logo />
    <AppTitle />
  </div>
);

export default LogoWithTitle;
