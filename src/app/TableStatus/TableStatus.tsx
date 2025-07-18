import { Table } from '../../types';

interface TableStatusProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
}

export default function TableStatus({ tables, onTableSelect }: TableStatusProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Tables</h2>
      <div className="grid grid-cols-3 gap-4">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => onTableSelect(table)}
            className={`p-4 rounded-lg text-white font-bold ${
              table.isOccupied ? 'bg-red-500' : 'bg-green-500'
            } hover:opacity-80 transition`}
          >
            Table {table.id} {table.isOccupied ? '(Occupied)' : '(Available)'}
          </button>
        ))}
      </div>
    </div>
  );
}