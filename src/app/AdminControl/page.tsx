"use client";
import { useState, useEffect } from "react";
import { MenuItem } from "@/types";
import {  Timestamp } from "firebase/firestore";
import { getBills } from "../Utilities/firebaseHelper";

interface Bill {
  id:string,
  items: MenuItem[];
  total: number;
  status: string;
  upi: number;
  cash: number;
  time: Timestamp;
}



export default function Admin() {
  const [documents, setDocuments] = useState<Bill[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setHours(0, 0, 0, 0)) // Start of today
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().setHours(23, 59, 59, 999)) // End of today
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUpi, setTotalUpi] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [totalBill, setTotalBill] = useState(0);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      setError(null);
      try {
        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);
        const bills = await getBills(startTimestamp, endTimestamp);
        setDocuments(bills);
        const totalUpiAmt = bills.reduce((acc, bill) => acc + (bill.upi || 0), 0);
        const totalCashAmt = bills.reduce((acc, bill) => acc + (bill.cash || 0), 0);

        setTotalUpi(totalUpiAmt);
        setTotalCash(totalCashAmt);
        setTotalBill(totalUpiAmt+totalCashAmt);
      } catch (err) {
        setError("Failed to load bills. Please try again." + err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen bg-white p-6">
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
      </div>
      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && documents.length === 0 && !error && (
        <p className="text-center text-gray-600">No bills found for the selected date range.</p>
      )}
      {!loading && documents.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex gap-6 text-gray-600 font-semibold">
              <span>Bills: ₹{totalBill.toFixed(2)}</span>
              <span>Total UPI: ₹{totalUpi.toFixed(2)}</span>
              <span>Total Cash: ₹{totalCash.toFixed(2)}</span>
              <span>Bill Counts: {documents.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-400">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Items</th>
                  <th className="p-2 text-left">Total (₹)</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Paid UPI (₹)</th>
                  <th className="p-2 text-left">Paid Cash (₹)</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b text-black">
                    <td className="p-2">{doc.id}</td>
                    <td className="p-2">
                      <ul className="list-disc pl-4">
                        {doc.items.map((item, index) => (
                          <li key={index}>
                            {item.name} (₹{item.price.toFixed(2)} x {item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2">₹{doc.total.toFixed(2)}</td>
                    <td className="p-2">{doc.status}</td>
                    <td className="p-2">₹{doc.upi.toFixed(2)}</td>
                    <td className="p-2">₹{doc.cash.toFixed(2)}</td>
                    <td className="p-2">{doc.time.toDate().toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}