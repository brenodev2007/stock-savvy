import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  status: string;
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  hireDate: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  employees: Employee[];
  addTransactions: (txs: Transaction[]) => void;
  clearTransactions: () => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  removeEmployee: (id: string) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('stock-savvy-transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('stock-savvy-employees');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('stock-savvy-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('stock-savvy-employees', JSON.stringify(employees));
  }, [employees]);

  const addTransactions = (txs: Transaction[]) => {
    setTransactions(prev => [...prev, ...txs]);
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: crypto.randomUUID(),
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      employees,
      addTransactions,
      clearTransactions,
      addEmployee,
      removeEmployee,
      updateEmployee
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
