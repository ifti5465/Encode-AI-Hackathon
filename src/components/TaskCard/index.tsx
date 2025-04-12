import React from 'react';
import { Edit, Trash2, User, Calendar, RotateCcw, Check } from 'lucide-react';

/**
 * Represents the priority level of a task
 * @readonly
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Represents the current status of a task
 * @readonly
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

/**
 * Represents the frequency of a recurring chore
 * @readonly
 */
export type ChoreFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

/**
 * Configuration options for the TaskCard component
 * @interface
 */
export interface TaskCardProps {
  /**
   * The unique identifier for the task
   */
  id: string;
  
  /**
   * The main title/description of the task
   */
  title: string;
  
  /**
   * The category of the chore
   */
  category: string;
  
  /**
   * The priority level of the task
   * @default 'medium'
   */
  priority?: TaskPriority;
  
  /**
   * The current status of the task
   * @default 'pending'
   */
  status: TaskStatus;
  
  /**
   * Optional due date for the task
   */
  dueDate?: Date;

  /**
   * Optional completion date for the task
   */
  completedAt?: Date;

  /**
   * Optional ID of the assigned user
   */
  assignedTo?: string;

  /**
   * Optional name of the assigned user (for display)
   */
  assignedToName?: string;
  
  /**
   * Frequency of the recurring chore
   * @default 'once'
   */
  frequency?: ChoreFrequency;
  
  /**
   * Points awarded for completing the chore
   * @default 0
   */
  points?: number;

  /**
   * Callback function triggered when task is completed
   */
  onComplete?: () => void;

  /**
   * Callback function triggered when task is edited
   */
  onEdit?: () => void;

  /**
   * Callback function triggered when task is deleted
   */
  onDelete?: () => void;
}

/**
 * A chore card component that displays chore information in a clean, modern design
 */
const TaskCard: React.FC<TaskCardProps> = ({
  id: _id,
  title,
  category,
  status = 'pending',
  dueDate,
  assignedTo,
  assignedToName,
  frequency = 'once',
  points = 0,
  onComplete,
  onEdit,
  onDelete
}) => {
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  };

  const isCompleted = status === 'completed';

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 flex flex-col h-full justify-between">
        {/* Top content section */}
        <div className="overflow-auto">
          {/* Header with title and action buttons */}
          <div className="flex justify-between items-start mb-3">
            <h3 className={`text-lg font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'} break-words pr-2`}>
              {title}
            </h3>
            <div className="flex gap-2 shrink-0">
              {onEdit && (
                <button 
                  onClick={onEdit}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Edit chore"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={onDelete}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Delete chore"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Category */}
          <div className="mb-4">
            <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full">
              {category}
            </span>
          </div>
          
          {/* Details section */}
          <div className="space-y-2">
            {/* Assignment */}
            {assignedTo && (
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{assignedToName || 'Assigned'}</span>
              </div>
            )}
            
            {/* Due date */}
            {dueDate && (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{formatDate(dueDate)}</span>
              </div>
            )}
            
            {/* Frequency */}
            {frequency !== 'once' && (
              <div className="flex items-center gap-2 text-gray-700">
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span className="capitalize">{frequency}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with points and complete button - always at bottom */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div className="text-purple-600 font-medium">
            {points} point{points !== 1 ? 's' : ''}
          </div>
          
          {!isCompleted && onComplete && (
            <button
              onClick={onComplete}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Check className="w-4 h-4 mr-1" />
              Complete
            </button>
          )}
          
          {isCompleted && (
            <span className="text-green-500 font-medium flex items-center">
              <Check className="w-4 h-4 mr-1" />
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 