import React, { useEffect, useState } from 'react';
import { Plus, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { LoanCard } from './LoanCard';
import { UserManagement } from './UserManagement';
import { Loan } from '../types';
import { auth } from '../config/firebase';

export const Dashboard: React.FC = () => {
  const { user, loans, addLoan, requestLoan, fetchLoans, fetchLoansByUser } = useStore();
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    if (user &&!user?.isAdmin) {
      fetchLoansByUser(user.uid);
    } else if (user) {
      fetchLoans();
    }
  }, [user, fetchLoansByUser]);

  const handleAddLoan = () => {
    if (!user?.isAdmin) return;

    const description = prompt('Enter loan description:');
    const amount = parseFloat(prompt('Enter loan amount:') || '0');
    const interestRate = parseFloat(prompt('Enter interest rate (%):') || '0');
    const assignedTo = prompt('Enter assigned user email:') || '';

    if (description && amount > 0 && interestRate > 0 && assignedTo) {
      const loan: Loan = {
        id: crypto.randomUUID(),
        description,
        amount,
        interestRate,
        assignedTo,
        startDate: new Date().toISOString(),
        payments: [],
        status: 'approved',
      };
      addLoan(loan);
    }
  };

  const handleRequestLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const description = form.description.value;
    const amount = parseFloat(form.amount.value);
    const interestRate = parseFloat(form.interestRate.value);

    if (description && amount > 0 && interestRate > 0 && user?.email) {
      requestLoan({
        description,
        amount,
        interestRate,
        assignedTo: user.email,
        startDate: new Date().toISOString(),
      });
      setShowRequestForm(false);
      form.reset();
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-4">
            {user?.isAdmin ? (
              <button
                onClick={handleAddLoan}
                className="flex items-center px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} className="mr-2" />
                New Loan
              </button>
            ) : (
              <button
                onClick={() => setShowRequestForm(true)}
                className="flex items-center px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} className="mr-2" />
                Request Loan
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center px-6 py-3 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {user?.isAdmin && <UserManagement />}

        {showRequestForm && !user?.isAdmin && (
          <div className="p-6 mb-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-4 text-xl font-semibold">Request a New Loan</h2>
            <form onSubmit={handleRequestLoan} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Loan Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  required
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="1"
                  step="0.01"
                  required
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  min="0.1"
                  step="0.1"
                  required
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      </div>
    </div>
  );
};