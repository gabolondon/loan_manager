export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  assignedTo: string;
  startDate: string;
  payments: Payment[];
  description: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
}