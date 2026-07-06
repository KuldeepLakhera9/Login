import React, { useRef, useEffect, useState } from 'react';
import { Mail, ArrowRight, X, Loader2 } from 'lucide-react';
import { InputField } from './InputField';
import { useToast } from './Toast';

export function ForgotPasswordModal({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e) => {
      e.preventDefault();
      handleClose();
    };

    // Listen to native dialog cancel event (Esc key)
    dialog.addEventListener('cancel', handleCancel);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, []);

  const handleClose = () => {
    setEmail('');
    setEmailError('');
    setIsLoading(false);
    onClose();
  };

  const handleLightDismiss = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Detect if click is on the backdrop
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
    if (!isInDialog) {
      handleClose();
    }
  };

  const validateEmail = (value) => {
    if (!value) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setEmailError('');
    setIsLoading(true);

    try {
      // Simulate sending password reset email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addToast(`A recovery email has been sent to ${email}.`, 'success');
      handleClose();
    } catch (e) {
      addToast('Failed to send recovery email. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleLightDismiss}
      className="
        fixed inset-0 m-auto p-0 rounded-2xl border border-slate-200 dark:border-slate-800
        glass-panel shadow-2xl max-w-md w-full overflow-hidden outline-none
      "
      aria-labelledby="modal-title"
    >
      <div className="p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 id="modal-title" className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">
            Reset Password
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Enter the email address associated with your account, and we will send you a secure link to reset your password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Email Address"
            id="forgot-email"
            name="forgot_email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(validateEmail(e.target.value));
            }}
            onBlur={() => setEmailError(validateEmail(email))}
            error={emailError}
            required
            icon={Mail}
            autocomplete="email"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="
              relative w-full min-h-[50px] rounded-xl flex items-center justify-center gap-2 px-4 py-3
              font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700
              shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
              transition-all duration-300 ease-out cursor-pointer
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </dialog>
  );
}
