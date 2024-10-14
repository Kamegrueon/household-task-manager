import React from 'react';
import logo from '../../assets/logo.svg';

const Logo: React.FC = () => (
    <>
        <img src={logo} alt="App Logo" className="h-12 w-auto mr-2" />
        <h1 className="app-title">Everyday Task</h1>
    </>
);

export default Logo;
