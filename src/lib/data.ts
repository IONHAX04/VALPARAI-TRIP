import {
  ref,
  get,
  set,
  push,
  child,
  remove,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';
import { db } from './firebase';
import type { DashboardData, Member, Expense, TripDay, Income } from '@/lib/types';

// Helper function to transform snapshot data from Realtime DB
const snapshotToArray = (snapshot: any) => {
    const data: any[] = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot: any) => {
            data.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
    }
    return data;
}

// TripDay Functions
export const getTripDays = async (): Promise<TripDay[]> => {
  const tripDaysRef = ref(db, 'tripDays');
  const q = query(tripDaysRef, orderByChild('date'));
  const snapshot = await get(q);
  const data = snapshotToArray(snapshot);
  return data.map(d => ({ ...d, date: new Date(d.date) })) as TripDay[];
};

export const addTripDay = async (
  tripDay: Omit<TripDay, 'id' | 'date'> & { date: Date }
) => {
  const tripDaysRef = ref(db, 'tripDays');
  const newTripDayRef = push(tripDaysRef);
  await set(newTripDayRef, { ...tripDay, date: tripDay.date.toISOString() });
  return newTripDayRef.key;
};

export const updateTripDay = async (
  id: string,
  tripDay: Omit<TripDay, 'id' | 'date'> & { date: Date }
) => {
  const tripDayRef = ref(db, `tripDays/${id}`);
  await set(tripDayRef, { ...tripDay, date: tripDay.date.toISOString() });
};

export const deleteTripDay = async (id: string) => {
  const tripDayRef = ref(db, `tripDays/${id}`);
  await remove(tripDayRef);
};

// Member Functions
export const getMembers = async (): Promise<Member[]> => {
  const membersRef = ref(db, 'members');
  const snapshot = await get(membersRef);
  return snapshotToArray(snapshot) as Member[];
};

export const addMember = async (member: Omit<Member, 'id'>) => {
  const membersRef = ref(db, 'members');
  const newMemberRef = push(membersRef);
  await set(newMemberRef, member);
  return newMemberRef.key;
};

export const updateMember = async (id: string, member: Omit<Member, 'id'>) => {
  const memberRef = ref(db, `members/${id}`);
  await set(memberRef, member);
};

export const deleteMember = async (id: string) => {
  const memberRef = ref(db, `members/${id}`);
  await remove(memberRef);
};

// Expense Functions
export const getExpenses = async (): Promise<Expense[]> => {
    const expensesRef = ref(db, 'expenses');
    const q = query(expensesRef, orderByChild('timestamp'));
    const snapshot = await get(q);
    const data = snapshotToArray(snapshot);
    // Realtime DB sorts ascending, so we reverse for descending order
    return data.map(d => ({ ...d, timestamp: new Date(d.timestamp) })).reverse() as Expense[];
};

export const addExpense = async (expense: Omit<Expense, 'id'|'timestamp'>) => {
    const expensesRef = ref(db, 'expenses');
    const newExpenseRef = push(expensesRef);
    await set(newExpenseRef, {...expense, timestamp: new Date().toISOString() });
    return newExpenseRef.key;
};

export const updateExpense = async (id: string, expense: Omit<Expense, 'id' | 'timestamp'> & { timestamp?: Date | string }) => {
    const docRef = ref(db, `expenses/${id}`);
    const existingExpenseSnap = await get(docRef);
    const existingExpense = existingExpenseSnap.val();

    await set(docRef, {
      ...expense,
      // Preserve original timestamp if not provided in update
      timestamp: expense.timestamp ? (expense.timestamp instanceof Date ? expense.timestamp.toISOString() : expense.timestamp) : existingExpense.timestamp
    });
};

export const deleteExpense = async (id: string) => {
    const docRef = ref(db, `expenses/${id}`);
    await remove(docRef);
};

// Income Functions
export const getIncomes = async (): Promise<Income[]> => {
    const incomesRef = ref(db, 'incomes');
    const q = query(incomesRef, orderByChild('timestamp'));
    const snapshot = await get(q);
    const data = snapshotToArray(snapshot);
    // Realtime DB sorts ascending, so we reverse for descending order
    return data.map(d => ({ ...d, timestamp: new Date(d.timestamp) })).reverse() as Income[];
};

export const addIncome = async (income: Omit<Income, 'id'|'timestamp'>) => {
    const incomesRef = ref(db, 'incomes');
    const newIncomeRef = push(incomesRef);
    await set(newIncomeRef, {...income, timestamp: new Date().toISOString() });
    return newIncomeRef.key;
};

export const updateIncome = async (id: string, income: Omit<Income, 'id' | 'timestamp'> & { timestamp?: Date | string }) => {
    const docRef = ref(db, `incomes/${id}`);
    const existingIncomeSnap = await get(docRef);
    const existingIncome = existingIncomeSnap.val();

    await set(docRef, {
      ...income,
      // Preserve original timestamp if not provided in update
      timestamp: income.timestamp ? (income.timestamp instanceof Date ? income.timestamp.toISOString() : income.timestamp) : existingIncome.timestamp
    });
};

export const deleteIncome = async (id: string) => {
    const docRef = ref(db, `incomes/${id}`);
    await remove(docRef);
};


// Dashboard Data
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const [tripDays, members, expenses, incomes] = await Promise.all([
      getTripDays(),
      getMembers(),
      getExpenses(),
      getIncomes(),
    ]);

    const overallBudget = tripDays.reduce((sum, day) => sum + day.budget, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const remainingBudget = overallBudget + totalIncomes - totalExpenses;

    return {
      overallBudget,
      totalExpenses,
      remainingBudget,
      totalIncomes,
      members: members || [],
      expenses: expenses || [],
      tripDays: tripDays || [],
      incomes: incomes || [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data.", error);
    // Return a default empty state if rules deny access or data is not present
    return {
      overallBudget: 0,
      totalExpenses: 0,
      remainingBudget: 0,
      totalIncomes: 0,
      members: [],
      expenses: [],
      tripDays: [],
      incomes: [],
    };
  }
};
