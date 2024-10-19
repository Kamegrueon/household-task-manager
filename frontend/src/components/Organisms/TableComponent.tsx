// src/components/Organisms/TableComponent.tsx
import Table from '../Atoms/Table';
import TableHeaderCell from '../Atoms/TableHeaderCell';
import TableRow from '../Atoms/TableRow';
import TableCell from '../Atoms/TableCell';
import IconButton from '../Molecules/IconButton';
import { ActionsType } from '../../types/atoms';

interface TableItem {
  id: number;
  [key: string]: any;
}


interface TableComponentProps<T extends TableItem> {
  items: T[];
  columns: { key: keyof T; label: string; hiddenOnMobile?: boolean }[];
  actions: ActionsType[];
  onRowClick?: (itemId: number) => void;
}

const TableComponent = <T extends TableItem>({
  items,
  columns,
  actions,
  onRowClick,
}: TableComponentProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <thead>
          <tr className='px-2'>
            {columns.map((column) => (
              <TableHeaderCell
                key={String(column.key)}
                align="center"
                className={column.hiddenOnMobile ? 'hidden md:table-cell' : ''}
              >
                {column.label}
              </TableHeaderCell>
            ))}
            {actions.length > 0 && (
              <TableHeaderCell className="text-center" colSpan={actions.length} />
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <TableRow key={item.id} onClick={() => onRowClick?.(item.id)}>
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  className={column.hiddenOnMobile ? 'hidden md:table-cell px-2' : 'px-2'}
                >
                  {String(item[column.key])}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-2">
                    {actions.map((action, index) => (
                      <IconButton
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation(); // 行のクリックイベントを停止
                          action.onClick(item.id);
                        }}
                        iconName={action.iconName}
                        title={action.title}
                        className={action.className}
                        size={action.size || 16} // デフォルトサイズを16に設定
                      />
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TableComponent;
