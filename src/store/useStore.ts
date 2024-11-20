import { create } from 'zustand';
import { User, Loan, Payment } from '../types';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Store {
  user: User | null;
  users: User[];
  loans: Loan[];
  setUser: (user: User | null) => void;
  addLoan: (loan: Loan) => Promise<void>;
  requestLoan: (
    loan: Omit<Loan, "id" | "payments" | "status">
  ) => Promise<void>;
  addPayment: (loanId: string, payment: Payment) => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchLoans: () => Promise<void>;
  fetchLoansByUser: (userId: string) => Promise<void>;
  updateLoanStatus: (
    loanId: string,
    status: "approved" | "rejected"
  ) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  user: null,
  users: [],
  loans: [],
  setUser: (user) => {
    set({ user });
  },
  addLoan: async (loan) => {
    try {
      await addDoc(collection(db, "loans"), { ...loan, status: "approved" });
      await get().fetchLoans();
    } catch (error) {
      console.error("Error adding loan:", error);
    }
  },
  requestLoan: async (loanData) => {
    try {
      const loan = {
        ...loanData,
        payments: [],
        status: "pending",
        id: crypto.randomUUID(),
      };
      await addDoc(collection(db, "loans"), loan);
      await get().fetchLoans();
    } catch (error) {
      console.error("Error requesting loan:", error);
    }
  },
  addPayment: async (loanId: string, payment: Payment) => {
    try {
      const loan = get().loans.find((l) => l.id === loanId);
      if (!loan) return;

      const loanRef = doc(db, "loans", loanId);
      await updateDoc(loanRef, {
        payments: [...loan.payments, payment],
      });
      await get().fetchLoans();
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  },
  updateLoanStatus: async (loanId: string, status: "approved" | "rejected") => {
    try {
      const loanRef = doc(db, "loans", loanId);
      await updateDoc(loanRef, { status });
      await get().fetchLoans();
    } catch (error) {
      console.error("Error updating loan status:", error);
    }
  },
  fetchUsers: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      })) as User[];
      set({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  },
  fetchLoans: async () => {
    try {
      const currentUser = get().user;
      if (!currentUser) return;

      let loansQuery;
      if (currentUser.isAdmin) {
        loansQuery = collection(db, "loans");
      } else {
        loansQuery = query(
          collection(db, "loans"),
          where("assignedTo", "==", currentUser.email)
        );
      }

      const querySnapshot = await getDocs(loansQuery);
      const loans = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Loan[];
      set({ loans });
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  },
  fetchLoansByUser: async (userId: string) => {
    // Add userId as parameter
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.log("User not found!"); // Log if no user found
        return; // Or handle this case differently
      }

      const userData = userDocSnap.data() as User;

      let loansQuery;
      if (userData.isAdmin) {
        // Check if admin using userDocSnap data
        loansQuery = collection(db, "loans");
      } else {
        loansQuery = query(
          collection(db, "loans"),
          where("assignedTo", "==", userData.email) // Use email from userData
        );
      }

      const querySnapshot = await getDocs(loansQuery);
      const loans = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Loan[];

      set({ loans });
    } catch (error) {
      console.error("Error fetching loans by user:", error);
    }
  },
}));