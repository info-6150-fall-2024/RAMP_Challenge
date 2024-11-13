import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee } from "./utils/types";

export function App() {
  const { data: employees, loading: employeesLoading, fetchAll: fetchEmployees } = useEmployees();
  const { data: paginatedTransactions, loading: transactionsLoading, fetchAll: fetchPaginatedTransactions } = usePaginatedTransactions();
  const { data: transactionsByEmployee, fetchById: fetchTransactionsByEmployee, invalidateData: clearTransactionsByEmployee } = useTransactionsByEmployee();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(EMPTY_EMPLOYEE);

  const transactions = useMemo(() => {
    return selectedEmployee && selectedEmployee !== EMPTY_EMPLOYEE
      ? transactionsByEmployee
      : paginatedTransactions?.data || null;
  }, [selectedEmployee, paginatedTransactions, transactionsByEmployee]);

  const loadAllTransactions = useCallback(async () => {
    setSelectedEmployee(EMPTY_EMPLOYEE);
    clearTransactionsByEmployee();
    await fetchEmployees();
    await fetchPaginatedTransactions();
  }, [clearTransactionsByEmployee, fetchEmployees, fetchPaginatedTransactions]);

  const loadTransactionsByEmployee = useCallback(
    async (employee: Employee) => {
      setSelectedEmployee(employee);
      await fetchTransactionsByEmployee(employee.id);
    },
    [fetchTransactionsByEmployee]
  );

  useEffect(() => {
    if (!employees && !employeesLoading) {
      loadAllTransactions();
    }
  }, [employees, employeesLoading, loadAllTransactions]);

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={employeesLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees ? [EMPTY_EMPLOYEE, ...employees] : []}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (!newValue || newValue === EMPTY_EMPLOYEE) { // Check if newValue is null or EMPTY_EMPLOYEE
              await loadAllTransactions();
            } else {
              await loadTransactionsByEmployee(newValue as Employee); // Safely cast newValue as Employee
            }
          }}

        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions && !transactionsByEmployee && (
            <button
              className="RampButton"
              disabled={transactionsLoading}
              onClick={async () => {
                await fetchPaginatedTransactions();
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  );
}
