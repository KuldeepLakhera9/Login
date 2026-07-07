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
  onKeyDown,
  error,
  required = false,
  icon: Icon,
  autocomplete,
  inputmode,
  pattern,
  minlength,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="w-full flex flex-col gap-1 text-left group">
      {/* Label */}
      <div className="flex justify-between items-center px-0.5">
        <label
          htmlFor={id}
          className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-200
            ${isFocused
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
            }
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      </div>

      {/* Input wrapper */}
      <div className="relative rounded-xl transition-all duration-300">
        {/* Left icon */}
        {Icon && (
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={onKeyDown}
          required={required}
          autoComplete={autocomplete}
          inputMode={inputmode}
          pattern={pattern}
          minLength={minlength}
          aria-describedby={errorId}
          aria-invalid={!!error}
          className={`
            w-full min-h-[48px] rounded-xl text-sm
            border transition-all duration-250 outline-none
            text-slate-800 dark:text-slate-100 
            placeholder-slate-400 dark:placeholder-slate-600
            bg-white/60 dark:bg-slate-900/50
            backdrop-blur-sm
            ${Icon ? 'pl-10' : 'px-4'}
            ${isPassword ? 'pr-11' : 'pr-4'}
            ${error
              ? 'border-red-400/60 dark:border-red-500/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
              : `border-slate-200 dark:border-slate-800/80
                focus:border-indigo-400 dark:focus:border-indigo-500/60
                focus:ring-2 focus:ring-indigo-500/12
                hover:border-slate-300 dark:hover:border-slate-700
              `
            }
          `}
        />

        {/* Focus glow overlay */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-indigo-500/15 dark:ring-indigo-400/15" />
        )}

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Error message */}
      <div id={errorId} aria-live="polite" className="min-h-[16px] px-0.5 transition-all duration-200">
        {error && (
          <p className="text-[11px] text-red-500 font-medium animate-shake flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
