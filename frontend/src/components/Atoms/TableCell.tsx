// src/components/Atoms/TableCell.tsx

import React from 'react';

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

const TableCell: React.FC<TableCellProps> = ({ children, className, align = 'center' }) => (
  <td className={`px-4 py-2 border-b text-${align} ${className}`}>
    {children}
  </td>
);

export default TableCell;
