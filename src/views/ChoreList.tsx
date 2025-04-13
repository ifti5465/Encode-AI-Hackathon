import React, { useState } from 'react';
import { Plus, Trophy, X, Camera, FileText, Check, History, Eye, User as UserIcon, Users } from 'lucide-react';
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

const ChoreList: React.FC = () => {
  const { chores, addChore, updateChore, completeChore, deleteChore, assignChore } = useChoreStore();
  const { addProof, getProofById } = useProofStore();
  const { users, getUserById, updateUserPoints } = useUserStore();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  
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
    if (!confirmationChore) return;
    
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
      // Award the points from the chore to the assigned user
      updateUserPoints(chore.assignedTo, chore.points || 5);
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

  // Get user name from ID
  const getUserName = (userId?: string) => {
    if (!userId) return undefined;
    const user = getUserById(userId);
    return user ? user.name : undefined;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a 
            href="/signed_in"  
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity flex items-center"
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              className="mr-3 fill-current"
              style={{ color: "#9333ea" }}
            >
              <path d="M3,12.5L12,4L21,12.5V20H15V13H9V20H3V12.5Z M10,20H14V15H10V20Z" />
            </svg>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-900">FlatMade</h1>
          </a>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8">
        {/* Leaderboard section - moved above the chore list */}
        <section className="bg-purple-600 rounded-lg shadow-lg mb-8 mx-8 sm:mx-12 lg:mx-16 overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="flex items-center text-xl font-bold text-white mb-6">
              <Trophy className="w-6 h-6 text-yellow-300 mr-2" />
              Leaderboard
            </h2>
            
            <div className="space-y-3">
              {users.length === 0 ? (
                <div className="text-center py-4 text-white/80">
                  No users yet. Start completing chores to earn points!
                </div>
              ) : (
                // Sort users by points in descending order
                [...users]
                  .sort((a, b) => b.points - a.points)
                  .map((user, index) => (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-purple-700 hover:bg-purple-800 transition-colors rounded-lg border border-purple-500"
                    >
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-300 text-purple-900 font-bold mr-4">
                          {index + 1}
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                      <div className="font-semibold text-yellow-300 flex items-center">
                        <Trophy className="w-4 h-4 mr-1" />
                        {user.points} pts
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>
        
        {/* Chore List section - now below the leaderboard */}
        <section className="bg-white rounded-lg shadow-sm mb-8 mx-8 sm:mx-12 lg:mx-16">
          <div className="border-b flex justify-between items-center">
            <div className="flex">
              <button 
                className={`px-6 py-4 font-medium text-sm focus:outline-none ${
                  selectedTab === 'active' 
                    ? 'text-purple-600 border-b-2 border-purple-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('active')}
              >
                Active Chores
              </button>
              <button 
                className={`px-6 py-4 font-medium text-sm flex items-center focus:outline-none ${
                  selectedTab === 'completed' 
                    ? 'text-purple-600 border-b-2 border-purple-600' 
                    : 'text-gray-500 hover:text-gray-700'
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
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Chore
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Fixed-width grid container with consistent spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedChores.map(chore => (
                <div 
                  key={chore.id} 
                  className="flex justify-center"
                >
                  <div style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}>
                    <div className="relative h-full">
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
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-purple-600 rounded-md hover:bg-purple-700 shadow-sm"
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
              <div className="text-center py-8 text-gray-500">
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
      
      {/* Confirmation dialog */}
      {confirmationChore && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                But have you really completed "{confirmationChore.title}" though...? 🤨
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setConfirmationChore(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add proof (text and/or photo required)
                </label>
                <textarea
                  className={`w-full px-3 py-2 border ${proofError && !proofText.trim() && !previewUrl ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'} rounded-md shadow-sm focus:outline-none`}
                  rows={3}
                  placeholder="Describe how you completed this chore..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Camera className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Upload photo proof</span>
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
                  className={`block w-full p-2 border ${proofError && !proofText.trim() && !previewUrl ? 'border-red-300 border-dashed bg-red-50' : 'border-gray-300 border-dashed'} rounded-md text-center cursor-pointer hover:bg-gray-50`}
                >
                  <span className="text-sm text-gray-500">Click to upload an image</span>
                </label>
                
                {previewUrl && (
                  <div className="mt-2 relative">
                    <img 
                      src={previewUrl} 
                      alt="Proof" 
                      className="h-32 rounded-md object-cover"
                    />
                    <button
                      className="absolute top-1 right-1 p-1 bg-red-100 rounded-full"
                      onClick={() => {
                        setProofImage(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
              
              {proofError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {proofError}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                onClick={() => setConfirmationChore(null)}
              >
                No.. not really 😔
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Assign Chore
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => {
                  setIsAssignmentOpen(false);
                  setChoreToAssign(undefined);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Select a person
              </h4>
              
              <div className="space-y-2">
                {users.map(user => (
                  <button 
                    key={user.id}
                    className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-purple-50 rounded-lg"
                    onClick={() => completeAssignment(user.id)}
                  >
                    <span className="font-medium">{user.name}</span>
                    <UserIcon className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
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

export default ChoreList; 