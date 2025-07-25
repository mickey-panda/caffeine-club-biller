import { Timestamp,addDoc,collection, where, getDocs, query, updateDoc, doc, increment, getDoc } from 'firebase/firestore';
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
      if(docRef.id){
        if(cash>0){
            await pushCashTransaction(cash,'Bill - '+docRef.id, Timestamp.now());
        }
        if(upi>0){
            await pushUpiTransaction(upi,'Bill - '+docRef.id, Timestamp.now());
        }
      }
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

export async function pushCashTransaction(amount:number, reason:string, time: Timestamp) {
    try{
      const docRef = await addDoc(collection(db,'cash-transactions'),{
        amount : amount,
        reason : reason,
        time : time,
      });
      if(docRef.id){
        updateTotalCash(amount);
      }
    }catch(err){
      console.log('Push cash Error');
      throw err;
    }
}
export async function pushUpiTransaction(amount:number, reason:string, time: Timestamp) {
    try{
      const docRef = await addDoc(collection(db,'upi-transactions'),{
        amount : amount,
        reason : reason,
        time : time,
      });
      if(docRef.id){
        updateTotalUpi(amount);
      }
    }catch(err){
      console.log('Push upi Error');
      throw err;
    }
}

export async function updateTotalCash(amount:number) {
    try{
        const docRef = doc(db, "total-cash-register", "S4GHfpZ2V1W9CCUnM31s");
        await updateDoc(docRef, {
            total: increment(amount)
        });
    }catch(err){
        console.log('Could not update the total cash register', err);
    }
}

export async function updateTotalUpi(amount:number) {
    try{
        const docRef = doc(db, "total-upi-register", "wRQJwhxUyX4lK54ZOfcA");
        await updateDoc(docRef, {
            total: increment(amount)
        });
    }catch(err){
        console.log('Could not update the total cash register', err);
    }
}

export async function getTotalCashRegister():Promise<number>{
    try{
        const docRef = doc(db,'total-cash-register', 'S4GHfpZ2V1W9CCUnM31s');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Total:", data.total);
            return data.total as number;
        } else {
            console.log("No such document!");
            return 0;
        }
    }catch(err){
        console.log('could not get the total cash', err);
        return 0;
    }
}

export async function getTotalUpiRegister():Promise<number>{
    try{
        const docRef = doc(db,'total-upi-register', 'wRQJwhxUyX4lK54ZOfcA');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Total:", data.total);
            return data.total as number;
        } else {
            console.log("No such document!");
            return 0;
        }
    }catch(err){
        console.log('could not get the total upi', err);
        return 0;
    }
}