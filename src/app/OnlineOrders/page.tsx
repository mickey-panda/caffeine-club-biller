"use client";
import { useState, useEffect, useMemo } from "react";

// Define the type for the order status
type OrderStatus = "placed" | "confirmed" | "paid" | "delivered" | "canceled" | "refunded";

// Define the interface for a single item in an order
interface OrderItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

// Define the type for Firestore's timestamp object
type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
};

// Define the interface for the entire order
interface Order {
  id: string; // The document ID from Firestore
  items: OrderItem[];
  total: number;
  slot: FirestoreTimestamp | Date; // Can be a timestamp object or a Date
  createdAt: FirestoreTimestamp;
  status: OrderStatus;
}

// **Helper function to safely format the slot time**
const formatSlotTime = (slot: FirestoreTimestamp | Date): string => {
  if (slot instanceof Date) {
    return slot.toLocaleString(); // It's already a Date object
  }
  // It's a Firestore timestamp object
  return new Date(slot.seconds * 1000).toLocaleString();
};


export default function OnlineOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setHours(0, 0, 0, 0)) // Start of today
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().setHours(23, 59, 59, 999)) // End of today
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize formatted dates for input fields
  const formattedStartDate = useMemo(() => startDate.toISOString().split("T")[0], [startDate]);
  const formattedEndDate = useMemo(() => endDate.toISOString().split("T")[0], [endDate]);
  const [showRevenue, setShowRevenue] = useState(false);

  // Function to handle status updates
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch('/api/online-order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status.');
      }

      // Update the status locally for immediate feedback
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };
  
  // Calculate total revenue and order count
  const { totalRevenue, orderCount } = useMemo(() => {
    const revenue = orders.reduce((acc, order) => acc + order.total, 0);
    return {
      totalRevenue: revenue,
      orderCount: orders.length,
    };
  }, [orders]);


  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      const startDateString = startDate.toISOString().split("T")[0];
      const endDateString = endDate.toISOString().split("T")[0];

      try {
        const response = await fetch(
          `/api/online-order?startDate=${startDateString}&endDate=${endDateString}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch orders.');
        }

        const data = await response.json();
        const fetchedOrders: Order[] = data.data || [];

        // **Sort the orders by slot in ascending order**
        const sortedOrders = fetchedOrders.sort((a, b) => {
          const aTime = a.slot instanceof Date ? a.slot.getTime() : a.slot.seconds * 1000;
          const bTime = b.slot instanceof Date ? b.slot.getTime() : b.slot.seconds * 1000;
          return aTime - bTime;
        });

        setOrders(sortedOrders); // Set the sorted array

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [startDate, endDate]);


  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6 flex gap-4 justify-center">
        <div>
          <label className="block text-gray-700">Start Date</label>
          <input
            type="date"
            value={formattedStartDate}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="p-2 border rounded text-black"
          />
        </div>
        <div>
          <label className="block text-gray-700">End Date</label>
          <input
            type="date"
            value={formattedEndDate}
            onChange={(e) => setEndDate(new Date(new Date(e.target.value).setHours(23, 59, 59, 999)))}
            className="p-2 border rounded text-black"
          />
        </div>
      </div>
      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && orders.length === 0 && !error && (
        <p className="text-center text-gray-600">No orders found for the selected date range.</p>
      )}
      {!loading && orders.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div onClick={()=>setShowRevenue(!showRevenue)} className="flex gap-6 text-gray-600 font-semibold mb-4">
              {showRevenue && <span>Total Revenue: ₹{totalRevenue.toFixed(2)}</span>}
              <span>Order Count: {orderCount}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-400">
                  <th className="p-2 text-left">Order ID</th>
                  <th className="p-2 text-left">Items</th>
                  <th className="p-2 text-left">Total (₹)</th>
                  <th className="p-2 text-left">Delivery Slot</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b text-black">
                    <td className="p-2 text-xs">{order.id}</td>
                    <td className="p-2">
                      <ul className="list-disc pl-4 text-sm">
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.name}-{item.category} (x{item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 text-sm">₹{order.total.toFixed(2)}</td>
                    <td className="p-2 text-sm font-semibold">
                      {/* Use the helper function here */}
                      {formatSlotTime(order.slot)}
                    </td>
                    <td className="p-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="p-2 border rounded text-black bg-gray-50"
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="paid">Paid</option>
                        <option value="delivered">Delivered</option>
                        <option value="canceled">Canceled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
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
