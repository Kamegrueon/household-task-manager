// src/components/Atoms/Table.tsx

import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ children, className }) => (
  <table className={`min-w-full bg-white border ${className}`}>
    {children}
  </table>
);

export default Table;
