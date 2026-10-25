import { useState, useCallback, useEffect } from 'react';
import { validateImageFile } from '../utils/validate';

export function useFileDrop(initialPreviewUrl = null) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Clean up object URL when replacing
  const cleanupUrl = useCallback((url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const handleFileSelect = useCallback((selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setPreviewUrl((prev) => {
      cleanupUrl(prev);
      return URL.createObjectURL(selectedFile);
    });
    setFile(selectedFile);
  }, [cleanupUrl]);

  const removeFile = useCallback(() => {
    setPreviewUrl((prev) => {
      cleanupUrl(prev);
      return null;
    });
    setFile(null);
    setError(null);
  }, [cleanupUrl]);

  const setExplicitUrl = useCallback((url) => {
    setPreviewUrl((prev) => {
      cleanupUrl(prev);
      return url;
    });
    setFile(null);
    setError(null);
  }, [cleanupUrl]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return {
    file,
    previewUrl,
    error,
    isDragging,
    handleFileSelect,
    removeFile,
    setExplicitUrl,
    dragProps: {
      onDragOver,
      onDragLeave,
      onDrop,
    },
  };
}
