"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailValidationResult, setEmailValidationResult] = useState<{
    isValid: boolean;
    reason?: string;
    provider: string;
  } | null>(null);
  const { login } = useAuth();

  // Debounced email validation
  const debouncedEmailValidation = useCallback(
    debounce(async (email: string) => {
      if (!email || email.length < 5) return;

      setIsValidatingEmail(true);
      try {
        const response = await fetch('/api/validate-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const result = await response.json();
        setEmailValidationResult(result);
        
        if (!result.isValid) {
          setEmailError(result.reason || 'Invalid email address');
        } else {
          setEmailError("");
        }
      } catch (error) {
        console.error('Email validation error:', error);
        // Don't show error for validation failures, just continue
      } finally {
        setIsValidatingEmail(false);
      }
    }, 500),
    []
  );

  // Debounce function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    } else if (emailValidationResult && !emailValidationResult.isValid) {
      setEmailError(emailValidationResult.reason || "Invalid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValidationResult(null); // Clear previous validation result
    
    if (emailError) {
      validateEmail(value);
    }
    
    // Trigger debounced validation
    debouncedEmailValidation(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!validateEmail(email)) {
      return;
    }

    // Validate password
    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Use auth context to login and redirect
        login(data.user);
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => validateEmail(email)}
                    required
                    className={`h-11 pr-10 ${emailError ? 'border-red-500 focus:border-red-500' : ''} ${emailValidationResult?.isValid ? 'border-green-500 focus:border-green-500' : ''}`}
                  />
                  {isValidatingEmail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {emailValidationResult?.isValid && !isValidatingEmail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
                )}
                {emailValidationResult?.isValid && !emailError && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Email validated by {emailValidationResult.provider}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">
                    Remember me
                  </Label>
                </div>
                <Button variant="link" className="px-0 text-sm">
                  Forgot password?
                </Button>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading || isValidatingEmail}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="relative">
              <Separator className="my-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white dark:bg-slate-950 px-2 text-sm text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" className="h-11">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="link" className="px-0 text-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                Twitter
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{" "}
                <Button variant="link" className="px-0 text-sm">
                  Sign up
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center mb-2">
              Demo Credentials (for testing)
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <p><strong>Email:</strong> phillipawilson83@gmail.com</p>
              <p><strong>Password:</strong> 123</p>
              <p><strong>Or:</strong> admin@trust.com / admin123</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            By signing in, you agree to our{" "}
            <Button variant="link" className="px-0 text-xs">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="px-0 text-xs">
              Privacy Policy
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
