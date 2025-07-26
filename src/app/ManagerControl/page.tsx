"use client";
import { useState, useEffect } from "react";
import { MenuItem } from "@/types";
import { Timestamp } from "firebase/firestore";
import { getCashTransactions, getUpiTransactions, getPendingBills, getBills
  ,getTotalCashRegister, getTotalUpiRegister, pushCashTransaction, pushUpiTransaction
 } from "../Utilities/firebaseHelper";
import { PencilSquareIcon } from '@heroicons/react/24/solid';

interface Bill {
  id: string;
  items: MenuItem[];
  total: number;
  status: string;
  upi: number;
  cash: number;
  time: Timestamp;
  mobile: string;
}

interface CashTransaction{
    id:string;
    amount : number;
    reason : string;
    time : Timestamp;
}
interface UpiTransaction{
    id:string;
    amount : number;
    reason : string;
    time : Timestamp;
}

export default function Manager() {
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().setHours(23, 59, 59, 999))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [upiTransactions, setUpiTransactions] = useState<UpiTransaction[]>([]);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [selectedTab, setSelectedTab] = useState<"cash" | "upi" | "bills" | "pending">("bills");
  const [totalCash, setTotalCash] = useState<number>(0);
  const [totalUpi, setTotalUpi] = useState<number>(0);

  //for cashTransactions
  const [isCashTransModalOpen, setIsCashTransModalOpen] = useState(false);
  const [cashTransAmount, setCashTransAmount] = useState<string>("");
  const [cashTransReason, setCashTransReason] = useState<string>("");
  const [cashTransFormError, setCashTransFormError] = useState<string | null>(null);

  //for upi transactions
  const [isUpiTransModalOpen, setIsUpiTransModalOpen] = useState(false);
  const [upiTransAmount, setUpiTransAmount] = useState<string>("");
  const [upiTransReason, setUpiTransReason] = useState<string>("");
  const [upiTransFormError, setUpiTransFormError] = useState<string | null>(null);

  const fetchCashTransactions = async(startDate : Timestamp, endDate : Timestamp) => {
    try{
        const transactions = await getCashTransactions(startDate, endDate);
        setCashTransactions(transactions);
    }catch(err){
        setError("Failed to load Transactions. Please try again." + err);
    }
  }
  const fetchUpiTransactions = async(startDate : Timestamp, endDate : Timestamp) => {
    try{
        const transactions = await getUpiTransactions(startDate, endDate);
        setUpiTransactions(transactions);
    }catch(err){
        setError("Failed to load Transactions. Please try again." + err);
    }
  }
  const fetchPendingBills = async(startDate : Timestamp, endDate : Timestamp) => {
    try{
        const bills = await getPendingBills(startDate, endDate);
        setPendingBills(bills);
    }catch(err){
        setError("Failed to load Pending Bills. Please try again." + err);
    }
  }
  const fetchAllBills = async(startDate : Timestamp, endDate : Timestamp) => {
    try{
        const bills = await getBills(startDate, endDate);
        setAllBills(bills);
    }catch(err){
        setError("Failed to load all Bills. Please try again." + err);
    }
  }
  const fetchTotalCashRegister = async() => {
    const total = await getTotalCashRegister();
    setTotalCash(total);
  }
  const fetchTotalUpiRegister = async() => {
    const total = await getTotalUpiRegister();
    setTotalUpi(total);
  }
  const addNewCashTransaction = async(amount: number, reason: string) =>{
    try{
      await pushCashTransaction(amount, reason, Timestamp.now());
    }catch(err){
      console.log('error pushing the transaction', err);
    }
  }

  const addNewUpiTransaction = async(amount: number, reason: string) =>{
    try{
      await pushUpiTransaction(amount, reason, Timestamp.now());
    }catch(err){
      console.log('error pushing the transaction', err);
    }
  }

  const handleOpenCashModal = () => {
    setCashTransAmount("");
    setCashTransReason("");
    setCashTransFormError(null);
    setIsCashTransModalOpen(true);
  };
  const handleOpenUpiModal = () => {
    setUpiTransAmount("");
    setUpiTransReason("");
    setUpiTransFormError(null);
    setIsUpiTransModalOpen(true);
  };

  const handleCloseCashModal = () => {
    setIsCashTransModalOpen(false);
  };
  const handleCloseUpiModal = () => {
    setIsUpiTransModalOpen(false);
  };

  const handleSubmitCashModal = async () => {
    const amountNum = Number(cashTransAmount);
    if (isNaN(amountNum)) {
      setCashTransFormError("Please enter a valid amount.");
      return;
    }
    if (!cashTransReason.trim()) {
      setCashTransFormError("Reason is required.");
      return;
    }

    try {
      await addNewCashTransaction(amountNum, cashTransReason);
      handleCloseCashModal();
    } catch (e) {
      setCashTransFormError("Failed to add transaction. Try again.");
      console.error(e);
    }
  };

  const handleSubmitUpiModal = async () => {
    const amountNum = Number(upiTransAmount);
    if (isNaN(amountNum)) {
      setUpiTransFormError("Please enter a valid amount.");
      return;
    }
    if (!upiTransReason.trim()) {
      setUpiTransFormError("Reason is required.");
      return;
    }

    try {
      await addNewUpiTransaction(amountNum, upiTransReason);
      handleCloseUpiModal();
    } catch (e) {
      setUpiTransFormError("Failed to add transaction. Try again.");
      console.error(e);
    }
  };

  useEffect(() => {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    const fetchData = async() =>{
        setLoading(true);
        try{
            await Promise.all([fetchCashTransactions(startTimestamp, endTimestamp), 
                fetchUpiTransactions(startTimestamp, endTimestamp),
                fetchPendingBills(startTimestamp,endTimestamp),
                fetchAllBills(startTimestamp,endTimestamp)]);
                fetchTotalCashRegister();
                fetchTotalUpiRegister();
        }catch{
            setLoading(false);
            setError('Could not load data');
        }finally{
            setLoading(false);
        }
    }
    fetchData();
  }, [startDate, endDate]);


  return (
    <div className="min-h-screen bg-white p-6">
      {/* Date Filters */}
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
        <div className="flex items-center ml-16 mb-4">
          <div>
            <p className="text-gray-500 text-sm">Total Cash</p>
            <p className="text-xl font-semibold text-gray-800">{totalCash}</p>
          </div>
          <button 
            className="ml-3 p-1 text-gray-400 hover:text-green-600 transition-colors"
            onClick={handleOpenCashModal}>
            <PencilSquareIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center ml-16 mb-4">
          <div>
            <p className="text-gray-500 text-sm">Total UPI</p>
            <p className="text-xl font-semibold text-gray-800">{totalUpi}</p>
          </div>
          <button 
            className="ml-3 p-1 text-gray-400 hover:text-green-600 transition-colors"
            onClick={handleOpenUpiModal}>
            <PencilSquareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-4 mb-6">
        {["bills", "cash", "upi", "pending"].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as "bills" | "cash" | "upi" | "pending")}
            className={`px-4 py-2 rounded ${
              selectedTab === tab ? "bg-pink-500 text-white" : "bg-gray-200 text-black"
            }`}
          >
            {tab === "bills"
              ? "All Bills"
              : tab === "cash"
              ? "Cash Transactions"
              : tab === "upi"
              ? "UPI Transactions"
              : "Pendings"}
          </button>
        ))}
      </div>

      {/* Loading/Error */}
      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && selectedTab === 'bills' &&(
        <div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-400">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Items</th>
                  <th className="p-2 text-left">Total (₹)</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Upi Paid</th>
                  <th className="p-2 text-left">Cash Paid</th>
                  <th className="p-2 text-left">Mobile</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {allBills.map((doc) => (
                  <tr key={doc.id} className="border-b text-black">
                    <td className="p-2">{doc.id}</td>
                    <td className="p-2">
                      <ul className="list-disc pl-4">
                        {doc.items.map((item, index) => (
                          <li key={index}>
                            {item.name} - {item.category} (₹{item.price.toFixed(2)} x {item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2">₹{doc.total.toFixed(2)}</td>
                    <td className="p-2">{doc.status}</td>
                    <td className="p-2">₹{doc.upi.toFixed(2)}</td>
                    <td className="p-2">₹{doc.cash.toFixed(2)}</td>
                    <td className="p-2">{doc.mobile}</td>
                    <td className="p-2">{doc.time.toDate().toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      )}
      {!loading && selectedTab === 'upi' &&(
        <div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-400">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Reason</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {upiTransactions.map((upi) => (
                  <tr key={upi.id} className="border-b text-black">
                    <td className="p-2">{upi.id}</td>
                    <td className="p-2">{upi.reason}</td>
                    <td className="p-2">₹{upi.amount}</td>
                    <td className="p-2">{upi.time.toDate().toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!loading && selectedTab === 'cash' &&(
        <div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-400">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Reason</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {cashTransactions.map((cash) => (
                  <tr key={cash.id} className="border-b text-black">
                    <td className="p-2">{cash.id}</td>
                    <td className="p-2">{cash.reason}</td>
                    <td className="p-2">₹{cash.amount}</td>
                    <td className="p-2">{cash.time.toDate().toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!loading && selectedTab === 'pending' &&(
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-400">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Items</th>
                  <th className="p-2 text-left">Total (₹)</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Mobile</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {pendingBills.map((doc) => (
                  <tr key={doc.id} className="border-b text-black">
                    <td className="p-2">{doc.id}</td>
                    <td className="p-2">
                      <ul className="list-disc pl-4">
                        {doc.items.map((item, index) => (
                          <li key={index}>
                            {item.name} - {item.category} (₹{item.price.toFixed(2)} x {item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2">₹{doc.total.toFixed(2)}</td>
                    <td className="p-2">{doc.status}</td>
                    <td className="p-2">{doc.mobile}</td>
                    <td className="p-2">{doc.time.toDate().toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/*showing the cash transaction modal*/}
      {isCashTransModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseCashModal}
          />

          {/* Modal */}
          <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Add Cash Transaction
            </h3>

            {cashTransFormError && (
              <p className="mb-3 text-sm text-red-500">{cashTransFormError}</p>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-600">Amount (₹)</label>
              <input
                type="number"
                value={cashTransAmount}
                onChange={(e) => setCashTransAmount(e.target.value)}
                className="w-full rounded border p-2 text-black outline-none focus:border-pink-500"
                placeholder="Enter amount"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm text-gray-600">Reason</label>
              <input
                type="text"
                value={cashTransReason}
                onChange={(e) => setCashTransReason(e.target.value)}
                className="w-full rounded border p-2 text-black outline-none focus:border-pink-500"
                placeholder="Why are you editing cash?"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseCashModal}
                className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCashModal}
                className="rounded bg-pink-500 px-4 py-2 text-white hover:bg-pink-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/*showing the upi transaction modal*/}
      {isUpiTransModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseUpiModal}
          />

          {/* Modal */}
          <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Add UPI Transaction
            </h3>

            {upiTransFormError && (
              <p className="mb-3 text-sm text-red-500">{upiTransFormError}</p>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-600">Amount (₹)</label>
              <input
                type="number"
                value={upiTransAmount}
                onChange={(e) => setUpiTransAmount(e.target.value)}
                className="w-full rounded border p-2 text-black outline-none focus:border-pink-500"
                placeholder="Enter amount"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm text-gray-600">Reason</label>
              <input
                type="text"
                value={upiTransReason}
                onChange={(e) => setUpiTransReason(e.target.value)}
                className="w-full rounded border p-2 text-black outline-none focus:border-pink-500"
                placeholder="Why are you editing cash?"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseUpiModal}
                className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitUpiModal}
                className="rounded bg-pink-500 px-4 py-2 text-white hover:bg-pink-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
