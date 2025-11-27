
import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, changePassword, sendResetEmail, logoutUser } from '../services/authService';
import { FormInput, Button } from './InputComponents';
import { getGlobalSettings } from '../services/authService';
// import { PalmLogo } from './Icons'; // REMOVED
import { SITCLogo } from './Icons'; // Assuming SITCLogo is available or we use img tag

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

    const handleLogin = async () => {
        setError('');
        try {
            const user = await loginUser(loginEmail, loginPass);

            // 20.4 Login Flow Logic & Visibility
            if (loginType === 'admin') {
                if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'owner') {
                    setError('You are not authorised to access the Admin Panel.');
                    await logoutUser();
                    return;
                }
            } else {
                if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'owner') {
                    setError('Administrators must use the Admin Login.');
                    await logoutUser();
                    return;
                }
            }

            // Check for Temporary Password
            if (user.mustChangePassword) {
                setTempUser(user);
                setMode('force_change');
                return;
            }

            onLogin(user);
        } catch (e: any) {
            setError(e.message || 'Invalid credentials');
        }
    };

    const handleForceChange = async () => {
        if (!tempUser) return;
        try {
            // Note: This might fail if the user is not logged in via Auth SDK (e.g. if we only have Firestore profile)
            // But loginUser ensures Auth login.
            // However, updatePassword requires recent login.
            await changePassword(tempUser.email, loginPass, newPass, true);
            const updated = await loginUser(tempUser.email, newPass);
            onLogin(updated);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleRecoverPassword = async () => {
        if (step === 0) {
            try {
                await sendResetEmail(recoveryEmail);
                setStep(1);
                setSuccess(`Password reset link sent to ${recoveryEmail}`);
                setError('');
                // Auto-return to login after a delay or let user click back
                setTimeout(() => { setMode('login'); setStep(0); setSuccess(''); }, 5000);
            } catch (e: any) {
                setError(e.message || 'Error sending reset email.');
            }
        }
    };

    const handleRecoverUsername = async () => {
        // This is tricky with Firebase as we can't easily search by phone without a specific index or function.
        // We'll use the simulated one if we kept it, or just say "Contact Admin".
        // For now, let's disable or show message.
        setError('Please contact your administrator to recover your username.');
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    };

    const renderLogin = () => (
        <form onSubmit={handleLoginSubmit}>
            {/* Login Type Toggle - Super Admin is hidden inside 'Admin' */}
            <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
                <button
                    type="button"
                    onClick={() => { setLoginType('user'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${loginType === 'user' ? 'bg-ai-accent text-slate-900 shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    User Login
                </button>
                <button
                    type="button"
                    onClick={() => { setLoginType('admin'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${loginType === 'admin' ? 'bg-corporate-gold text-slate-900 shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    Admin Login
                </button>
            </div>

            <h3 className="text-center text-white font-semibold mb-4">
                {loginType === 'admin' ? 'Admin & Management Portal' : 'Staff Portal'}
            </h3>

            <FormInput label="Email (Username)" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoFocus />
            <FormInput label="Password" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} />

            <div className="flex justify-between text-xs mb-4 px-1">
                <button type="button" onClick={() => { setMode('forgot_password'); setError(''); setSuccess(''); }} className="text-ai-accent hover:text-white">Forgot Password?</button>
                <button type="button" onClick={() => { setMode('forgot_username'); setError(''); setSuccess(''); }} className="text-gray-400 hover:text-white">Forgot Username?</button>
            </div>

            <Button type="submit" className={`w-full mt-2 ${loginType === 'admin' ? 'bg-gradient-to-r from-corporate-gold to-yellow-600' : ''}`}>
                Login
            </Button>
        </form>
    );

    const handleForceChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleForceChange();
    };

    const renderForceChange = () => (
        <form onSubmit={handleForceChangeSubmit} className="animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-2">Password Expired</h3>
            <p className="text-sm text-gray-400 mb-4">Your temporary password has expired. Please set a new one.</p>
            <FormInput label="New Password" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} autoFocus />
            <Button type="submit" className="w-full">Update Password</Button>
        </form>
    );

    const handleRecoverPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleRecoverPassword();
    };

    const renderForgotPassword = () => (
        <form onSubmit={handleRecoverPasswordSubmit} className="animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
            {step === 0 ? (
                <>
                    <p className="text-sm text-gray-400 mb-4">Enter your registered email to receive a verification code.</p>
                    <FormInput label="Email Address" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} autoFocus />
                    <Button type="submit" className="w-full mb-2">Send Code</Button>
                </>
            ) : (
                <>
                    <p className="text-sm text-gray-400 mb-4">Enter the verification code sent to your email (Try 1234).</p>
                    <FormInput label="Verification Code" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} autoFocus />
                    <Button type="submit" className="w-full mb-2">Verify & Reset</Button>
                </>
            )}
            <button type="button" onClick={() => { setMode('login'); setStep(0); }} className="w-full text-center text-xs text-gray-400 mt-2">Back to Login</button>
        </form>
    );

    const handleRecoverUsernameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleRecoverUsername();
    };

    const renderForgotUsername = () => (
        <form onSubmit={handleRecoverUsernameSubmit} className="animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-2">Recover Username</h3>
            <p className="text-sm text-gray-400 mb-4">Enter your registered phone number.</p>
            <FormInput label="Phone Number" value={recoveryPhone} onChange={e => setRecoveryPhone(e.target.value)} autoFocus />
            <Button type="submit" className="w-full mb-2">Find Username</Button>
            <button type="button" onClick={() => setMode('login')} className="w-full text-center text-xs text-gray-400 mt-2">Back to Login</button>
        </form>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-ai-bg p-4">
            <div className="w-full max-w-md glass p-8 rounded-2xl border border-slate-700 shadow-2xl">
                <div className="flex flex-col items-center mb-6">
                    {/* Generic Branding Only */}
                    {/* <PalmLogo className="w-16 h-16 text-corporate-gold mb-4 animate-pulse" /> */}
                    <img src="/sitc_logo_final.png" className="h-32 mb-6 object-contain" alt="SITC Logo" />
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
