import { Timestamp,addDoc,collection, where, getDocs, query } from 'firebase/firestore';
import {db} from '../Firebase/firebase';
import { MenuItem } from '@/types';

interface Bill {
  id:string,
  items: MenuItem[];
  total: number;
  status: string;
  upi: number;
  cash: number;
  time: Timestamp;
  mobile:string;
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

export async function pushBillToFirebase (total : number, status : string, time : Timestamp, cash : number, upi : number, items : MenuItem[] | undefined, mobile : string|'' = ''){
    try{
      const docRef = await addDoc(collection(db,'bills'),{
        total : total,
        status : status,
        time : time,
        cash : cash,
        upi : upi,
        items : items,
        mobile : mobile,
      });
      console.log('Document written with ID : ',docRef.id);
    }catch{
      console.log('Push Bill Error');
    }
  }

export async function getBills(startDate: Timestamp, endDate: Timestamp): Promise<Bill[]> {
    try {
      const billsQuery = query(
        collection(db, "bills"),
        where("time", ">=", startDate),
        where("time", "<=", endDate)
      );
      const querySnapshot = await getDocs(billsQuery);
      const documents: Bill[] = querySnapshot.docs.map(doc => ({
          id:doc.id,
        ...doc.data(),
      })) as Bill[];
      return documents;
    } catch (error) {
      console.error("Failed to fetch bills:", error);
      return [];
    }
  }

export async function getPendingBills(startDate: Timestamp, endDate: Timestamp): Promise<Bill[]> {
    try {
      const billsQuery = query(
        collection(db, "bills"),
        where("time", ">=", startDate),
        where("time", "<=", endDate),
        where("status","==","Pending"),
      );
      const querySnapshot = await getDocs(billsQuery);
      const documents: Bill[] = querySnapshot.docs.map(doc => ({
          id:doc.id,
        ...doc.data(),
      })) as Bill[];
      return documents;
    } catch (error) {
      console.error("Failed to fetch pending bills:", error);
      return [];
    }
}

export async function getCashTransactions (startDate : Timestamp, endDate : Timestamp): Promise<CashTransaction[]>{
    try {
      const cashTransQuery = query(
        collection(db, "cash-transactions"),
        where("time", ">=", startDate),
        where("time", "<=", endDate)
      );
      const querySnapshot = await getDocs(cashTransQuery);
      const documents: CashTransaction[] = querySnapshot.docs.map(doc => ({
          id:doc.id,
        ...doc.data(),
      })) as CashTransaction[];
      return documents;
    } catch (error) {
      console.error("Failed to fetch cash transactions:", error);
      return [];
    }
}

export async function getUpiTransactions (startDate : Timestamp, endDate : Timestamp): Promise<UpiTransaction[]>{
    try {
      const upiTransQuery = query(
        collection(db, "upi-transactions"),
        where("time", ">=", startDate),
        where("time", "<=", endDate)
      );
      const querySnapshot = await getDocs(upiTransQuery);
      const documents: CashTransaction[] = querySnapshot.docs.map(doc => ({
          id:doc.id,
        ...doc.data(),
      })) as UpiTransaction[];
      return documents;
    } catch (error) {
      console.error("Failed to fetch Upi transactions:", error);
      return [];
    }
}