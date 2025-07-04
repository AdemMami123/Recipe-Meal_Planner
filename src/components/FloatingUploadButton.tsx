'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import UploadRecipeModal from './UploadRecipeModal';

interface FloatingUploadButtonProps {
  onUploadSuccess?: () => void;
}

export default function FloatingUploadButton({ onUploadSuccess }: FloatingUploadButtonProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadSuccess = () => {
    if (onUploadSuccess) {
      onUploadSuccess();
    }
    setShowUploadModal(false);
  };

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        onClick={() => setShowUploadModal(true)}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Upload Recipe</span>
      </Button>

      <UploadRecipeModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
}
