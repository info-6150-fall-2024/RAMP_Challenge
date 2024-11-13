import { useCallback, useState, useEffect } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import { SetTransactionApprovalParams, Transaction } from "src/utils/types";
import { TransactionPane } from "./TransactionPane";
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types";

export const Transactions: TransactionsComponent = ({ transactions: initialTransactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch();

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions || []);

  // Confirm component mounting
  useEffect(() => {
    if (transactions !== initialTransactions) {
      setTransactions(initialTransactions || []);
    }
  }, [initialTransactions]);


  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      console.log(`Attempting to set approval for ID: ${transactionId} to ${newValue}`);

      // Update server to persist the approval change
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      });

      // Update local state to reflect the new approval status
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, approved: newValue }
            : transaction
        )
      );
    },
    [fetchWithoutCache]
  );

  if (transactions.length === 0) {
    return <div className="RampLoading--container">Loading...</div>;
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  );
};
