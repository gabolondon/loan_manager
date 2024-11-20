import React from 'react';
import { format, differenceInMonths } from 'date-fns';
import { DollarSign, Calendar, User, PlusCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Loan, Payment } from '../types';
import { useStore } from '../store/useStore';

interface Props {
  loan: Loan;
}

export const LoanCard: React.FC<Props> = ({ loan }) => {
  const { user, addPayment, updateLoanStatus } = useStore();

  const totalPaid =loan?.payments? loan?.payments.reduce((sum, payment) => sum + payment.amount, 0):0;
  const monthsSinceStart = differenceInMonths(new Date(), new Date(loan?.startDate))+1;
  const monthlyInterestRate = loan?.interestRate /100;
  const totalInterest = loan?.amount * monthlyInterestRate * monthsSinceStart;
  const totalWithInterest = loan?.amount + totalInterest;
  const remaining = totalWithInterest - totalPaid;
  const progress = (totalPaid / totalWithInterest) * 100;

  const handleAddPayment = () => {
    const amount = parseFloat(prompt('Enter payment amount:') || '0');
    if (amount > 0) {
      const payment: Payment = {
        id: crypto.randomUUID(),
        amount,
        date: new Date().toISOString(),
      };
      addPayment(loan?.id, payment);
    }
  };

  const handleUpdateStatus = (status: 'approved' | 'rejected') => {
    updateLoanStatus(loan?.id, status);
  };

  const isAdmin = user?.isAdmin;
  const isPending = loan?.status === 'pending';

  return (
    <div className="p-6 space-y-4 bg-white shadow-lg rounded-xl">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-gray-800">
            {loan?.description}
          </h3>
          <div className="flex items-center text-gray-600">
            <User size={16} className="mr-1" />
            <span className="text-sm">{loan?.assignedTo}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="text-green-500" />
          <span className="text-xl font-bold">
            ${loan?.amount && loan?.amount.toLocaleString()}
          </span>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
          <div className="flex items-center text-yellow-700">
            <Clock size={16} className="mr-2" />
            <span>Pending Approval</span>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateStatus("approved")}
                className="p-2 text-green-600 rounded-full hover:bg-green-50"
              >
                <CheckCircle size={20} />
              </button>
              <button
                onClick={() => handleUpdateStatus("rejected")}
                className="p-2 text-red-600 rounded-full hover:bg-red-50"
              >
                <XCircle size={20} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 transition-all bg-green-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Remaining</span>
              <p className="font-semibold text-red-500">
                ${remaining.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Interest Rate</span>
              <p className="font-semibold">{loan?.interestRate}%</p>
            </div>
            <div>
              <span className="text-gray-600">Interest Generated</span>
              <p className="font-semibold text-orange-500">
                ${totalInterest.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Total with Interest</span>
              <p className="font-semibold">
                ${totalWithInterest.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-1" />
              <span className="text-sm">
                {loan?.startDate&&format(
                  new Date(loan?.startDate),
                  "MMM d, yyyy"
                )}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={handleAddPayment}
                className="flex items-center px-4 py-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
              >
                <PlusCircle size={16} className="mr-2" />
                Add Payment
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};