"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import SocialLoginButtons from '../components/SocialLoginButtons';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const { signup, loading, loginWithGoogle, loginWithGithub } = useAuth();
  const router = useRouter();

  useEffect(() => {
    validateForm();
  }, [name, email, password, confirmPassword, agreeToTerms]);

  useEffect(() => {
    if (password) {
      calculatePasswordStrength(password);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    if (passwordStrength === 4) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-600';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    if (passwordStrength === 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const validateForm = () => {
    let isValid = true;
    
    // Name validation
    if (name && name.length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Email validation
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Password validation
    if (password && password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Confirm password validation
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    setIsFormValid(
      isValid && 
      name.length > 1 && 
      email.length > 0 && 
      password.length >= 8 && 
      password === confirmPassword && 
      agreeToTerms
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signup(email, password, name);
      router.push('/'); // Redirect to home page after signup
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again later.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md transition-all duration-300 hover:shadow-xl animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h1>
        
        {error && (
          <div className="bg-red-500/90 text-white p-4 rounded-md mb-6 shadow-md animate-shake">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2 font-medium">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full bg-gray-700 border ${nameError ? 'border-red-500 animate-shake' : 'border-gray-600'} rounded-md p-3 text-white focus-ring focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              placeholder="John Doe"
              required
            />
            {nameError && <p className="mt-1 text-red-400 text-sm animate-fade-in">{nameError}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2 font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-gray-700 border ${emailError ? 'border-red-500 animate-shake' : 'border-gray-600'} rounded-md p-3 text-white focus-ring focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              placeholder="you@example.com"
              required
            />
            {emailError && <p className="mt-1 text-red-400 text-sm animate-fade-in">{emailError}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-gray-700 border ${passwordError ? 'border-red-500 animate-shake' : 'border-gray-600'} rounded-md p-3 text-white pr-10 focus-ring focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button 
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordError && <p className="mt-1 text-red-400 text-sm animate-fade-in">{passwordError}</p>}
            
            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="mt-2 animate-fade-in">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex space-x-1 w-full">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div 
                        key={index}
                        className={`password-strength-meter ${index <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-600'}`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-xs ml-2 w-20 text-right font-medium text-gray-300">
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Mix uppercase, lowercase, numbers and special characters for a stronger password
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-300 mb-2 font-medium">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-gray-700 border ${confirmPasswordError ? 'border-red-500 animate-shake' : 'border-gray-600'} rounded-md p-3 text-white pr-10 focus-ring focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {confirmPasswordError && <p className="mt-1 text-red-400 text-sm animate-fade-in">{confirmPasswordError}</p>}
          </div>
          
          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-300">
                I agree to the 
                <Link href="/terms" className="ml-1 text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-all btn-hover-effect ${loading || !isFormValid ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
          
          <SocialLoginButtons 
            onGoogleLogin={() => { setError(''); loginWithGoogle(); }} 
            onGithubLogin={() => { setError(''); loginWithGithub(); }}
            isLoading={loading}
          />
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
