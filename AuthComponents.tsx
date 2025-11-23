
import React, { useState } from 'react';
import { User } from '../types';
import { authenticate, changePassword, recoverPassword, recoverUsername } from '../services/authService';
import { FormInput, Button } from './InputComponents';
import { getGlobalSettings } from '../services/authService';
import { PalmLogo } from './Icons';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'forgot_password' | 'forgot_username' | 'force_change'>('login');
  const [loginType, setLoginType] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const settings = getGlobalSettings();

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Force Change State
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [newPass, setNewPass] = useState('');

  // Recovery State
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(0); // 0: Input, 1: Verify

  const handleLogin = () => {
    setError('');
    const user = authenticate(loginEmail, loginPass);
    
    if (!user) {
      setError('Invalid credentials');
      return;
    }

    // 20.4 Login Flow Logic & Visibility
    // Super Admin uses the 'admin' tab but gets special privileges later.
    // Standard Admins use 'admin'.
    // Users use 'user'.

    if (loginType === 'admin') {
        // Allow Super Admin OR Admin
        if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'owner') {
            setError('You are not authorised to access the Admin Panel.');
            return;
        }
    } else {
        // User Tab
        if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'owner') {
            setError('Administrators must use the Admin Login.');
            return;
        }
    }

    // Check for Temporary Password (20.3 / 20.5)
    if (user.mustChangePassword) {
        setTempUser(user);
        setMode('force_change');
        return;
    }

    onLogin(user);
  };

  const handleForceChange = () => {
      if (!tempUser) return;
      try {
          changePassword(tempUser.email, loginPass, newPass, true);
          // Re-fetch user to get clean state
          const updated = authenticate(tempUser.email, newPass);
          if (updated) onLogin(updated);
      } catch (e: any) {
          setError(e.message);
      }
  };

  const handleRecoverPassword = () => {
      if (step === 0) {
          const exists = recoverPassword(recoveryEmail);
          if (exists) {
              setStep(1);
              setSuccess(`Verification code sent to ${recoveryEmail}`);
              setError('');
          } else {
              setError('Email not found.');
          }
      } else {
          if (verificationCode === '1234') { // Mock Code
              setSuccess('Password reset link sent to your email.');
              setTimeout(() => { setMode('login'); setStep(0); setSuccess(''); }, 2000);
          } else {
              setError('Invalid verification code.');
          }
      }
  };

  const handleRecoverUsername = () => {
      const email = recoverUsername(recoveryPhone);
      if (email) {
          setSuccess(`Your username (email) is: ${email}`);
          setError('');
      } else {
          setError('Phone number not found associated with any account.');
      }
  };

  const renderLogin = () => (
      <>
        {/* Login Type Toggle - Super Admin is hidden inside 'Admin' */}
        <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
            <button 
                onClick={() => { setLoginType('user'); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${loginType === 'user' ? 'bg-ai-accent text-slate-900 shadow' : 'text-gray-400 hover:text-white'}`}
            >
                User Login
            </button>
            <button 
                onClick={() => { setLoginType('admin'); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${loginType === 'admin' ? 'bg-corporate-gold text-slate-900 shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Admin Login
            </button>
        </div>

        <h3 className="text-center text-white font-semibold mb-4">
             {loginType === 'admin' ? 'Admin & Management Portal' : 'Staff Portal'}
        </h3>
        
        <FormInput label="Email (Username)" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
        <FormInput label="Password" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
         
        <div className="flex justify-between text-xs mb-4 px-1">
            <button onClick={() => { setMode('forgot_password'); setError(''); setSuccess(''); }} className="text-ai-accent hover:text-white">Forgot Password?</button>
            <button onClick={() => { setMode('forgot_username'); setError(''); setSuccess(''); }} className="text-gray-400 hover:text-white">Forgot Username?</button>
        </div>

        <Button onClick={handleLogin} className={`w-full mt-2 ${loginType === 'admin' ? 'bg-gradient-to-r from-corporate-gold to-yellow-600' : ''}`}>
             Login
        </Button>
      </>
  );

  const renderForceChange = () => (
      <div className="animate-fadeIn">
          <h3 className="text-xl font-bold text-white mb-2">Password Expired</h3>
          <p className="text-sm text-gray-400 mb-4">Your temporary password has expired. Please set a new one.</p>
          <FormInput label="New Password" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
          <Button onClick={handleForceChange} className="w-full">Update Password</Button>
      </div>
  );

  const renderForgotPassword = () => (
      <div className="animate-fadeIn">
          <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
          {step === 0 ? (
              <>
                <p className="text-sm text-gray-400 mb-4">Enter your registered email to receive a verification code.</p>
                <FormInput label="Email Address" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} />
                <Button onClick={handleRecoverPassword} className="w-full mb-2">Send Code</Button>
              </>
          ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">Enter the verification code sent to your email (Try 1234).</p>
                <FormInput label="Verification Code" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
                <Button onClick={handleRecoverPassword} className="w-full mb-2">Verify & Reset</Button>
              </>
          )}
          <button onClick={() => { setMode('login'); setStep(0); }} className="w-full text-center text-xs text-gray-400 mt-2">Back to Login</button>
      </div>
  );

  const renderForgotUsername = () => (
      <div className="animate-fadeIn">
          <h3 className="text-xl font-bold text-white mb-2">Recover Username</h3>
          <p className="text-sm text-gray-400 mb-4">Enter your registered phone number.</p>
          <FormInput label="Phone Number" value={recoveryPhone} onChange={e => setRecoveryPhone(e.target.value)} />
          <Button onClick={handleRecoverUsername} className="w-full mb-2">Find Username</Button>
          <button onClick={() => setMode('login')} className="w-full text-center text-xs text-gray-400 mt-2">Back to Login</button>
      </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-ai-bg p-4">
      <div className="w-full max-w-md glass p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
            {/* Generic Branding Only */}
            <PalmLogo className="w-16 h-16 text-corporate-gold mb-4 animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-tight text-center">
                Travel Proposal Portal
            </h1>
            <p className="text-gray-400 text-xs mt-1">Secure Access</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-200 text-sm text-center">{success}</div>}

        {mode === 'login' && renderLogin()}
        {mode === 'force_change' && renderForceChange()}
        {mode === 'forgot_password' && renderForgotPassword()}
        {mode === 'forgot_username' && renderForgotUsername()}
      </div>
    </div>
  );
}
