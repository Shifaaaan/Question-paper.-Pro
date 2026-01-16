import React, { useRef } from 'react';
import { Upload, FileImage, Files } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelect: (files: File[]) => void;
  disabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelect, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array
      const fileArray = Array.from(e.target.files);
      onFilesSelect(fileArray);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      onClick={disabled ? undefined : handleClick}
      className={`
        border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200
        ${disabled ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50' : 'border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-500 cursor-pointer'}
      `}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleChange} 
        accept="image/*" 
        multiple
        className="hidden" 
        disabled={disabled}
      />
      <div className="bg-white p-3 rounded-full shadow-sm mb-4">
        <Files className="w-6 h-6 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">Upload Question Papers</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs">
        Click to select one or more images (JPG, PNG) containing academic questions.
      </p>
    </div>
  );
};
