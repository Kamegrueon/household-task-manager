// src/components/Atoms/TableRow.tsx

import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const TableRow: React.FC<TableRowProps> = ({ children, onClick, className }) => (
  <tr
    onClick={onClick}
    className={`hover:bg-gray-100 transition-colors duration-400 cursor-pointer text-sm md:text-base lg:text-lg ${className}`}
  >
    {children}
  </tr>
);

export default TableRow;
