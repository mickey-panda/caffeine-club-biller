import { Table } from './../../types';

interface BillDetailsProps {
  table: Table;
  updateItemQuantity: (itemId: number, quantity: number) => void;
  generateBill: () => void;
}

export default function BillDetails({ table, updateItemQuantity, generateBill }: BillDetailsProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl text-gray-800 font-semibold mb-4">Table {table.id} Bill</h2>
      {table.items.length === 0 ? (
        <p className='text-gray-800'>No items added.</p>
      ) : (
        <div>
          {table.items.map(item => (
            <div key={item.id} className="flex text-gray-600 justify-between items-center mb-2">
              <span>{item.name} ({item.price.toFixed(2)})</span>
              <div className="flex items-center">
                <button
                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
                >
                  -
                </button>
                <span className="px-4">{item.quantity}</span>
                <button
                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="mt-4">
            <p className="text-lg text-gray-800 font-semibold">Total: {table.total.toFixed(2)}</p>
            <button
              onClick={generateBill}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Generate Final Bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}