import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Define interface for expense item
interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  paidBy: string;
  isShared: boolean;
  sharedWith: string[];
  split: Record<string, number>;
}

// Categories for expenses
const CATEGORIES = [
  "Rent",
  "Utilities",
  "Groceries",
  "Takeout",
  "Entertainment",
  "Transport",
  "Household",
  "Other"
];

const Budgeting = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [flatmates, setFlatmates] = useState<string[]>(["You", "Flatmate 1", "Flatmate 2"]);
  const [activeTab, setActiveTab] = useState<string>("expenses");
  
  // Form state for adding new expenses
  const [newExpense, setNewExpense] = useState<Omit<Expense, "id" | "split">>({
    category: CATEGORIES[0],
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    paidBy: "You",
    isShared: false,
    sharedWith: [],
  });

  // Calculate balances
  const balances = useMemo(() => {
    const balanceSheet: Record<string, Record<string, number>> = {};
    
    // Initialize balance sheet
    flatmates.forEach(person => {
      balanceSheet[person] = {};
      flatmates.forEach(otherPerson => {
        if (person !== otherPerson) {
          balanceSheet[person][otherPerson] = 0;
        }
      });
    });
    
    // Calculate who owes whom
    expenses.forEach(expense => {
      const { paidBy, isShared, split, amount } = expense;
      
      if (isShared) {
        // Handle custom split case
        if (Object.keys(split || {}).length > 0) {
          Object.entries(split).forEach(([person, share]) => {
            if (person !== paidBy) {
              balanceSheet[person][paidBy] = (balanceSheet[person][paidBy] || 0) + share;
              balanceSheet[paidBy][person] = (balanceSheet[paidBy][person] || 0) - share;
            }
          });
        } else {
          // Equal split between sharedWith people
          const sharedPeople = expense.sharedWith.length > 0 ? expense.sharedWith : flatmates;
          const splitAmount = amount / sharedPeople.length;
          
          sharedPeople.forEach(person => {
            if (person !== paidBy) {
              balanceSheet[person][paidBy] = (balanceSheet[person][paidBy] || 0) + splitAmount;
              balanceSheet[paidBy][person] = (balanceSheet[paidBy][person] || 0) - splitAmount;
            }
          });
        }
      }
    });
    
    // Simplify the balances
    const simplifiedBalances: Record<string, number> = {};
    flatmates.forEach(person => {
      simplifiedBalances[person] = 0;
      
      flatmates.forEach(otherPerson => {
        if (person !== otherPerson) {
          simplifiedBalances[person] += balanceSheet[person][otherPerson] || 0;
        }
      });
    });
    
    return {
      detailed: balanceSheet,
      simplified: simplifiedBalances
    };
  }, [expenses, flatmates]);
  
  // Calculate expense breakdown by category
  const expenseByCategory = useMemo(() => {
    const breakdown: Record<string, number> = {};
    
    CATEGORIES.forEach(category => {
      breakdown[category] = 0;
    });
    
    expenses.forEach(expense => {
      breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount;
    });
    
    return breakdown;
  }, [expenses]);
  
  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);
  
  // Add a new expense
  const handleAddExpense = () => {
    if (newExpense.amount <= 0) return;
    
    // Create equal split amounts if it's a shared expense
    const split: Record<string, number> = {};
    if (newExpense.isShared) {
      const sharedPeople = newExpense.sharedWith.length > 0 ? newExpense.sharedWith : flatmates;
      const splitAmount = newExpense.amount / sharedPeople.length;
      
      sharedPeople.forEach(person => {
        split[person] = splitAmount;
      });
    }
    
    const expenseWithId: Expense = {
      ...newExpense,
      id: Date.now().toString(),
      split,
    };
    
    setExpenses(prev => [...prev, expenseWithId]);
    
    // Reset form
    setNewExpense({
      category: CATEGORIES[0],
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      paidBy: "You",
      isShared: false,
      sharedWith: [],
    });
  };
  
  // Delete an expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };
  
  // Handle form changes
  const handleExpenseChange = (field: keyof typeof newExpense, value: any) => {
    setNewExpense(prev => ({ ...prev, [field]: value }));
  };
  
  // Toggle flatmate selection in sharedWith
  const toggleFlatmateSelection = (flatmate: string) => {
    if (newExpense.sharedWith.includes(flatmate)) {
      setNewExpense(prev => ({
        ...prev,
        sharedWith: prev.sharedWith.filter(f => f !== flatmate),
      }));
    } else {
      setNewExpense(prev => ({
        ...prev,
        sharedWith: [...prev.sharedWith, flatmate],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 21V16h4v5"
                />
              </svg>
              <span className="ml-2 text-3xl font-extrabold text-white tracking-wide">
                flatmade
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition">
                Home
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition">
                About Us
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Household Budget Manager</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-white/20 mb-8">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'expenses' ? 'text-white border-b-2 border-white' : 'text-white/70 hover:text-white'}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expense Tracking
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'splitting' ? 'text-white border-b-2 border-white' : 'text-white/70 hover:text-white'}`}
            onClick={() => setActiveTab('splitting')}
          >
            Bill Splitting
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'dashboard' ? 'text-white border-b-2 border-white' : 'text-white/70 hover:text-white'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </div>
        
        {/* Expense Tracking Section */}
        {activeTab === 'expenses' && (
          <section>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Add New Expense</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Category</label>
                  <select 
                    className="w-full bg-white/5 text-white border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newExpense.category}
                    onChange={(e) => handleExpenseChange('category', e.target.value)}
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category} className="bg-purple-900">{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Amount (£)</label>
                  <input 
                    type="number"
                    className="w-full bg-white/5 text-white border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newExpense.amount || ''}
                    onChange={(e) => handleExpenseChange('amount', parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Date</label>
                  <input 
                    type="date"
                    className="w-full bg-white/5 text-white border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newExpense.date}
                    onChange={(e) => handleExpenseChange('date', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Paid By</label>
                  <select 
                    className="w-full bg-white/5 text-white border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newExpense.paidBy}
                    onChange={(e) => handleExpenseChange('paidBy', e.target.value)}
                  >
                    {flatmates.map(flatmate => (
                      <option key={flatmate} value={flatmate} className="bg-purple-900">{flatmate}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    id="isShared" 
                    className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                    checked={newExpense.isShared}
                    onChange={(e) => handleExpenseChange('isShared', e.target.checked)}
                  />
                  <label htmlFor="isShared" className="text-white font-medium">This is a shared expense</label>
                </div>
                
                {newExpense.isShared && (
                  <div className="ml-6 mt-2">
                    <p className="text-white text-sm mb-2">Share with:</p>
                    <div className="flex flex-wrap gap-2">
                      {flatmates.map(flatmate => (
                        <button
                          key={flatmate}
                          className={`px-3 py-1 rounded-full text-sm ${
                            newExpense.sharedWith.includes(flatmate) || flatmate === newExpense.paidBy
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          } ${flatmate === newExpense.paidBy ? 'cursor-not-allowed opacity-70' : ''}`}
                          onClick={() => {
                            if (flatmate !== newExpense.paidBy) {
                              toggleFlatmateSelection(flatmate);
                            }
                          }}
                          disabled={flatmate === newExpense.paidBy}
                        >
                          {flatmate}
                          {flatmate === newExpense.paidBy && " (Paid)"}
                        </button>
                      ))}
                    </div>
                    <p className="text-white/70 text-xs mt-2">
                      {newExpense.sharedWith.length === 0 
                        ? "If none selected, expense will be split equally among all flatmates" 
                        : `Expense will be split equally among ${[newExpense.paidBy, ...newExpense.sharedWith].join(', ')}`}
                    </p>
                  </div>
                )}
              </div>
              
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition"
                onClick={handleAddExpense}
              >
                Add Expense
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Expenses</h2>
              
              {expenses.length === 0 ? (
                <p className="text-white/70 italic">No expenses added yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="px-4 py-2 text-left text-white">Category</th>
                        <th className="px-4 py-2 text-left text-white">Amount</th>
                        <th className="px-4 py-2 text-left text-white">Date</th>
                        <th className="px-4 py-2 text-left text-white">Paid By</th>
                        <th className="px-4 py-2 text-left text-white">Split</th>
                        <th className="px-4 py-2 text-left text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(expense => (
                        <tr key={expense.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="px-4 py-2 text-white">{expense.category}</td>
                          <td className="px-4 py-2 text-white">£{expense.amount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-white">{new Date(expense.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-white">{expense.paidBy}</td>
                          <td className="px-4 py-2 text-white">
                            {expense.isShared ? (
                              expense.sharedWith.length > 0 
                                ? `Shared with ${expense.sharedWith.join(', ')}` 
                                : "Shared with all"
                            ) : (
                              "Individual"
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Bill Splitting Section */}
        {activeTab === 'splitting' && (
          <section>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Balance Summary</h2>
              
              {expenses.length === 0 ? (
                <p className="text-white/70 italic">No expenses added yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {flatmates.map(person => {
                    const balance = balances.simplified[person] || 0;
                    return (
                      <div 
                        key={person} 
                        className={`p-4 rounded-lg ${
                          balance > 0 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : balance < 0 
                              ? 'bg-red-500/20 border border-red-500/30' 
                              : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <h3 className="text-lg font-medium text-white mb-2">{person}</h3>
                        <p className={`text-2xl font-bold ${
                          balance > 0 
                            ? 'text-green-400' 
                            : balance < 0 
                              ? 'text-red-400' 
                              : 'text-white'
                        }`}>
                          {balance > 0 ? `Gets £${Math.abs(balance).toFixed(2)}` : 
                           balance < 0 ? `Owes £${Math.abs(balance).toFixed(2)}` : 
                           `£0.00 (Settled)`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Detailed Balances</h2>
              
              {expenses.length === 0 ? (
                <p className="text-white/70 italic">No expenses added yet</p>
              ) : (
                <div className="space-y-4">
                  {flatmates.map(person => {
                    const owes: {person: string, amount: number}[] = [];
                    const isOwed: {person: string, amount: number}[] = [];
                    
                    flatmates.forEach(otherPerson => {
                      if (person !== otherPerson) {
                        const amount = balances.detailed[person][otherPerson];
                        if (amount > 0) {
                          owes.push({ person: otherPerson, amount });
                        } else if (amount < 0) {
                          isOwed.push({ person: otherPerson, amount: Math.abs(amount) });
                        }
                      }
                    });
                    
                    return (
                      <div key={person} className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">{person}</h3>
                        
                        {owes.length === 0 && isOwed.length === 0 ? (
                          <p className="text-white/70">No outstanding balances</p>
                        ) : (
                          <div className="space-y-2">
                            {owes.length > 0 && (
                              <div>
                                <p className="text-red-400 font-medium">Owes:</p>
                                <ul className="list-disc list-inside text-white">
                                  {owes.map(({ person: owedTo, amount }) => (
                                    <li key={owedTo}>£{amount.toFixed(2)} to {owedTo}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {isOwed.length > 0 && (
                              <div>
                                <p className="text-green-400 font-medium">Is owed:</p>
                                <ul className="list-disc list-inside text-white">
                                  {isOwed.map(({ person: owedBy, amount }) => (
                                    <li key={owedBy}>£{amount.toFixed(2)} from {owedBy}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Dashboard Section */}
        {activeTab === 'dashboard' && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">Expense Summary</h2>
                
                {expenses.length === 0 ? (
                  <p className="text-white/70 italic">No expenses added yet</p>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-white mb-4">
                      Total Expenses: £{totalExpenses.toFixed(2)}
                    </p>
                    
                    <div className="space-y-2">
                      {Object.entries(expenseByCategory)
                        .filter(([_, amount]) => amount > 0)
                        .sort(([_, a], [__, b]) => b - a)
                        .map(([category, amount]) => {
                          const percentage = (amount / totalExpenses) * 100;
                          return (
                            <div key={category}>
                              <div className="flex justify-between text-white mb-1">
                                <span>{category}</span>
                                <span>£{amount.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2.5">
                                <div 
                                  className="bg-purple-600 h-2.5 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">Expense Breakdown</h2>
                
                {expenses.length === 0 ? (
                  <p className="text-white/70 italic">No expenses added yet</p>
                ) : (
                  <div className="h-64 flex items-end justify-around space-x-2">
                    {Object.entries(expenseByCategory)
                      .filter(([_, amount]) => amount > 0)
                      .sort(([_, a], [__, b]) => b - a)
                      .slice(0, 6) // Show top 6 categories
                      .map(([category, amount]) => {
                        const percentage = (amount / totalExpenses) * 100;
                        const height = `${Math.max(5, percentage)}%`;
                        
                        return (
                          <div key={category} className="flex flex-col items-center">
                            <div 
                              className="w-10 md:w-16 bg-purple-600 rounded-t-md relative group"
                              style={{ height }}
                            >
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white/80 text-purple-900 text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                £{amount.toFixed(2)} ({percentage.toFixed(1)}%)
                              </div>
                            </div>
                            <span className="text-white text-xs mt-2 truncate w-14 md:w-20 text-center">{category}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Budgeting; 