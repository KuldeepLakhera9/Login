import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Loader2, 
  KeyRound,
  ChevronRight,
  Shield,
  Zap,
  LogOut,
  User as UserIcon,
  Calendar,
  Globe,
  Copy,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast, ToastProvider } from './components/Toast';
import { InputField } from './components/InputField';
import { OTPInput } from './components/OTPInput';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { BrandPanel } from './components/BrandPanel';
import { SocialButton } from './components/SocialButton';

function LoginApp() {
  const { addToast } = useToast();
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Flow states
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Auth Method
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp' | 'social'

  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

  // UI States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'github' | 'apple'
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isFormShaking, setIsFormShaking] = useState(false);

  // OTP-specific states
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Dashboard Visual states
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Check if user is logged in already on app start
  useEffect(() => {
    const checkLoggedSession = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setIsAppLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          localStorage.removeItem('jwt_token');
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setIsAppLoading(false);
      }
    };
    checkLoggedSession();
  }, []);

  // Sync dark mode class with documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // OTP Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clean form errors when switching steps or modes
  const resetErrors = () => {
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setNameError('');
    setOtpError('');
  };

  const handleToggleMode = () => {
    setIsSignup((prev) => !prev);
    setStep(1);
    setPassword('');
    setConfirmPassword('');
    setOtpCode(['', '', '', '', '', '']);
    setOtpSent(false);
    resetErrors();
  };

  // Real-time validators
  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required';
    if (isSignup && val.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validateName = (val) => {
    if (isSignup && !val.trim()) return 'Name is required';
    return '';
  };

  // Password strength checker logic
  const checkPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-800' };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500' };
      case 2:
      case 3:
        return { score, label: 'Medium', color: 'bg-amber-500' };
      case 4:
        return { score, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-800' };
    }
  };

  const strength = checkPasswordStrength(password);

  // Trigger form shake on validation error
  const triggerShake = () => {
    setIsFormShaking(true);
    setTimeout(() => setIsFormShaking(false), 500);
  };

  // Step 1: Submit Email (and Name if signing up)
  const handleStep1Submit = (e) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const nErr = validateName(name);

    if (eErr || nErr) {
      setEmailError(eErr);
      setNameError(nErr);
      triggerShake();
      return;
    }

    resetErrors();
    setIsLoading(true);

    // Simulate database lookup check (or just go to next step)
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      addToast('Email verified. Choose your authentication method.', 'info');
    }, 500);
  };

  // Send Simulated OTP Code
  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtpSent(true);
      setCountdown(59);
      setOtpError('');
      addToast('A 6-digit verification code has been sent to your email.', 'success');
    } catch (e) {
      addToast('Failed to send code. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Password or OTP Auth (Step 2)
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    
    if (authMethod === 'password') {
      const pErr = validatePassword(password);
      let cpErr = '';
      if (isSignup && password !== confirmPassword) {
        cpErr = 'Passwords do not match';
      }

      if (pErr || cpErr) {
        setPasswordError(pErr);
        setConfirmPasswordError(cpErr);
        triggerShake();
        return;
      }

      resetErrors();
      setIsLoading(true);

      try {
        const url = isSignup ? '/api/auth/signup' : '/api/auth/login';
        const bodyPayload = isSignup 
          ? { name, email, password }
          : { email, password };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Authentication failed');
        }

        // Save token & set user session
        localStorage.setItem('jwt_token', data.token);
        setCurrentUser(data.user);

        addToast(
          isSignup 
            ? 'Account created successfully! Welcome to Nexoraa.' 
            : 'Welcome back! You have logged in successfully.', 
          'success'
        );

        // Clear forms
        setStep(1);
        setEmail('');
        setName('');
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        addToast(err.message || 'Authentication failed. Please check your credentials.', 'error');
        triggerShake();
      } finally {
        setIsLoading(false);
      }
    } 
    
    else if (authMethod === 'otp') {
      const isOtpComplete = otpCode.every((digit) => digit !== '');
      if (!isOtpComplete) {
        setOtpError('Please enter all 6 digits of the OTP');
        triggerShake();
        return;
      }

      setOtpError('');
      setIsLoading(true);

      // OTP Login is simulated for demo, but checks standard codes
      try {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            const enteredCode = otpCode.join('');
            if (enteredCode === '123456' || enteredCode === '111111') {
              resolve();
            } else {
              reject(new Error('Invalid code'));
            }
          }, 1500);
        });

        // Let's create or load a mock user based on the entered email
        const token = 'mock_otp_token_jwt_' + Math.random().toString(36).substr(2, 9);
        const mockUser = {
          name: email.split('@')[0],
          email: email,
          createdAt: new Date().toISOString()
        };

        // Since it's a demo flow, we mock the OTP successful login session
        localStorage.setItem('jwt_token', token);
        setCurrentUser(mockUser);

        addToast('Verification successful! Welcome to your dashboard.', 'success');
        setStep(1);
        setEmail('');
        setOtpCode(['', '', '', '', '', '']);
        setOtpSent(false);
      } catch (err) {
        setOtpError('Invalid 6-digit code. Use 123456 or 111111 for simulation.');
        addToast('Invalid verification code.', 'error');
        triggerShake();
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Simulated Social Login handler
  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const token = 'mock_social_token_jwt_' + Math.random().toString(36).substr(2, 9);
      const mockUser = {
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        email: `${provider}@nexoraa-social.com`,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('jwt_token', token);
      setCurrentUser(mockUser);

      addToast(`Successfully authenticated with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`, 'success');
      setStep(1);
      setEmail('');
    } catch (e) {
      addToast(`Authentication with ${provider} failed.`, 'error');
    } finally {
      setSocialLoading(null);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setCurrentUser(null);
    addToast('You have logged out successfully.', 'info');
  };

  // Copy API key utility
  const copyToClipboard = () => {
    navigator.clipboard.writeText('nx_live_cf890ea123bc6de7f384a8d0ef5a');
    setCopiedKey(true);
    addToast('API Token copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Loader during app session recovery
  if (isAppLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Checking credentials...</span>
      </div>
    );
  }

  // --- POST-LOGIN USER PROFILE VIEW (DASHBOARD) ---
  if (currentUser) {
    const formattedDate = new Date(currentUser.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <main className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
        <div className="aurora-bg">
          <div className="aurora-blur absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-400 dark:bg-indigo-900/40"></div>
          <div className="aurora-blur absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-400 dark:bg-violet-900/40"></div>
        </div>

        <div className="relative w-full max-w-4xl rounded-3xl glass-panel shadow-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden z-10 p-6 md:p-10 transition-all duration-300">
          {/* Header Controls */}
          <div className="flex justify-between items-center w-full pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold font-display tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-950 dark:from-slate-100 dark:to-slate-300">
                Nexoraa Workspace
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle theme mode"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="mt-8 flex flex-col md:flex-row gap-8 text-left">
            {/* Left Col: User Metadata card */}
            <div className="w-full md:w-[35%] flex flex-col gap-4">
              <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg shadow-indigo-500/20 mb-4">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-all max-w-full">
                  {currentUser.email}
                </p>

                <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-800 my-4" />

                <div className="flex flex-col gap-3 w-full text-left">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                    <span>Role: <strong className="text-slate-800 dark:text-slate-200 font-semibold">Workspace Owner</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>Joined: <strong className="text-slate-800 dark:text-slate-200 font-medium">{formattedDate}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Environment metrics & API keys */}
            <div className="w-full md:w-[65%] flex flex-col gap-6">
              {/* Deploy Settings */}
              <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
                <h4 className="text-sm font-bold font-display text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider">
                  Active Edge Deployment
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">Network Region</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Global (24 PoPs)</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">SSL Certificate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-slow"></span>
                      <span className="text-xs font-bold text-emerald-500">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer API Tokens */}
              <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold font-display text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    API Tokens
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">
                    Use this secret key to authenticate your serverless functions with the Nexoraa CLI.
                  </p>
                </div>

                <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 p-3.5 flex items-center justify-between gap-3">
                  <code className="text-xs font-mono text-slate-800 dark:text-slate-300 break-all select-all flex-grow pr-16">
                    {showApiKey ? 'nx_live_cf890ea123bc6de7f384a8d0ef5a' : 'nx_live_••••••••••••••••••••••••••••••••'}
                  </code>
                  
                  <div className="absolute right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      aria-label={showApiKey ? 'Hide Token' : 'Show Token'}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      aria-label="Copy Token"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- STANDARD PRE-LOGIN AUTH VIEWS ---
  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      <div className="aurora-bg">
        <div className="aurora-blur absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-400 dark:bg-indigo-900/40"></div>
        <div className="aurora-blur absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-400 dark:bg-violet-900/40"></div>
      </div>

      <div className="relative w-full max-w-5xl h-full min-h-[600px] flex flex-col md:flex-row rounded-3xl glass-panel shadow-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden z-10 transition-all duration-300">
        
        {/* Left Side: Brand Panel */}
        <section className="w-full md:w-[45%] flex-shrink-0">
          <BrandPanel />
        </section>

        {/* Right Side: Authentication form */}
        <section className="w-full md:w-[55%] p-6 sm:p-10 md:p-12 flex flex-col justify-between relative overflow-y-auto">
          {/* Header Controls */}
          <div className="flex justify-between items-center w-full mb-6">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  resetErrors();
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle theme mode"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Form wrapper */}
          <div 
            className={`
              w-full max-w-[420px] mx-auto my-auto flex flex-col gap-6
              ${isFormShaking ? 'animate-shake' : ''}
            `}
          >
            {/* Header titles */}
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-slate-50">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-light">
                {isSignup 
                  ? 'Sign up to start deploying on the global edge network.' 
                  : 'Log in to manage your serverless apps.'
                }
              </p>
            </div>

            {/* Form step 1 */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
                {isSignup && (
                  <InputField
                    label="Full Name"
                    id="name"
                    name="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError(validateName(e.target.value));
                    }}
                    onBlur={() => setNameError(validateName(name))}
                    error={nameError}
                    required
                    autocomplete="name"
                  />
                )}

                <InputField
                  label="Email Address"
                  id="email"
                  name="email"
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
                  autocomplete="username"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    relative w-full min-h-[50px] rounded-xl flex items-center justify-center gap-2 px-4 py-3 mt-2
                    font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700
                    shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
                    transition-all duration-300 ease-out cursor-pointer
                  "
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form step 2 (Auth Options) */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                {/* Method selector tabs */}
                <div 
                  role="tablist" 
                  aria-label="Authentication Methods" 
                  className="flex border-b border-slate-200 dark:border-slate-800 p-0.5"
                >
                  <button
                    role="tab"
                    aria-selected={authMethod === 'password'}
                    aria-controls="password-panel"
                    id="tab-password"
                    type="button"
                    onClick={() => setAuthMethod('password')}
                    className={`
                      flex-1 pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer
                      ${authMethod === 'password'
                        ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }
                    `}
                  >
                    Password
                  </button>
                  <button
                    role="tab"
                    aria-selected={authMethod === 'otp'}
                    aria-controls="otp-panel"
                    id="tab-otp"
                    type="button"
                    onClick={() => setAuthMethod('otp')}
                    className={`
                      flex-1 pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer
                      ${authMethod === 'otp'
                        ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }
                    `}
                  >
                    OTP Code
                  </button>
                  <button
                    role="tab"
                    aria-selected={authMethod === 'social'}
                    aria-controls="social-panel"
                    id="tab-social"
                    type="button"
                    onClick={() => setAuthMethod('social')}
                    className={`
                      flex-1 pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer
                      ${authMethod === 'social'
                        ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }
                    `}
                  >
                    Social
                  </button>
                </div>

                {/* Password Auth Panel */}
                {authMethod === 'password' && (
                  <form 
                    id="password-panel"
                    role="tabpanel"
                    aria-labelledby="tab-password"
                    onSubmit={handleStep2Submit} 
                    className="flex flex-col gap-4"
                  >
                    <InputField
                      label="Password"
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(validatePassword(e.target.value));
                      }}
                      onBlur={() => setPasswordError(validatePassword(password))}
                      error={passwordError}
                      required
                      icon={Lock}
                      autocomplete={isSignup ? 'new-password' : 'current-password'}
                    />

                    {/* Password Strength Indicator for sign-up */}
                    {isSignup && password && (
                      <div className="flex flex-col gap-1.5 -mt-1 px-1">
                        <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          <span>Password Strength</span>
                          <span className={
                            strength.label === 'Strong' ? 'text-emerald-500' :
                            strength.label === 'Medium' ? 'text-amber-500' : 'text-red-500'
                          }>
                            {strength.label}
                          </span>
                        </div>
                        <div className="flex gap-1 h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: `${(strength.score / 4) * 100}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-light mt-0.5">
                          Must include letters, numbers, and uppercase characters.
                        </span>
                      </div>
                    )}

                    {isSignup && (
                      <InputField
                        label="Confirm Password"
                        id="confirm-password"
                        name="confirm_password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (confirmPasswordError) setConfirmPasswordError('');
                        }}
                        error={confirmPasswordError}
                        required
                        icon={Lock}
                        autocomplete="new-password"
                      />
                    )}

                    {/* Remember me & Forgot Password Row */}
                    {!isSignup && (
                      <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="accent-indigo-600 rounded cursor-pointer"
                          />
                          <span>Remember me</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsForgotOpen(true)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="
                        relative w-full min-h-[50px] rounded-xl flex items-center justify-center gap-2 px-4 py-3 mt-2
                        font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700
                        shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
                        transition-all duration-300 ease-out cursor-pointer
                      "
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>{isSignup ? 'Complete Sign Up' : 'Sign In'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* OTP Auth Panel */}
                {authMethod === 'otp' && (
                  <div 
                    id="otp-panel"
                    role="tabpanel"
                    aria-labelledby="tab-otp"
                    className="flex flex-col gap-6"
                  >
                    {!otpSent ? (
                      <div className="text-center flex flex-col gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 mx-auto">
                          <KeyRound className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Verify with a one-time code
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-4 leading-relaxed">
                            We will send a 6-digit verification code to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={isLoading}
                          className="
                            relative w-full min-h-[50px] rounded-xl flex items-center justify-center gap-2 px-4 py-3 mt-2
                            font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700
                            shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
                            transition-all duration-300 ease-out cursor-pointer
                          "
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>Send Verification Code</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleStep2Submit} className="flex flex-col gap-6">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 px-4 leading-relaxed">
                            Enter the 6-digit verification code sent to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>.<br />
                            <span className="text-[10px] text-slate-400">(For presentation demo: enter <strong className="text-indigo-500">123456</strong> or <strong className="text-indigo-500">111111</strong>)</span>
                          </p>
                          
                          <OTPInput
                            length={6}
                            value={otpCode}
                            onChange={(newValue) => {
                              setOtpCode(newValue);
                              if (otpError) setOtpError('');
                            }}
                            error={otpError}
                          />
                        </div>

                        <div className="flex flex-col gap-3">
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
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span>Verify & Continue</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          <div className="text-center">
                            {countdown > 0 ? (
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Resend code in {countdown}s
                              </p>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendOTP}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                              >
                                Didn't receive a code? Resend code
                              </button>
                            )}
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Social Auth Panel */}
                {authMethod === 'social' && (
                  <div 
                    id="social-panel"
                    role="tabpanel"
                    aria-labelledby="tab-social"
                    className="flex flex-col gap-4 text-center"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Authenticate securely using your external account.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <SocialButton
                        provider="google"
                        onClick={() => handleSocialLogin('google')}
                        isLoading={socialLoading === 'google'}
                        disabled={socialLoading !== null && socialLoading !== 'google'}
                      />
                      <SocialButton
                        provider="github"
                        onClick={() => handleSocialLogin('github')}
                        isLoading={socialLoading === 'github'}
                        disabled={socialLoading !== null && socialLoading !== 'github'}
                      />
                      <SocialButton
                        provider="apple"
                        onClick={() => handleSocialLogin('apple')}
                        isLoading={socialLoading === 'apple'}
                        disabled={socialLoading !== null && socialLoading !== 'apple'}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mode toggle footer */}
          <div className="w-full text-center mt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={handleToggleMode}
                className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>
        </section>
      </div>

      {/* Forgot Password Dialog Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </main>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LoginApp />
    </ToastProvider>
  );
}
