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
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
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

  // Email domain autocomplete suggestions logic
  const DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

  const handleEmailChange = (val) => {
    setEmail(val);
    if (emailError) setEmailError(validateEmail(val));

    if (val.includes('@')) {
      const [localPart, domainPart] = val.split('@');
      if (localPart && !val.endsWith('.')) {
        const matchingDomains = DOMAINS.filter(d => d.startsWith(domainPart))
          .map(d => `${localPart}@${d}`);
        
        if (matchingDomains.length > 0 && matchingDomains[0] !== val) {
          setEmailSuggestions(matchingDomains);
          setActiveSuggestionIndex(0);
        } else {
          setEmailSuggestions([]);
        }
      } else {
        setEmailSuggestions([]);
      }
    } else {
      setEmailSuggestions([]);
    }
  };

  const handleEmailKeyDown = (e) => {
    if (emailSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % emailSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev - 1 + emailSuggestions.length) % emailSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setEmail(emailSuggestions[activeSuggestionIndex]);
      setEmailSuggestions([]);
    } else if (e.key === 'Escape') {
      setEmailSuggestions([]);
    }
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

  // Send Real Email OTP Code
  const handleSendOTP = async () => {
    setIsLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP code');
      }

      setOtpSent(true);
      setCountdown(59);
      
      // If there's a devFallbackCode in response, alert user (helps presentation if SMTP isn't set up yet)
      if (data.devFallbackCode) {
        addToast('Developer Fallback Active. See code in notification!', 'info');
        console.log(`%c[OTP CODE]: ${data.devFallbackCode}`, 'font-size: 20px; color: #4f46e5; font-weight: bold;');
        alert(`Developer Fallback Active!\n\nEmail sending is not configured (EMAIL_USER / EMAIL_PASS in server/.env are blank).\n\nYour 6-digit verification code is: ${data.devFallbackCode}`);
      } else {
        addToast('A 6-digit verification code has been sent to your email.', 'success');
      }
    } catch (e) {
      console.error('OTP send error:', e);
      addToast(e.message || 'Failed to send code. Please try again.', 'error');
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

      try {
        const enteredCode = otpCode.join('');
        const res = await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: enteredCode })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        // OTP Login is successful! Store JWT session
        localStorage.setItem('jwt_token', data.token);
        setCurrentUser(data.user);

        addToast('Verification successful! Welcome back.', 'success');
        setStep(1);
        setEmail('');
        setOtpCode(['', '', '', '', '', '']);
        setOtpSent(false);
      } catch (err) {
        console.error('OTP verify error:', err);
        setOtpError(err.message || 'Invalid 6-digit code. Please try again.');
        addToast(err.message || 'Invalid verification code.', 'error');
        triggerShake();
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Social Login handler (supports real Google OAuth 2.0)
  const handleSocialLogin = async (provider) => {
    if (provider === 'google') {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      // Safety checks for Client ID configuration
      if (!googleClientId || googleClientId.includes('dummygoogleclientid')) {
        addToast('Google Client ID not configured. Please see README instructions.', 'error');
        alert("To enable real Google Login:\n\n1. Create a Web OAuth Client ID in your Google Cloud Console.\n2. Add your Client ID to the root .env file as:\n   VITE_GOOGLE_CLIENT_ID=your_id_here\n3. Restart your dev server.\n\nFalling back to simulated login mode.");
        
        // Fallback simulated login so it doesn't block demo presentations if not set
        setSocialLoading('google');
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const token = 'mock_social_token_jwt_' + Math.random().toString(36).substr(2, 9);
          const mockUser = {
            id: 'mock_google_id_123',
            name: 'Demo Google User',
            email: 'google-demo@nexoraa.com',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('jwt_token', token);
          setCurrentUser(mockUser);
          addToast('Successfully authenticated with Google (Simulated)!', 'success');
        } catch (e) {
          addToast('Simulated login failed', 'error');
        } finally {
          setSocialLoading(null);
        }
        return;
      }

      if (!window.google) {
        addToast('Google Identity library not loaded yet. Please try again.', 'error');
        return;
      }

      setSocialLoading('google');
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              console.error('Google token error:', tokenResponse);
              addToast('Google Auth popup closed or cancelled.', 'error');
              setSocialLoading(null);
              return;
            }

            try {
              // Send token to our Express backend
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: tokenResponse.access_token })
              });

              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.message || 'Verification failed on server');
              }

              // Store session and user info
              localStorage.setItem('jwt_token', data.token);
              setCurrentUser(data.user);
              addToast('Successfully logged in with Google!', 'success');
              setStep(1);
              setEmail('');
            } catch (err) {
              console.error('Verify error:', err);
              addToast(err.message || 'Google verification failed.', 'error');
            } finally {
              setSocialLoading(null);
            }
          },
        });

        // Request access token (opens Google Account Chooser popup)
        tokenClient.requestAccessToken();
      } catch (err) {
        console.error('Google Token Client init error:', err);
        addToast('Failed to initialize Google Sign-In client.', 'error');
        setSocialLoading(null);
      }
    } else {
      // GitHub & Apple simulated logins
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

        {/* Center-aligned minimal profile card */}
        <div className="relative w-full max-w-md rounded-3xl glass-panel shadow-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden z-10 transition-all duration-300">
          
          {/* Aesthetic Cover Banner */}
          <div className="relative h-36 w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 overflow-hidden">
            {/* Visual background layers */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-500 to-slate-950"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-400/30 blur-2xl animate-pulse-slow"></div>
            
            {/* Floating Glassmorphic Control Buttons */}
            <div className="absolute inset-x-4 top-4 flex justify-between items-center z-20">
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 dark:bg-slate-950/20 dark:hover:bg-slate-950/40 backdrop-blur-md border border-white/20 dark:border-slate-800/30 text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Theme"
                aria-label="Toggle theme mode"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 dark:bg-slate-950/20 dark:hover:bg-slate-950/40 backdrop-blur-md border border-white/20 dark:border-slate-800/30 text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Profile Card Body */}
          <div className="px-6 pb-8 pt-0 flex flex-col items-center text-center relative">
            
            {/* Overlapping Gradient Avatar */}
            <div className="relative -mt-14 mb-4 z-10 group">
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-28 h-28 rounded-full border-4 border-slate-50 dark:border-slate-950 object-cover shadow-xl group-hover:scale-105 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-extrabold font-display shadow-xl group-hover:scale-105 transition-all duration-300">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              
              {/* Pulsing Active Status Indicator */}
              <span className="absolute bottom-1 right-1 flex h-4 w-4 rounded-full border-2 border-slate-50 dark:border-slate-950 bg-emerald-500 shadow-md">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              </span>
            </div>

            {/* Profile Identity Details */}
            <h3 className="text-2xl font-extrabold font-display tracking-tight text-slate-800 dark:text-slate-100">
              {currentUser.name}
            </h3>
            
            {/* User Role Badge */}
            <span className="mt-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full shadow-sm">
              Workspace Creator
            </span>

            {/* Premium Divider */}
            <div className="w-full h-[1px] bg-slate-200/60 dark:bg-slate-800/60 my-6" />

            {/* Metadata Fields */}
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 text-left">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 break-all">{currentUser.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 text-left">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Account Created</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Security Indicator */}
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-light">
              <Shield className="w-4 h-4 text-emerald-500 animate-pulse-slow" />
              <span>Identity Verified via JWT & MongoDB</span>
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

                <div className="relative">
                  <InputField
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    onBlur={() => {
                      setEmailError(validateEmail(email));
                      // Delay closing the dropdown so that list clicks can register first
                      setTimeout(() => setEmailSuggestions([]), 200);
                    }}
                    error={emailError}
                    required
                    icon={Mail}
                    autocomplete="username"
                  />
                  {emailSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 z-50 -mt-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md overflow-hidden max-h-48 overflow-y-auto">
                      {emailSuggestions.map((suggestion, index) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setEmail(suggestion);
                            setEmailSuggestions([]);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors duration-150 flex items-center justify-between cursor-pointer
                            ${index === activeSuggestionIndex 
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }
                          `}
                        >
                          <span>{suggestion}</span>
                          {index === activeSuggestionIndex && (
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                              Enter
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

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
