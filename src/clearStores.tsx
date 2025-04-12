import React, { useEffect } from 'react';
import { useChoreStore } from './stores/choreStore';
import { useProofStore } from './stores/proofStore';

const ClearStores: React.FC = () => {
  const { clearAllChores } = useChoreStore();
  const { clearAllProofs } = useProofStore();
  
  useEffect(() => {
    // Clear all stores
    clearAllChores();
    clearAllProofs();
    
    console.log('All stores cleared successfully!');
  }, [clearAllChores, clearAllProofs]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Stores Cleared Successfully</h1>
        <p className="text-gray-600">All chores and proofs have been removed from the keepsync stores.</p>
      </div>
    </div>
  );
};

export default ClearStores; 