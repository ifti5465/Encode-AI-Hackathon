import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

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

// Define interfaces for gamification features
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  category?: string;
  timeframe: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  progress: number;
  completed: boolean;
  points: number;
}

interface UserProgress {
  userId: string;
  name: string;
  points: number;
  completedChallenges: string[];
  unlockedBadges: string[];
  level: number;
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

// Predefined list of badges
const BADGES: Badge[] = [
  {
    id: "b1",
    name: "Budget Beginner",
    description: "Added your first expense",
    icon: "✅",
    unlocked: false
  },
  {
    id: "b2",
    name: "Savings Star",
    description: "Completed 3 saving challenges",
    icon: "⭐",
    unlocked: false
  },
  {
    id: "b3",
    name: "Bill Splitter",
    description: "Split an expense between all flatmates",
    icon: "🤝",
    unlocked: false
  },
  {
    id: "b4",
    name: "Money Master",
    description: "Reached 500 points",
    icon: "💰",
    unlocked: false
  },
  {
    id: "b5",
    name: "Expense Tracker",
    description: "Logged expenses for 7 consecutive days",
    icon: "📊",
    unlocked: false
  }
];

// Predefined list of challenges
const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "Grocery Saver",
    description: "Spend less than £50 on groceries this week",
    target: 50,
    category: "Groceries",
    timeframe: "week",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    completed: false,
    points: 100
  },
  {
    id: "c2",
    title: "No Takeout Week",
    description: "Avoid takeout expenses for a whole week",
    target: 0,
    category: "Takeout",
    timeframe: "week",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    completed: false,
    points: 150
  },
  {
    id: "c3",
    title: "Entertainment Budget",
    description: "Keep entertainment expenses under £30 this week",
    target: 30,
    category: "Entertainment",
    timeframe: "week",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    completed: false,
    points: 100
  },
  {
    id: "c4",
    title: "Daily Logging",
    description: "Log at least one expense every day for a week",
    target: 7,
    timeframe: "week",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    completed: false,
    points: 120
  }
];

// User progress data - would typically come from a database
const INITIAL_USER_PROGRESS: UserProgress[] = [
  {
    userId: "user1",
    name: "You",
    points: 0,
    completedChallenges: [],
    unlockedBadges: [],
    level: 1
  },
  {
    userId: "user2",
    name: "Flatmate 1",
    points: 150,
    completedChallenges: ["c4"],
    unlockedBadges: ["b1"],
    level: 2
  },
  {
    userId: "user3",
    name: "Flatmate 2",
    points: 350,
    completedChallenges: ["c1", "c2"],
    unlockedBadges: ["b1", "b3"],
    level: 3
  }
];

