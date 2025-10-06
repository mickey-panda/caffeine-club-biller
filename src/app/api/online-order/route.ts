// File: app/api/online-order/route.ts

"use server";

import { db } from '../../Firebase/firebase'; // Adjust path to your Firebase config
import { 
  collection, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  DocumentData
} from 'firebase/firestore';

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

// Define the interface for the entire order
interface Order {
  id?: string; // Add optional id for client-side use
  items: OrderItem[];
  total: number;
  slot: Date;
  createdAt: Timestamp;
  status: OrderStatus;
}

/**
 * GET method to fetch orders within a specified date range.
 * Example Usage: /api/online-order?startDate=2023-10-26&endDate=2023-10-27
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  if (!startDateStr || !endDateStr) {
    return new Response(JSON.stringify({ message: 'Both startDate and endDate query parameters are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const startDate = new Date(startDateStr);
    // Set end date to the end of the day
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    const ordersRef = collection(db, 'online-orders');
    const q = query(
      ordersRef,
      where('slot', '>=', Timestamp.fromDate(startDate)),
      where('slot', '<=', Timestamp.fromDate(endDate))
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc: DocumentData) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });

    return new Response(JSON.stringify({ message: 'Orders retrieved successfully', data: orders }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error retrieving orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ message: 'Error retrieving orders', error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST method to create a new order.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { cart, discounted, selectedSlot } = body;

    if (!cart || !discounted || !selectedSlot) {
      return new Response(JSON.stringify({ message: 'Missing required order data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orderData: Omit<Order, 'id'> = {
      items: cart,
      total: discounted,
      slot: new Date(selectedSlot),
      createdAt: Timestamp.now(),
      status: "placed"
    };

    const docRef = await addDoc(collection(db, 'online-orders'), orderData);

    return new Response(JSON.stringify({ message: 'Order saved successfully', orderId: docRef.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error saving order to Firestore:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ message: 'Error saving order', error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * PUT method to update an existing order, primarily for changing the status.
 * Expects a body like: { "orderId": "some-id", "status": "confirmed" }
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return new Response(JSON.stringify({ message: 'Missing orderId or status in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orderRef = doc(db, 'online-orders', orderId);
    await updateDoc(orderRef, {
      status: status
    });

    return new Response(JSON.stringify({ message: `Order ${orderId} updated successfully` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error updating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ message: 'Error updating order', error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
