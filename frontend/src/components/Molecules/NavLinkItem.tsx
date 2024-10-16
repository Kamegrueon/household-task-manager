// src/components/Molecules/NavLinkItem.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavLinkItemProps {
  to: string;
  label: string;
  exact?: boolean;
  className?: string;
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({ to, label, exact = false, className }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      `${className} ${
        isActive ? 'text-blue-700 bg-gray-200' : 'text-gray-700 hover:bg-gray-200'
      } py-2 px-3 rounded-md`
    }
  >
    {label}
  </NavLink>
);

export default NavLinkItem;
