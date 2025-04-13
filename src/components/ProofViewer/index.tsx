import React, { useEffect, useState } from 'react';
import { X, Camera, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { Proof } from '../../stores/proofStore';

interface ProofViewerProps {
  proof: {
    text?: string;
    imageUrl?: string;
    createdAt?: Date;
  };
  onClose: () => void;
}

const ProofViewer: React.FC<ProofViewerProps> = ({ proof, onClose }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'proof-viewer-portal';
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  if (!portalContainer) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Completion Proof</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close viewer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {proof.text && (
            <div className="space-y-2">
              <div className="flex items-center text-gray-700 mb-1">
                <FileText className="w-5 h-5 mr-2" />
                <h3 className="font-medium">Description</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap">{proof.text}</p>
              </div>
            </div>
          )}
          
          {proof.imageUrl && (
            <div className="space-y-2">
              <div className="flex items-center text-gray-700 mb-1">
                <Camera className="w-5 h-5 mr-2" />
                <h3 className="font-medium">Photo Evidence</h3>
              </div>
              <div className="bg-gray-50 p-2 rounded-md flex justify-center">
                <img 
                  src={proof.imageUrl} 
                  alt="Proof" 
                  className="max-h-96 rounded object-contain"
                />
              </div>
            </div>
          )}
          
          {proof.createdAt && (
            <div className="text-sm text-gray-500 text-right">
              Completed on {proof.createdAt.toLocaleString()}
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    portalContainer
  );
};

export default ProofViewer; 