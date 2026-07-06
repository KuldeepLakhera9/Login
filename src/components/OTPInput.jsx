import React, { useRef, useEffect } from 'react';

export function OTPInput({ length = 6, value = [], onChange, error }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus the first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    
    // Only accept numeric inputs
    if (val && !/^\d+$/.test(val)) return;

    const newValue = [...value];
    // Keep only the last character if they somehow typed multiple
    newValue[index] = val.slice(-1);
    onChange(newValue);

    // Focus next input if value is filled
    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace: clear current and focus previous
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
        inputRefs.current[index - 1].focus();
      } else {
        const newValue = [...value];
        newValue[index] = '';
        onChange(newValue);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if it is a number and matches length
    if (!/^\d+$/.test(pastedData)) return;

    const newValue = pastedData.slice(0, length).split('');
    // Fill the rest with empty strings if pasted data is shorter
    while (newValue.length < length) {
      newValue.push('');
    }
    onChange(newValue);

    // Focus the last filled input or the last input
    const focusIndex = Math.min(pastedData.length, length - 1);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5 text-center">
      <div 
        className="flex justify-between gap-2 max-w-[360px] mx-auto w-full"
        role="group"
        aria-label="6-digit One-Time Password verification code"
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1}`}
            className={`
              w-12 h-14 rounded-xl text-center text-xl font-bold border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm
              transition-all duration-300 ease-out outline-none
              text-slate-800 dark:text-slate-100 placeholder-slate-400
              ${error 
                ? 'border-red-500/50 dark:border-red-500/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:border-indigo-500/50'
              }
            `}
          />
        ))}
      </div>
      
      {/* Error Announcement */}
      {error && (
        <p className="text-xs text-red-500 font-medium animate-shake" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
