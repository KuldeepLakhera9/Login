import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function InputField({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  icon: Icon,
  autocomplete,
  inputmode,
  pattern,
  minlength,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left group">
      {/* Label and Required marker */}
      <div className="flex justify-between items-center px-1">
        <label 
          htmlFor={id} 
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors duration-200"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      </div>

      {/* Input container */}
      <div className="relative rounded-xl transition-all duration-300">
        {/* Left Icon (optional) */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200">
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* The actual Input element */}
        <input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete={autocomplete}
          inputMode={inputmode}
          pattern={pattern}
          minLength={minlength}
          aria-describedby={errorId}
          aria-invalid={!!error}
          className={`
            w-full min-h-[50px] rounded-xl text-sm border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm
            transition-all duration-300 ease-out outline-none
            text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
            ${Icon ? 'pl-12' : 'px-4'}
            ${isPassword ? 'pr-12' : 'pr-4'}
            ${error 
              ? 'border-red-500/50 dark:border-red-500/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:border-indigo-500/50'
            }
          `}
        />

        {/* Right Password Toggle (if type is password) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Error Message */}
      <div 
        id={errorId} 
        aria-live="polite"
        className="min-h-[20px] px-1 transition-all duration-200"
      >
        {error && (
          <p className="text-xs text-red-500 font-medium animate-shake">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
