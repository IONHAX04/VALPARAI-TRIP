
export interface TripDay {
  id: string;
  date: Date;
  places: string;
  budget: number;
}

export interface Member {
  id:string;
  name: string;
  role: string;
}

export interface Expense {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  purpose: string;
  timestamp: Date;
}

export interface DashboardData {
    overallBudget: number;
    totalExpenses: number;
    remainingBudget: number;
    members: Member[];
    expenses: Expense[];
    tripDays: TripDay[];
}
