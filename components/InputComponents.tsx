
import React, { useRef } from 'react';
import { UploadIcon } from './Icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1 mb-4 w-full">
    <label className="text-xs uppercase tracking-wider font-bold text-ai-accent mb-1">{label}</label>
    <input
      className={`bg-ai-bg/50 border border-gray-600 rounded-lg p-3 text-ai-text placeholder-gray-500 focus:ring-2 focus:ring-ai-accent focus:border-transparent focus:outline-none transition-all ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const FormSelect: React.FC<SelectProps> = ({ label, options, className, ...props }) => (
  <div className="flex flex-col gap-1 mb-4 w-full">
    <label className="text-xs uppercase tracking-wider font-bold text-ai-accent mb-1">{label}</label>
    <select
      className={`bg-ai-bg/50 border border-gray-600 rounded-lg p-3 text-ai-text focus:ring-2 focus:ring-ai-accent focus:border-transparent focus:outline-none transition-all ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-ai-card text-ai-text">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const FormCheckbox: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 p-3 bg-ai-bg/30 border border-gray-600 rounded-lg cursor-pointer hover:bg-ai-bg/50 transition-all mb-4 select-none">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange}
      className="w-5 h-5 text-ai-accent rounded focus:ring-ai-accent bg-slate-900 border-gray-500"
    />
    <span className="text-sm font-semibold text-white">{label}</span>
  </label>
);

interface DateRangePickerProps {
    label: string;
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
    minDate?: string;
    className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ label, startDate, endDate, onChange, minDate, className }) => {
    return (
        <div className={`flex flex-col gap-1 mb-4 w-full ${className}`}>
            <label className="text-xs uppercase tracking-wider font-bold text-ai-accent mb-1">{label}</label>
            <div className="flex items-center gap-2 bg-ai-bg/50 border border-gray-600 rounded-lg p-2 focus-within:ring-2 focus-within:ring-ai-accent transition-all">
                <input
                    type="date"
                    value={startDate}
                    min={minDate}
                    onChange={(e) => onChange(e.target.value, endDate)}
                    className="bg-transparent text-ai-text w-full focus:outline-none"
                    placeholder="From"
                />
                <span className="text-gray-400 font-bold">→</span>
                <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => onChange(startDate, e.target.value)}
                    className="bg-transparent text-ai-text w-full focus:outline-none"
                    placeholder="To"
                />
            </div>
        </div>
    );
};

interface FileUploaderProps {
  label: string;
  onFileSelect: (base64: string) => void;
  currentImage?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ label, onFileSelect, currentImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-1 mb-4 w-full">
      <label className="text-xs uppercase tracking-wider font-bold text-ai-accent mb-1">{label}</label>
      <div 
        className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:bg-gray-700/30 transition-colors cursor-pointer flex items-center justify-center gap-3"
        onClick={() => inputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFile} 
        />
        {currentImage ? (
          <div className="relative w-full h-20 group">
             <img src={currentImage} alt="Uploaded" className="w-full h-full object-contain rounded" />
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
               Change Image
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <UploadIcon />
            <span className="text-xs mt-1">Click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-ai-accent/30">
    <div className="text-ai-accent">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-ai-accent to-ai-secondary text-white shadow-lg hover:shadow-ai-accent/20 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100",
    secondary: "bg-ai-card border border-gray-600 text-ai-muted hover:bg-gray-700 hover:text-white",
    danger: "bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
