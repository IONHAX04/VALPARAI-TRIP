import type { DashboardData, Member, Expense, TripDay } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

const now = new Date();

export const MOCK_TRIP_DAYS: TripDay[] = [
  { id: 'day1', date: Timestamp.fromDate(new Date(now.setDate(now.getDate() + 1))), places: 'Tea Estates, Nirar Dam', budget: 800 },
  { id: 'day2', date: Timestamp.fromDate(new Date(now.setDate(now.getDate() + 2))), places: 'Monkey Falls, Balaji Temple', budget: 1600 },
];

export const MOCK_MEMBERS: Member[] = [
  { id: 'member1', name: 'Alice', role: 'Organizer' },
  { id: 'member2', name: 'Bob', role: 'Driver' },
  { id: 'member3', name: 'Charlie', role: 'Cook' },
  { id: 'member4', name: 'Diana', role: 'Member' },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'exp1', memberId: 'member1', memberName: 'Alice', amount: 200, purpose: 'Gas', timestamp: Timestamp.fromDate(new Date()) },
  { id: 'exp2', memberId: 'member2', memberName: 'Bob', amount: 2000, purpose: 'Homestay', timestamp: Timestamp.fromDate(new Date()) },
  { id: 'exp3', memberId: 'member3', memberName: 'Charlie', amount: 200, purpose: 'Snacks', timestamp: Timestamp.fromDate(new Date()) },
  { id: 'exp4', memberId: 'member1', memberName: 'Alice', amount: 300, purpose: 'Lunch', timestamp: Timestamp.fromDate(new Date()) },
    { id: 'exp5', memberId: 'member4', memberName: 'Diana', amount: 150, purpose: 'Entry Tickets', timestamp: Timestamp.fromDate(new Date()) },
];

export const getMockDashboardData = async (): Promise<DashboardData> => {
  const overallBudget = MOCK_TRIP_DAYS.reduce((sum, day) => sum + day.budget, 0);
  const totalExpenses = MOCK_EXPENSES.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = overallBudget - totalExpenses;

  return {
    overallBudget,
    totalExpenses,
    remainingBudget,
    members: MOCK_MEMBERS,
    expenses: MOCK_EXPENSES,
    tripDays: MOCK_TRIP_DAYS,
  };
};

export const getMockTripDays = async (): Promise<TripDay[]> => {
    return MOCK_TRIP_DAYS;
}

export const getMockMembers = async (): Promise<Member[]> => {
    return MOCK_MEMBERS;
}
