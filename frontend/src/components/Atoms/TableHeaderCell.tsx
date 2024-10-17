// src/components/Atoms/TableHeaderCell.tsx

import React from 'react';

interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className = '',
  align = 'center',
  ...rest
}) => {
  // アラインメントに応じたクラスを設定
  let alignClass = 'text-center';
  if (align === 'left') alignClass = 'text-left';
  if (align === 'right') alignClass = 'text-right';

  return (
    <th
      className={`py-2 border-b bg-gray-200 ${alignClass} text-xs md:text-sm lg:text-lg ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
};

export default TableHeaderCell;
