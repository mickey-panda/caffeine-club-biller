"use client";
import { useState, useEffect } from 'react';
import Menu from './Menu/page';
import TableStatus from './TableStatus/page';
import BillDetails from './BillDetails/page';
import { Table, MenuItem } from './../types';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  // Initialize tables with default state for both server and client
  const initialTables: Table[] = [
    { id: 1, isOccupied: false, items: [], total: 0 },
    { id: 2, isOccupied: false, items: [], total: 0 },
    { id: 3, isOccupied: false, items: [], total: 0 },
    { id: 4, isOccupied: false, items: [], total: 0 },
    { id: 5, isOccupied: false, items: [], total: 0 },
    { id: 6, isOccupied: false, items: [], total: 0 },
  ];

  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [billAmount, setBillAmount] = useState(0);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCashInput, setShowCashInput] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Both' | null>(null);
  const [cashAmount, setCashAmount] = useState('');

  // Load data from localStorage on client-side after initial render
  useEffect(() => {
    const savedTables = localStorage.getItem('restaurantTables');
    if (savedTables) {
      try {
        const parsedTables = JSON.parse(savedTables);
        // Validate parsed data against Table type
        if (Array.isArray(parsedTables) && parsedTables.every(t => t.id && 'isOccupied' in t && 'items' in t && 'total' in t)) {
          setTables(parsedTables);
          // Sync selectedTable with updated tables
          if (selectedTable) {
            const updatedSelectedTable = parsedTables.find(t => t.id === selectedTable.id) || null;
            setSelectedTable(updatedSelectedTable);
          }
        }
      } catch (error) {
        console.error('Failed to parse localStorage data:', error);
      }
    }
  }, []);

  // Save tables to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('restaurantTables', JSON.stringify(tables));
  }, [tables]);

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    if (!table.isOccupied) {
      setTables(tables.map(t => t.id === table.id ? { ...t, isOccupied: true } : t));
    }
  };

  const addItemToTable = (item: MenuItem) => {
    if (!selectedTable) return;
    // Check if the item already exists in the table's items
    const existingItem = selectedTable.items.find(i => i.id === item.id);
    let updatedItems: MenuItem[];
    
    if (existingItem) {
      // If item exists, increment its quantity
      updatedItems = selectedTable.items.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity +1 } : i
      );
    } else {
      // If item doesn't exist, add it with the provided quantity
      updatedItems = [...selectedTable.items, { ...item }];
    }

    const updatedTotal = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const updatedTables = tables.map(t =>
      t.id === selectedTable.id ? { ...t, items: updatedItems, total: updatedTotal } : t
    );
    setTables(updatedTables);
    setSelectedTable({ ...selectedTable, items: updatedItems, total: updatedTotal });
  };

  const updateItemQuantity = (itemId: number, quantity: number) => {
    if (!selectedTable) return;
    const updatedItems = selectedTable.items.map(i =>
      i.id === itemId ? { ...i, quantity: Math.max(0, quantity) } : i
    ).filter(i => i.quantity > 0);
    const updatedTotal = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const updatedTables = tables.map(t =>
      t.id === selectedTable.id ? { ...t, items: updatedItems, total: updatedTotal } : t
    );
    setTables(updatedTables);
    setSelectedTable({ ...selectedTable, items: updatedItems, total: updatedTotal });
  };

  const generateBill = () => {
    if (!selectedTable) return;

    if(selectedTable.total === 0){
      const updatedTables = tables.map(t =>
        t.id === selectedTable!.id ? { ...t, isOccupied: false, items: [], total: 0 } : t
      );
      setTables(updatedTables);
      setSelectedTable(null);
      localStorage.setItem('restaurantTables', JSON.stringify(updatedTables));
      return;
    }
    setBillAmount(selectedTable.total);
    setShowPaymentModal(true);
  };

  const handlePaymentMethod = (method: 'UPI' | 'Cash' | 'Both') => {
    setPaymentMethod(method);
    setShowPaymentModal(false);
    if (method === 'UPI') {
      setShowQRCode(true);
    } else if (method === 'Cash') {
      const updatedTables = tables.map(t =>
        t.id === selectedTable!.id ? { ...t, isOccupied: false, items: [], total: 0 } : t
      );
      setTables(updatedTables);
      setSelectedTable(null);
      localStorage.setItem('restaurantTables', JSON.stringify(updatedTables));
    } else if (method === 'Both') {
      setShowCashInput(true);
    }
  };

  const handleCashSubmit = () => {
    const cash = parseFloat(cashAmount);
    if (isNaN(cash) || cash < 0 || cash > billAmount) {
      alert('Please enter a valid cash amount (0 to total bill).');
      return;
    }
    setShowCashInput(false);
    if (cash === billAmount) {
      const updatedTables = tables.map(t =>
        t.id === selectedTable!.id ? { ...t, isOccupied: false, items: [], total: 0 } : t
      );
      setTables(updatedTables);
      setSelectedTable(null);
      localStorage.setItem('restaurantTables', JSON.stringify(updatedTables));
    } else {
      setBillAmount(billAmount - cash);
      setShowQRCode(true);
    }
    setCashAmount('');
  };


  const closeQRCode = () => {
    setShowQRCode(false);
    setPaymentMethod(null);
    const updatedTables = tables.map(t =>
      t.id === selectedTable!.id ? { ...t, isOccupied: false, items: [], total: 0 } : t
    );
    setTables(updatedTables);
    setSelectedTable(null);
    localStorage.setItem('restaurantTables', JSON.stringify(updatedTables));
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentMethod(null);
  };

  const closeCashInput = () => {
    setShowCashInput(false);
    setCashAmount('');
    setPaymentMethod(null);
  };

  // Generate UPI payment link
  const upiLink = `upi://pay?pa=Q230526975@ybl&pn=CaffeineClub&am=${billAmount}&cu=INR`;

  return (
    <div className="min-h-screen bg-gray-600 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Caffeine Club Billing System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TableStatus tables={tables} onTableSelect={handleTableSelect} />
          {selectedTable && (
            <BillDetails
              table={selectedTable}
              updateItemQuantity={updateItemQuantity}
              generateBill={generateBill}
            />
          )}
        </div>
        <Menu addItemToTable={addItemToTable} />
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl text-center text-gray-600 font-semibold mb-4">Select Payment Method</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handlePaymentMethod('UPI')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                UPI
              </button>
              <button
                onClick={() => handlePaymentMethod('Cash')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Cash
              </button>
              <button
                onClick={() => handlePaymentMethod('Both')}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
              >
                Both
              </button>
              <button
                onClick={closePaymentModal}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl text-center text-gray-600 font-semibold mb-4">Scan to Pay ₹{billAmount}</h2>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={upiLink} size={200} />
            </div>
            <p className="text-center text-gray-400 mb-4">Pay using UPI</p>
            <button
              onClick={closeQRCode}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showCashInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl text-center text-gray-600 font-semibold mb-4">Enter Cash Amount</h2>
            <p className="text-center text-gray-600 mb-4">Total Bill: ₹{billAmount}</p>
            <input
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="Enter cash amount"
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="flex gap-4">
              <button
                onClick={handleCashSubmit}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Submit
              </button>
              <button
                onClick={closeCashInput}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}