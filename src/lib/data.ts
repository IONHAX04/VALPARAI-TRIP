import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { DashboardData, Member, Expense, TripDay } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

// Collection References
const tripDaysCollection = collection(db, 'tripDays');
const membersCollection = collection(db, 'members');
const expensesCollection = collection(db, 'expenses');

// TripDay Functions
export const getTripDays = async (): Promise<TripDay[]> => {
  const q = query(tripDaysCollection, orderBy('date', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as TripDay)
  );
};

export const addTripDay = async (
  tripDay: Omit<TripDay, 'id' | 'date'> & { date: Date }
) => {
  const { date, ...rest } = tripDay;
  const newDoc = await addDoc(tripDaysCollection, {
    ...rest,
    date: Timestamp.fromDate(date),
  });
  return newDoc.id;
};

export const updateTripDay = async (
  id: string,
  tripDay: Omit<TripDay, 'id' | 'date'> & { date: Date }
) => {
  const { date, ...rest } = tripDay;
  const docRef = doc(db, 'tripDays', id);
  await updateDoc(docRef, { ...rest, date: Timestamp.fromDate(date) });
};

export const deleteTripDay = async (id: string) => {
  const docRef = doc(db, 'tripDays', id);
  await deleteDoc(docRef);
};

// Member Functions
export const getMembers = async (): Promise<Member[]> => {
  const snapshot = await getDocs(membersCollection);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Member));
};

export const addMember = async (member: Omit<Member, 'id'>) => {
  const newDoc = await addDoc(membersCollection, member);
  return newDoc.id;
};

export const updateMember = async (id: string, member: Omit<Member, 'id'>) => {
  const docRef = doc(db, 'members', id);
  await updateDoc(docRef, member);
};

export const deleteMember = async (id: string) => {
  const docRef = doc(db, 'members', id);
  await deleteDoc(docRef);
};

// Expense Functions
export const getExpenses = async (): Promise<Expense[]> => {
    const q = query(expensesCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({...doc.data(), id: doc.id} as Expense));
};

export const addExpense = async (expense: Omit<Expense, 'id'|'timestamp'>) => {
  const newDoc = await addDoc(expensesCollection, {
      ...expense,
      timestamp: Timestamp.now(),
  });
  return newDoc.id;
};

export const updateExpense = async (id: string, expense: Omit<Expense, 'id' | 'timestamp'>) => {
    const docRef = doc(db, 'expenses', id);
    await updateDoc(docRef, expense);
};

export const deleteExpense = async (id: string) => {
    const docRef = doc(db, 'expenses', id);
    await deleteDoc(docRef);
};


// Dashboard Data
export const getDashboardData = async (): Promise<DashboardData> => {
  const [tripDays, members, expenses] = await Promise.all([
    getTripDays(),
    getMembers(),
    getExpenses(),
  ]);

  const overallBudget = tripDays.reduce((sum, day) => sum + day.budget, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = overallBudget - totalExpenses;

  return {
    overallBudget,
    totalExpenses,
    remainingBudget,
    members,
    expenses,
    tripDays,
  };
};

// Mock data has been removed and replaced with Firestore calls.
// The functions below are for reference to what was removed.
export const getMockDashboardData = async (): Promise<DashboardData> => ({ overallBudget: 0, totalExpenses: 0, remainingBudget: 0, members: [], expenses: [], tripDays: [] });
export const getMockTripDays = async (): Promise<TripDay[]> => [];
export const getMockMembers = async (): Promise<Member[]> => [];
export const MOCK_TRIP_DAYS: TripDay[] = [];
export const MOCK_MEMBERS: Member[] = [];
export const MOCK_EXPENSES: Expense[] = [];