const Budget = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [flatmates, setFlatmates] = useState<string[]>(["You", "Flatmate 1", "Flatmate 2"]);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  
  // Gamification state
  const [badges, setBadges] = useState<Badge[]>(BADGES);
  const [challenges, setChallenges] = useState<Challenge[]>(CHALLENGES);
  const [userProgress, setUserProgress] = useState<UserProgress[]>(INITIAL_USER_PROGRESS);
  const [currentUser, setCurrentUser] = useState<string>("You");
  
  // Form state for adding new expenses
  const [newExpense, setNewExpense] = useState<Omit<Expense, "id" | "split">>({
    category: CATEGORIES[0],
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    paidBy: "You",
    isShared: false,
    sharedWith: [],
  });

  // Function to calculate level based on points
  const calculateLevel = (points: number): number => {
    return Math.floor(points / 100) + 1;
  };

  // Calculate current user's progress
  const currentUserProgress = useMemo(() => {
    return userProgress.find(u => u.name === currentUser) || userProgress[0];
  }, [userProgress, currentUser]);

  // Update challenge progress whenever expenses change
  useEffect(() => {
    if (expenses.length === 0) return;

    // Create a copy of the challenges to update
    const updatedChallenges = [...challenges];
    
    updatedChallenges.forEach(challenge => {
      // Skip already completed challenges
      if (challenge.completed) return;
      
      if (challenge.category) {
        // For category-specific challenges
        const startDate = new Date(challenge.startDate);
        const endDate = new Date(challenge.endDate);
        
        // Filter expenses in the date range and of the specific category
        const relevantExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startDate && 
                 expenseDate <= endDate && 
                 expense.category === challenge.category;
        });
        
        // Calculate total spent in this category
        const totalSpent = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Update progress based on challenge type
        if (challenge.target === 0) {
          // For challenges like "No Takeout Week"
          challenge.progress = relevantExpenses.length > 0 ? 1 : 0;
          challenge.completed = relevantExpenses.length === 0;
        } else {
          // For challenges like "Keep under £X"
          challenge.progress = totalSpent;
          challenge.completed = totalSpent <= challenge.target;
        }
      } else if (challenge.id === "c4") {
        // Special handling for the "Daily Logging" challenge
        const startDate = new Date(challenge.startDate);
        const endDate = new Date(challenge.endDate);
        
        // Get unique dates with expenses in the range
        const uniqueDates = new Set(
          expenses
            .filter(expense => {
              const expenseDate = new Date(expense.date);
              return expenseDate >= startDate && expenseDate <= endDate;
            })
            .map(expense => expense.date.split('T')[0])
        );
        
        challenge.progress = uniqueDates.size;
        challenge.completed = uniqueDates.size >= challenge.target;
      }
    });
    
    setChallenges(updatedChallenges);
    
    // Update user progress based on completed challenges
    const newlyCompletedChallenges = updatedChallenges
      .filter(c => c.completed && !currentUserProgress.completedChallenges.includes(c.id))
      .map(c => c.id);
    
    if (newlyCompletedChallenges.length > 0) {
      // Add points and mark challenges as completed
      const pointsToAdd = newlyCompletedChallenges
        .map(id => updatedChallenges.find(c => c.id === id)?.points || 0)
        .reduce((sum, points) => sum + points, 0);
      
      const updatedUserProgress = userProgress.map(user => {
        if (user.name === currentUser) {
          const newPoints = user.points + pointsToAdd;
          return {
            ...user,
            points: newPoints,
            completedChallenges: [...user.completedChallenges, ...newlyCompletedChallenges],
            level: calculateLevel(newPoints)
          };
        }
        return user;
      });
      
      setUserProgress(updatedUserProgress);
    }
    
    // Check for new badges
    const updatedBadges = [...badges];
    let badgesChanged = false;
    
    // Check for Budget Beginner badge
    if (expenses.length > 0 && !currentUserProgress.unlockedBadges.includes("b1")) {
      updatedBadges.find(b => b.id === "b1")!.unlocked = true;
      badgesChanged = true;
    }
    
    // Check for Savings Star badge
    if (currentUserProgress.completedChallenges.length >= 3 && !currentUserProgress.unlockedBadges.includes("b2")) {
      updatedBadges.find(b => b.id === "b2")!.unlocked = true;
      badgesChanged = true;
    }
    
    // Check for Bill Splitter badge
    const hasSplitExpense = expenses.some(expense => 
      expense.isShared && expense.paidBy === currentUser);
    if (hasSplitExpense && !currentUserProgress.unlockedBadges.includes("b3")) {
      updatedBadges.find(b => b.id === "b3")!.unlocked = true;
      badgesChanged = true;
    }
    
    // Check for Money Master badge
    if (currentUserProgress.points >= 500 && !currentUserProgress.unlockedBadges.includes("b4")) {
      updatedBadges.find(b => b.id === "b4")!.unlocked = true;
      badgesChanged = true;
    }
    
    if (badgesChanged) {
      setBadges(updatedBadges);
      
      // Update unlocked badges in user progress
      const newlyUnlockedBadges = updatedBadges
        .filter(b => b.unlocked && !currentUserProgress.unlockedBadges.includes(b.id))
        .map(b => b.id);
      
      if (newlyUnlockedBadges.length > 0) {
        const updatedUserProgress = userProgress.map(user => {
          if (user.name === currentUser) {
            return {
              ...user,
              unlockedBadges: [...user.unlockedBadges, ...newlyUnlockedBadges]
            };
          }
          return user;
        });
        
        setUserProgress(updatedUserProgress);
      }
    }
  }, [expenses, challenges, currentUser, userProgress, badges, currentUserProgress]);

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
    
    // Return to dashboard after adding expense
    setActiveWidget(null);
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

  // Get recent expenses (limited to 5)
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Header showDashboardButton={true} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Household Budget Dashboard</h1>
          {activeWidget && (
            <button 
              onClick={() => setActiveWidget(null)} 
              className="flex items-center text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
          )}
        </div>
        
        {/* Dashboard View */}
        {!activeWidget ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Progress Widget */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Your Budget Journey</h2>
                <button 
                  onClick={() => setActiveWidget('challenges')}
                  className="text-xs text-white/70 hover:text-white underline"
                >
                  View Challenges
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold text-lg">
                      {currentUserProgress.level}
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">{currentUser}</p>
                      <p className="text-white/70 text-sm">Level {currentUserProgress.level}</p>
                    </div>
                  </div>
                  <p className="text-white font-bold">{currentUserProgress.points} pts</p>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(currentUserProgress.points % 100) / 100 * 100}%` }}
                  ></div>
                </div>
                <p className="text-white/70 text-xs text-right">
                  {100 - (currentUserProgress.points % 100)} points to level {currentUserProgress.level + 1}
                </p>
              </div>
              
              <h3 className="text-white font-medium mb-2">Recent Badges</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {currentUserProgress.unlockedBadges.length > 0 ? (
                  badges
                    .filter(badge => currentUserProgress.unlockedBadges.includes(badge.id))
                    .slice(0, 3)
                    .map(badge => (
                      <div key={badge.id} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group relative">
                        <span className="text-2xl">{badge.icon}</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white/80 text-purple-900 text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {badge.name}
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-white/70 italic text-sm">Complete challenges to earn badges</p>
                )}
              </div>
              
              <h3 className="text-white font-medium mb-2">Active Challenges</h3>
              {challenges
                .filter(challenge => !challenge.completed)
                .slice(0, 2)
                .map(challenge => (
                  <div key={challenge.id} className="bg-white/5 p-3 rounded-lg mb-2 last:mb-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-white font-medium">{challenge.title}</p>
                      <span className="bg-purple-700/60 text-white text-xs font-bold">+{challenge.points} pts</span>
                    </div>
                    <p className="text-white/70 text-xs mb-2">{challenge.description}</p>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className="bg-purple-600 h-1.5 rounded-full" 
                        style={{ width: challenge.target === 0 
                          ? (challenge.progress === 0 ? '100%' : '0%') 
                          : `${Math.min(100, (challenge.progress / challenge.target) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              <button
                onClick={() => setActiveWidget('challenges')}
                className="w-full bg-white/5 hover:bg-white/10 text-white mt-4 px-4 py-2 rounded-md transition text-sm"
              >
                View All Challenges & Achievements
              </button>
            </div>
            
            {/* Quick Actions Widget */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveWidget('add-expense')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Expense
                </button>
                <button 
                  onClick={() => setActiveWidget('view-expenses')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-md transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  View All Expenses
                </button>
                <button 
                  onClick={() => setActiveWidget('view-balances')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-md transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  View Balances
                </button>
                <button 
                  onClick={() => setActiveWidget('challenges')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-md transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Challenges & Achievements
                </button>
              </div>
            </div>
            
            {/* Balance Summary Widget */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Balance Summary</h2>
                <button 
                  onClick={() => setActiveWidget('view-balances')}
                  className="text-xs text-white/70 hover:text-white underline"
                >
                  View Details
                </button>
              </div>
              
              {expenses.length === 0 ? (
                <p className="text-white/70 italic">No expenses added yet</p>
              ) : (
                <div className="space-y-4">
                  {flatmates.map(person => {
                    const balance = balances.simplified[person] || 0;
                    return (
                      <div 
                        key={person} 
                        className={`p-3 rounded-lg ${
                          balance > 0 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : balance < 0 
                              ? 'bg-red-500/20 border border-red-500/30' 
                              : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-white">{person}</h3>
                          <p className={`font-bold ${
                            balance > 0 
                              ? 'text-green-400' 
                              : balance < 0 
                                ? 'text-red-400' 
                                : 'text-white'
                          }`}>
                            {balance > 0 ? `+£${Math.abs(balance).toFixed(2)}` : 
                             balance < 0 ? `-£${Math.abs(balance).toFixed(2)}` : 
                             `£0.00`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Expense Summary Widget */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Expense Summary</h2>
                <button 
                  onClick={() => setActiveWidget('view-expenses')}
                  className="text-xs text-white/70 hover:text-white underline"
                >
                  View All
                </button>
              </div>
              
              {expenses.length === 0 ? (
                <p className="text-white/70 italic">No expenses added yet</p>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-white mb-4">
                    Total: £{totalExpenses.toFixed(2)}
                  </p>
                  
                  <div className="space-y-3">
                    {Object.entries(expenseByCategory)
                      .filter(([_, amount]) => amount > 0)
                      .sort(([_, a], [__, b]) => b - a)
                      .slice(0, 3) // Show only top 3 categories
                      .map(([category, amount]) => {
                        const percentage = (amount / totalExpenses) * 100;
                        return (
                          <div key={category}>
                            <div className="flex justify-between text-white text-sm mb-1">
                              <span>{category}</span>
                              <span>£{amount.toFixed(2)} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
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
            
            {/* Recent Activity Widget */}
            <div className="md:col-span-2 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                <button 
                  onClick={() => setActiveWidget('view-expenses')}
                  className="text-xs text-white/70 hover:text-white underline"
                >
                  View All
                </button>
              </div>
              
              {recentExpenses.length === 0 ? (
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
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map(expense => (
                        <tr key={expense.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="px-4 py-2 text-white">{expense.category}</td>
                          <td className="px-4 py-2 text-white">£{expense.amount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-white">{new Date(expense.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-white">{expense.paidBy}</td>
                          <td className="px-4 py-2 text-white">
                            {expense.isShared ? (
                              expense.sharedWith.length > 0 
                                ? `Shared` 
                                : "All"
                            ) : (
                              "Individual"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Spending Breakdown Widget */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Spending Breakdown</h2>
              
              {expenses.length === 0 ? (
                <p className="text-white/70 italic">No expenses added yet</p>
              ) : (
                <div className="h-48 flex items-end justify-around space-x-1">
                  {Object.entries(expenseByCategory)
                    .filter(([_, amount]) => amount > 0)
                    .sort(([_, a], [__, b]) => b - a)
                    .slice(0, 5) // Show top 5 categories
                    .map(([category, amount]) => {
                      const percentage = (amount / totalExpenses) * 100;
                      const height = `${Math.max(5, percentage)}%`;
                      
                      return (
                        <div key={category} className="flex flex-col items-center">
                          <div 
                            className="w-8 md:w-12 bg-purple-600 rounded-t-md relative group"
                            style={{ height }}
                          >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white/80 text-purple-900 text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              £{amount.toFixed(2)} ({percentage.toFixed(1)}%)
                            </div>
                          </div>
                          <span className="text-white text-xs mt-2 truncate w-12 md:w-16 text-center">{category}</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        ) : activeWidget === 'challenges' ? (
          // Challenges and Achievements View
          <div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Challenges & Achievements</h2>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold mr-2">
                    {currentUserProgress.level}
                  </div>
                  <div>
                    <p className="text-white font-medium">{currentUserProgress.points} points</p>
                    <div className="w-24 bg-white/10 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-purple-600 h-1.5 rounded-full" 
                        style={{ width: `${(currentUserProgress.points % 100) / 100 * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Active Challenges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges
                    .filter(challenge => !challenge.completed)
                    .map(challenge => (
                      <div key={challenge.id} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-medium">{challenge.title}</h4>
                          <span className="bg-purple-700/60 text-white text-xs px-2 py-1 rounded">+{challenge.points} pts</span>
                        </div>
                        <p className="text-white/70 text-sm mb-3">{challenge.description}</p>
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>Progress:</span>
                          <span>
                            {challenge.target === 0 
                              ? (challenge.progress === 0 ? 'On track!' : 'Failed') 
                              : `${challenge.progress.toFixed(2)} / £${challenge.target}`}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: challenge.target === 0 
                              ? (challenge.progress === 0 ? '100%' : '0%') 
                              : `${Math.min(100, (challenge.progress / challenge.target) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <p className="mt-2 text-xs text-white/60">
                          Ends: {new Date(challenge.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                </div>
                
                {challenges.filter(challenge => !challenge.completed).length === 0 && (
                  <p className="text-white/70 italic text-center py-4">No active challenges</p>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Completed Challenges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges
                    .filter(challenge => challenge.completed && currentUserProgress.completedChallenges.includes(challenge.id))
                    .map(challenge => (
                      <div key={challenge.id} className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-medium">{challenge.title}</h4>
                          <span className="bg-green-700/60 text-white text-xs px-2 py-1 rounded">+{challenge.points} pts</span>
                        </div>
                        <p className="text-white/70 text-sm mb-1">{challenge.description}</p>
                        <div className="flex items-center text-green-400 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Completed
                        </div>
                      </div>
                    ))}
                </div>
                
                {challenges.filter(challenge => challenge.completed && currentUserProgress.completedChallenges.includes(challenge.id)).length === 0 && (
                  <p className="text-white/70 italic text-center py-4">No completed challenges yet</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Your Badges</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {badges.map(badge => {
                    const isUnlocked = currentUserProgress.unlockedBadges.includes(badge.id);
                    return (
                      <div key={badge.id} className={`p-4 rounded-lg flex flex-col items-center ${
                        isUnlocked 
                          ? 'bg-white/10' 
                          : 'bg-white/5 opacity-60'
                      }`}>
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl mb-2">
                          {isUnlocked ? badge.icon : '🔒'}
                        </div>
                        <h4 className="text-white font-medium text-center text-sm">{badge.name}</h4>
                        <p className="text-white/70 text-xs text-center mt-1">{badge.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Flatmate Leaderboard</h2>
              <div className="overflow-hidden rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="px-4 py-3 text-left text-white">Rank</th>
                      <th className="px-4 py-3 text-left text-white">Flatmate</th>
                      <th className="px-4 py-3 text-left text-white">Level</th>
                      <th className="px-4 py-3 text-right text-white">Points</th>
                      <th className="px-4 py-3 text-right text-white">Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...userProgress]
                      .sort((a, b) => b.points - a.points)
                      .map((user, index) => (
                        <tr key={user.userId} className={`border-t border-white/10 ${user.name === currentUser ? 'bg-purple-500/20' : ''}`}>
                          <td className="px-4 py-3 text-white">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold mr-2">
                                {user.level}
                              </div>
                              <span className="text-white">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white">Level {user.level}</td>
                          <td className="px-4 py-3 text-right text-white font-bold">{user.points}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end">
                              {user.unlockedBadges.length > 0 ? (
                                <div className="flex -space-x-2">
                                  {user.unlockedBadges.slice(0, 3).map(badgeId => {
                                    const badge = badges.find(b => b.id === badgeId);
                                    return (
                                      <div key={badgeId} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">
                                        {badge?.icon}
                                      </div>
                                    );
                                  })}
                                  {user.unlockedBadges.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">
                                      +{user.unlockedBadges.length - 3}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-white/50 text-sm">None yet</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeWidget === 'add-expense' ? (
          // Add Expense View
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
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
            
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition"
                onClick={() => setActiveWidget(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition"
                onClick={handleAddExpense}
              >
                Add Expense
              </button>
            </div>
          </div>
        ) : activeWidget === 'view-expenses' ? (
          // View All Expenses
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">All Expenses</h2>
              <button 
                onClick={() => setActiveWidget('add-expense')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New
              </button>
            </div>
            
            {expenses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-white/70 italic mb-4">No expenses added yet</p>
                <button 
                  onClick={() => setActiveWidget('add-expense')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition"
                >
                  Add Your First Expense
                </button>
              </div>
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
        ) : activeWidget === 'view-balances' ? (
          // View Balances
          <div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Balance Summary</h2>
              
              {expenses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-white/70 italic mb-4">No expenses added yet</p>
                  <button 
                    onClick={() => setActiveWidget('add-expense')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition"
                  >
                    Add Your First Expense
                  </button>
                </div>
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
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Budget; 