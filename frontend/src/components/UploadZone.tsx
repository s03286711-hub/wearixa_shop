'use client';
import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  title?: string;
  accept?: string;
}

export default function UploadZone({ 
  onFilesSelected, 
  maxFiles = 3, 
  title = 'Drag & drop images or click to browse',
  accept = 'image/*'
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      onFilesSelected(filesArray);
    }
  }, [onFilesSelected, maxFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).slice(0, maxFiles);
      onFilesSelected(filesArray);
    }
  }, [onFilesSelected, maxFiles]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
        background: isDragging ? 'rgba(201,168,76,0.05)' : 'var(--color-surface)',
        borderRadius: '12px',
        padding: '2rem 1rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      <input
        type="file"
        multiple
        accept={accept}
        onChange={handleChange}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer'
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
        <UploadCloud size={32} style={{ color: isDragging ? 'var(--color-accent)' : 'var(--color-muted)' }} />
        <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>{title}</p>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', margin: 0 }}>
          Max {maxFiles} file{maxFiles !== 1 && 's'}
        </p>
      </div>
    </div>
  );
}
