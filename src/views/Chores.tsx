import React, { useState, useEffect } from 'react';
import { Plus, Trophy, X, Camera, FileText, Check, History, Eye, User as UserIcon, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import AddChoreForm from '../components/AddChoreForm';
import EditChoreForm from '../components/EditChoreForm';
import ProofViewer from '../components/ProofViewer';
import { useChoreStore } from '../stores/choreStore';
import { useProofStore } from '../stores/proofStore';
import { useUserStore } from '../stores/userStore';
import type { ChoreFrequency } from '../components/TaskCard';
import type { Chore } from '../stores/choreStore';
import type { User } from '../stores/userStore';

// Card dimensions and spacing
const CARD_WIDTH = 270;
const CARD_HEIGHT = 300;

const Chores: React.FC = () => {
  const navigate = useNavigate();
  const { chores, addChore, updateChore, completeChore, deleteChore, assignChore } = useChoreStore();
  const { addProof, getProofById } = useProofStore();
  const { users, getUserById, updateUserPoints, currentUser } = useUserStore();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  
  // Redirect to login if no user
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  // Get current user details
  const currentUserInfo = currentUser ? getUserById(currentUser) : null;
  
  // State for edit mode
  const [editChore, setEditChore] = useState<Chore | null>(null);

  // State for proof viewer
  const [viewProof, setViewProof] = useState<{
    id: string;
    title: string;
    proof?: {
      text?: string;
      imageUrl?: string;
      createdAt?: Date;
    };
  } | null>(null);
  
  // State for confirmation dialog
  const [confirmationChore, setConfirmationChore] = useState<{
    id: string;
    title: string;
  } | null>(null);
  
  // State for user assignment
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [choreToAssign, setChoreToAssign] = useState<string | undefined>(undefined);
  
  // State for proof submission
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  
  // State for success notification
  const [completionNotification, setCompletionNotification] = useState<{
    visible: boolean;
    title: string;
    animationState: 'entering' | 'visible' | 'exiting' | 'hidden';
  }>({ visible: false, title: '', animationState: 'hidden' });

  const handleAddChore = (choreData: {
    title: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    points: number;
    frequency: ChoreFrequency;
    assignedTo?: string;
  }) => {
    // Ensure we have a valid date object or undefined
    const dueDate = choreData.dueDate instanceof Date ? choreData.dueDate : undefined;

    addChore({
      title: choreData.title,
      priority: choreData.priority,
      status: 'pending',
      dueDate,
      category: choreData.category || 'Uncategorized', // Provide default category
      points: choreData.points || Math.floor(Math.random() * 10) + 1, // Random points 1-10 for demo
      frequency: choreData.frequency || 'weekly', // Default frequency for demo
      assignedTo: choreData.assignedTo
    });
    setIsAddFormOpen(false);
  };

  // Handle editing an existing chore
  const handleEditChore = (choreId: string) => {
    const chore = chores.find(c => c.id === choreId);
    if (chore && chore.status !== 'completed') {
      setEditChore(chore);
    }
  };
  
  // Handle submitting edits
  const handleEditSubmit = (id: string, updates: {
    title: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    points: number;
    frequency: ChoreFrequency;
    assignedTo?: string;
  }) => {
    updateChore(id, updates);
    setEditChore(null);
  };

  // Handle viewing proof for a completed chore
  const handleViewProof = (choreId: string, choreTitle: string) => {
    const chore = chores.find(c => c.id === choreId);
    if (chore && chore.status === 'completed' && chore.proof) {
      setViewProof({
        id: choreId,
        title: choreTitle,
        proof: {
          text: chore.proof.text || '',
          imageUrl: chore.proof.imageUrl,
          createdAt: chore.completedAt
        }
      });
    }
  };
  
  // Handle opening confirmation dialog
  const handleCompleteRequest = (choreId: string, choreTitle: string) => {
    setConfirmationChore({ id: choreId, title: choreTitle });
    setProofError(null);
  };
  
  // Handle user assignment
  const handleAssignChore = (choreId: string) => {
    setChoreToAssign(choreId);
    setIsAssignmentOpen(true);
  };

  // Complete assignment
  const completeAssignment = (userId: string) => {
    if (choreToAssign) {
      assignChore(choreToAssign, userId);
      setChoreToAssign(undefined);
      setIsAssignmentOpen(false);
    }
  };
  
  // Handle actual completion
  const handleConfirmCompletion = () => {
    if (!confirmationChore || !currentUser) return;
    
    // Get the chore details to check assignment and points
    const chore = chores.find(c => c.id === confirmationChore.id);
    if (!chore) return;
    
    // Validate proof (require at least text OR image)
    if (!proofText.trim() && !previewUrl) {
      setProofError("Please provide either text description or photo evidence (or both)");
      return;
    }
    
    // Process proof
    const proof = {
      text: proofText,
      imageUrl: previewUrl || undefined
    };
    
    // Call store's completeChore with proof
    completeChore(confirmationChore.id, proof);
    
    // Add proof to proof store for synchronization
    addProof({
      id: confirmationChore.id,
      text: proofText,
      imageUrl: previewUrl || undefined
    });
    
    // If chore is assigned to a user, update their points
    if (chore.assignedTo) {
      const pointsToAward = chore.points || 5; // Default to 5 points if not specified
      // Award the points from the chore to the assigned user
      updateUserPoints(chore.assignedTo, pointsToAward);
    } else {
      // If not assigned, award points to the current user
      const pointsToAward = chore.points || 5;
      updateUserPoints(currentUser, pointsToAward);
    }
    
    // Show success notification with animation
    setCompletionNotification({ 
      visible: true, 
      title: confirmationChore.title,
      animationState: 'entering'
    });

    // After entering animation completes, set to visible state
    setTimeout(() => {
      setCompletionNotification(prev => ({
        ...prev, 
        animationState: 'visible'
      }));
    }, 100);
    
    // Start exit animation after 3 seconds
    setTimeout(() => {
      setCompletionNotification(prev => ({
        ...prev,
        animationState: 'exiting'
      }));
    }, 3000);

    // Finally hide after exit animation completes
    setTimeout(() => {
      setCompletionNotification({
        visible: false,
        title: '',
        animationState: 'hidden'
      });
    }, 3300);
    
    // Clear confirmation dialog
    setConfirmationChore(null);
    setProofText('');
    setProofImage(null);
    setPreviewUrl(null);
    setProofError(null);
  };
  
  // Handle image upload for proof
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Filter chores based on active tab
  const activeChores = chores.filter(chore => chore.status !== 'completed');
  const completedChores = chores.filter(chore => chore.status === 'completed');
  const displayedChores = selectedTab === 'active' ? activeChores : completedChores;

  // Get user name for display
  const getUserName = (userId?: string) => {
    if (!userId) return 'Unassigned';
    const user = getUserById(userId);
    return user ? user.name : 'Unknown User';
  };

  // User avatar component
  const UserAvatar = ({ userId, size = 'md' }: { userId: string, size?: 'sm' | 'md' | 'lg' }) => {
    const user = getUserById(userId);
    
    const sizeClasses = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base'
    };
    
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-purple-500 text-white font-medium`}>
        {user ? user.name.charAt(0).toUpperCase() : '?'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Header showDashboardButton={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Leaderboard section */}
        <section className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 mb-8">
          <div className="p-6 pb-4">
            <h2 className="flex items-center text-xl font-bold text-white mb-6">
              <Trophy className="w-6 h-6 text-white/80 mr-2" />
              Leaderboard
            </h2>
            
            <div className="space-y-3">
              {users.length === 0 ? (
                <div className="text-center py-4 text-white/80">
                  No users yet. Start completing chores to earn points!
                </div>
              ) : (
                [...users]
                  .sort((a, b) => b.points - a.points)
                  .map((user, index) => (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition rounded-lg border border-white/10"
                    >
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-400/20 text-white font-bold mr-4">
                          {index + 1}
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                      <div className="font-semibold text-white/90 flex items-center">
                        <Trophy className="w-4 h-4 mr-1" />
                        {user.points} pts
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>
        
        {/* Chore List section */}
        <section className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="border-b border-white/10 flex justify-between items-center">
            <div className="flex">
              <button 
                className={`px-6 py-4 font-medium text-sm focus:outline-none transition ${
                  selectedTab === 'active' 
                    ? 'text-white border-b-2 border-white' 
                    : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setSelectedTab('active')}
              >
                Active Chores
              </button>
              <button 
                className={`px-6 py-4 font-medium text-sm flex items-center focus:outline-none transition ${
                  selectedTab === 'completed' 
                    ? 'text-white border-b-2 border-white' 
                    : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setSelectedTab('completed')}
              >
                <History className="w-4 h-4 mr-1" />
                Past Chores
              </button>
            </div>
            
            <div className="pr-4">
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-white rounded-md hover:bg-white/90 transition"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Chore
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedChores.map(chore => (
                <div 
                  key={chore.id} 
                  className="flex justify-center"
                >
                  <div style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}>
                    <div className="relative h-full bg-white/5 hover:bg-white/10 transition rounded-xl border border-white/10 p-4">
                      <TaskCard
                        id={chore.id}
                        title={chore.title}
                        category={chore.category}
                        status={chore.status}
                        dueDate={chore.dueDate ? new Date(chore.dueDate) : undefined}
                        assignedTo={chore.assignedTo}
                        assignedToName={getUserName(chore.assignedTo)}
                        frequency={chore.frequency}
                        points={chore.points || 5}
                        onComplete={() => handleCompleteRequest(chore.id, chore.title)}
                        onDelete={() => deleteChore(chore.id)}
                        onEdit={chore.status !== 'completed' ? () => handleEditChore(chore.id) : undefined}
                      />
                      
                      {chore.status === 'completed' && chore.proof && (
                        <div className="absolute bottom-14 left-0 right-0 flex justify-center pb-4">
                          <button
                            onClick={() => handleViewProof(chore.id, chore.title)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-white rounded-md hover:bg-white/90 transition"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Proof
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {displayedChores.length === 0 && (
              <div className="text-center py-8 text-white/80">
                <p>
                  {selectedTab === 'active' 
                    ? 'No active chores. Add one to get started!' 
                    : 'No completed chores yet.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      {/* Modals */}
      {confirmationChore && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-white">
                But have you really completed "{confirmationChore.title}" though...? 🤨
              </h3>
              <button
                className="text-white/70 hover:text-white"
                onClick={() => setConfirmationChore(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Add proof (text and/or photo required)
                </label>
                <textarea
                  className={`w-full px-3 py-2 bg-white/5 border ${
                    proofError && !proofText.trim() && !previewUrl 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-white/20 focus:ring-white/30 focus:border-white/30'
                  } rounded-md shadow-sm focus:outline-none text-white`}
                  rows={3}
                  placeholder="Describe how you completed this chore..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Camera className="w-5 h-5 text-white/80" />
                  <span className="text-sm font-medium text-white">Upload photo proof</span>
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="proof-image"
                  onChange={handleImageChange}
                />
                
                <label
                  htmlFor="proof-image"
                  className={`block w-full p-2 border ${
                    proofError && !proofText.trim() && !previewUrl 
                      ? 'border-red-300 border-dashed bg-red-400/10' 
                      : 'border-white/20 border-dashed'
                  } rounded-md text-center cursor-pointer hover:bg-white/5`}
                >
                  <span className="text-sm text-white/80">Click to upload an image</span>
                </label>
                
                {previewUrl && (
                  <div className="mt-2 relative">
                    <img 
                      src={previewUrl} 
                      alt="Proof" 
                      className="h-32 rounded-md object-cover"
                    />
                    <button
                      className="absolute top-1 right-1 p-1 bg-red-400/20 rounded-full hover:bg-red-400/30 transition"
                      onClick={() => {
                        setProofImage(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
              
              {proofError && (
                <div className="text-sm text-red-300 bg-red-400/10 p-2 rounded">
                  {proofError}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition"
                onClick={() => setConfirmationChore(null)}
              >
                No.. not really 😔
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-purple-600 bg-white border border-transparent rounded-md hover:bg-white/90 transition"
                onClick={handleConfirmCompletion}
              >
                Yes, I did it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User assignment dialog */}
      {isAssignmentOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Assign Chore</h3>
              <button 
                onClick={() => setIsAssignmentOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">Select a flatmate to assign this chore to:</p>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pb-2">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => completeAssignment(user.id)}
                  className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <UserAvatar userId={user.id} />
                  <span className="ml-3 font-medium">{user.name}</span>
                  {user.id === currentUser && (
                    <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">You</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success notification */}
      {completionNotification.visible && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div 
            className={`
              bg-green-100 border border-green-400 text-green-700 px-8 py-6 rounded-lg shadow-xl 
              max-w-md text-center pointer-events-auto transition-all duration-300 transform ease-out
              ${completionNotification.animationState === 'entering' ? 'opacity-0 translate-y-8' : ''}
              ${completionNotification.animationState === 'visible' ? 'opacity-100 translate-y-0' : ''}
              ${completionNotification.animationState === 'exiting' ? 'opacity-0 -translate-y-8' : ''}
            `}
          >
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">Chore completed!</h3>
            <p>{completionNotification.title}</p>
          </div>
        </div>
      )}
      
      {isAddFormOpen && (
        <AddChoreForm
          onSubmit={handleAddChore}
          onClose={() => setIsAddFormOpen(false)}
        />
      )}
      
      {editChore && (
        <EditChoreForm
          chore={editChore}
          onSubmit={handleEditSubmit}
          onClose={() => setEditChore(null)}
        />
      )}
      
      {viewProof && viewProof.proof && (
        <ProofViewer
          proof={viewProof.proof}
          onClose={() => setViewProof(null)}
        />
      )}
    </div>
  );
};

export default Chores;