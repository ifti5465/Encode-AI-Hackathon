import React, { useState, useEffect } from 'react';
import { X, User, FileText, Tag, Calendar, Hash, Repeat, Trophy } from 'lucide-react';
import type { TaskPriority, ChoreFrequency } from '../TaskCard';
import { useUserStore } from '../../stores/userStore';
import { useChoreOptionsStore } from '../../stores/choreOptionsStore';

interface AddChoreFormProps {
  onSubmit: (chore: {
    title: string;
    category: string;
    priority: TaskPriority;
    dueDate?: Date;
    points: number;
    frequency: ChoreFrequency;
    assignedTo?: string;
  }) => void;
  onClose: () => void;
}

const AddChoreForm: React.FC<AddChoreFormProps> = ({ onSubmit, onClose }) => {
  const { users } = useUserStore();
  const { categories, choreNames, addCategory, addChoreName } = useChoreOptionsStore();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
    points: 5,
    frequency: 'weekly' as ChoreFrequency,
    assignedTo: ''
  });

  // State for custom inputs
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Effect to update custom states when selecting existing options
  useEffect(() => {
    // If the form title is set and not from a dropdown selection, set isCustomTitle to true
    if (formData.title && !choreNames.includes(formData.title)) {
      setIsCustomTitle(true);
    }
    
    // If the form category is set and not from a dropdown selection, set isCustomCategory to true
    if (formData.category && !categories.includes(formData.category)) {
      setIsCustomCategory(true);
    }
  }, [formData.title, formData.category, categories, choreNames]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add the chore name and category to the options store
    if (formData.title.trim()) {
      addChoreName(formData.title);
    }
    
    if (formData.category.trim()) {
      addCategory(formData.category);
    }
    
    // Create a proper Date object from the date string
    const dueDate = formData.dueDate ? new Date(formData.dueDate + 'T00:00:00') : undefined;
    
    onSubmit({
      ...formData,
      dueDate,
      assignedTo: formData.assignedTo || undefined
    });
    
    setFormData({
      title: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      points: 5,
      frequency: 'weekly',
      assignedTo: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add New Chore</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Chore Name *
            </label>
            {!isCustomTitle && choreNames.length > 0 ? (
              <div className="flex mb-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={formData.title}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "custom") {
                        setIsCustomTitle(true);
                        setFormData({ ...formData, title: '' });
                      } else {
                        setFormData({ ...formData, title: value });
                      }
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pl-10 appearance-none"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    <option value="">Select a chore name</option>
                    {choreNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    <option value="custom">+ Add custom name</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomTitle(true)}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  aria-label="Create custom chore name"
                >
                  Custom
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pl-10"
                  placeholder="Enter chore name"
                />
                {isCustomTitle && choreNames.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCustomTitle(false)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-purple-600 hover:text-purple-800"
                  >
                    Show list
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            {!isCustomCategory && categories.length > 0 ? (
              <div className="flex mb-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "custom") {
                        setIsCustomCategory(true);
                        setFormData({ ...formData, category: '' });
                      } else {
                        setFormData({ ...formData, category: value });
                      }
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pl-10 appearance-none"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="custom">+ Add custom category</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(true)}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  aria-label="Create custom category"
                >
                  Custom
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pl-10"
                  placeholder="e.g., Kitchen, Bathroom, Garden"
                />
                {isCustomCategory && categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(false)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-purple-600 hover:text-purple-800"
                  >
                    Show list
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pl-10 appearance-none"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pl-10 appearance-none"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <Repeat className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ChoreFrequency })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pl-10 appearance-none"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pl-10 appearance-none"
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  style={{ webkitAppearance: 'none', mozAppearance: 'none' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                Points
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <Trophy className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="points"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Math.max(1, parseInt(e.target.value)) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pl-10"
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Add Chore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChoreForm; 