"use client";
import { useState, useEffect } from "react";
import { MenuItem } from "@/types";
import { Timestamp } from "firebase/firestore";
import { getBills } from "../Utilities/firebaseHelper";
import ToggleSwitch from "../CommonControls/ToggleButton";

interface Bill {
  id: string;
  items: MenuItem[];
  total: number;
  status: string;
  upi: number;
  cash: number;
  time: Timestamp;
}

interface ItemAnalytics {
  id: number;
  name: string;
  category: string;
  price: number;
  totalQuantity: number;
  totalRevenue: number;
}

export default function Analytics() {
  const [documents, setDocuments] = useState<Bill[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setHours(0, 0, 0, 0)) // Start of today
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().setHours(23, 59, 59, 999)) // End of today
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemAnalytics, setItemAnalytics] = useState<ItemAnalytics[]>([]);
  const [grandTotalQuantity, setGrandTotalQuantity] = useState(0);
  const [grandTotalRevenue, setGrandTotalRevenue] = useState(0);
  const [isRevenue, setIsRevenue] = useState(false);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      setError(null);
      try {
        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);
        const bills = await getBills(startTimestamp, endTimestamp);
        setDocuments(bills);

        // Aggregate item data
        const itemMap: { [key: number]: ItemAnalytics } = {};
        let totalQuantity = 0;
        let totalRevenue = 0;

        bills.forEach(bill => {
          bill.items.forEach(item => {
            const revenue = item.price * item.quantity;
            if (itemMap[item.id]) {
              itemMap[item.id].totalQuantity += item.quantity;
              itemMap[item.id].totalRevenue += revenue;
            } else {
              itemMap[item.id] = {
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                totalQuantity: item.quantity,
                totalRevenue: revenue,
              };
            }
            totalQuantity += item.quantity;
            totalRevenue += revenue;
          });
        });

        const analyticsArray = Object.values(itemMap);
        setItemAnalytics(analyticsArray);
        setGrandTotalQuantity(totalQuantity);
        setGrandTotalRevenue(totalRevenue);
      } catch (err) {
        setError("Failed to load bills. Please try again." + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [startDate, endDate]);

  // Sort by number of items sold (descending)
  const sortedByQuantity = [...itemAnalytics].sort((a, b) => b.totalQuantity - a.totalQuantity);

  // Sort by revenue generated (descending)
  const sortedByRevenue = [...itemAnalytics].sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl text-black font-bold text-center mb-6">Analytics Dashboard</h1>
      <div className="mb-6 flex gap-4 justify-center">
        <div>
          <label className="block text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate.toISOString().split("T")[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="p-2 border rounded text-black"
          />
        </div>
        <div>
          <label className="block text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate.toISOString().split("T")[0]}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            className="p-2 border rounded text-black"
          />
        </div>
        <div>
            <label className="block text-gray-700">Check By Revenue</label>
            <ToggleSwitch
                isOn={isRevenue}
                onToggle={() => setIsRevenue((prev) => !prev)}
            />
        </div>
      </div>
      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && documents.length === 0 && !error && (
        <p className="text-center text-gray-600">No bills found for the selected date range.</p>
      )}
      {!loading && documents.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4 text-black">Item Analytics</h2>
          <p className="text-gray-600 mb-4">
            Grand Total Quantity Sold: {grandTotalQuantity} | Grand Total Revenue: ₹{grandTotalRevenue.toFixed(2)}
          </p>

        {!isRevenue && <h3 className="text-xl font-semibold mb-2 text-gray-800">Items Sorted by Number Sold</h3>}
        {isRevenue && <h3 className="text-xl font-semibold mb-2 text-gray-800">Items Sorted by Revenue Generated</h3>}
        {!isRevenue && 
            <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-200 text-gray-400">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Quantity Sold</th>
                    <th className="p-2 text-left">Revenue (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedByQuantity.map((item) => (
                    <tr key={item.id} className="border-b text-black">
                        <td className="p-2">{item.name} - {item.category} (₹{item.price.toFixed(2)})</td>
                        <td className="p-2">{item.totalQuantity}</td>
                        <td className="p-2">₹{item.totalRevenue.toFixed(2)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        }
        {isRevenue &&
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-200 text-gray-400">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Quantity Sold</th>
                    <th className="p-2 text-left">Revenue (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedByRevenue.map((item) => (
                    <tr key={item.id} className="border-b text-black">
                        <td className="p-2">{item.name} - {item.category} (₹{item.price.toFixed(2)})</td>
                        <td className="p-2">{item.totalQuantity}</td>
                        <td className="p-2">₹{item.totalRevenue.toFixed(2)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        }
        </div>
      )}
    </div>
  );
}