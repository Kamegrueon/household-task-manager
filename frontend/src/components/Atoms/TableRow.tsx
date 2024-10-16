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
    className={`hover:bg-gray-100 cursor-pointer ${className}`}
  >
    {children}
  </tr>
);

export default TableRow;
