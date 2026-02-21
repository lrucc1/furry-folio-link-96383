import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Mail, Fingerprint } from 'lucide-react'

import { motion } from 'framer-motion'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import { BiometricSetupModal } from '@/components/BiometricSetupModal'

// Animation variants for welcome screen
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
}

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const }
  }
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as const }
  }
}

const buttonContainerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0, 0, 0.2, 1] as const,
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const AuthPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [showBiometricSetup, setShowBiometricSetup] = useState(false)
  const biometric = useBiometricAuth()
  
  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  
  // Sign Up form state
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')

  // Ensure the native app gets a full-bleed gradient behind the webview safe areas
  useEffect(() => {
    const root = document.getElementById('root')

    document.body.classList.add('native-auth-bg')
    document.documentElement.classList.add('native-auth-bg')
    root?.classList.add('native-auth-bg')

    return () => {
      document.body.classList.remove('native-auth-bg')
      document.documentElement.classList.remove('native-auth-bg')
      root?.classList.remove('native-auth-bg')
    }
  }, [])

  useEffect(() => {
    if (user) {
      navigate('/ios-home')
    }
  }, [user, navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim().toLowerCase(),
        password: signInPassword,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Signed in successfully!')
        
        // After successful sign-in, check if biometrics available but not set up
        if (biometric.isAvailable && !biometric.hasCredentials) {
          setShowBiometricSetup(true)
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricSignIn = async () => {
    setBiometricLoading(true)
    try {
      const credentials = await biometric.authenticate()
      if (credentials) {
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })
        
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Signed in with ' + biometric.biometryName)
        }
      } else {
        toast.error('Biometric authentication failed')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setBiometricLoading(false)
    }
  }

  const handleEnableBiometric = async () => {
    if (signInEmail && signInPassword) {
      const success = await biometric.enableBiometric(signInEmail, signInPassword)
      if (success) {
        toast.success(biometric.biometryName + ' enabled for quick sign-in')
      } else {
        toast.error('Failed to enable ' + biometric.biometryName)
      }
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signUpName.trim()) {
      toast.error('Please enter your name')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/ios-home`,
          data: {
            full_name: signUpName.trim(),
            display_name: signUpName.trim()
          }
        }
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created! Please check your email to confirm.')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // View state for iOS native auth
  const [authView, setAuthView] = useState<'welcome' | 'signin' | 'signup' | 'forgot-password'>('welcome');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim().toLowerCase(),
        { redirectTo: 'https://petlinkid.io/reset-password' }
      );
      
      if (error) {
        toast.error(error.message);
      } else {
        setResetSent(true);
        toast.success('Check your email for the reset link');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BiometricSetupModal
        open={showBiometricSetup}
        onOpenChange={setShowBiometricSetup}
        onEnable={handleEnableBiometric}
        biometryName={biometric.biometryName}
      />
      
    {/* Full-bleed gradient container that extends behind safe areas */}
    <div
      className="fixed inset-0 flex flex-col overflow-hidden min-h-screen min-h-dvh"
      style={{
        background: 'linear-gradient(135deg, hsl(175 60% 45%) 0%, hsl(15 85% 65%) 100%)',
      }}
    >
      {/* Welcome Screen */}
      {authView === 'welcome' && (
        <div 
          className="flex-1 flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          {/* Main content - centered */}
          <motion.div 
            className="flex-1 flex flex-col items-center justify-center px-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={logoVariants}>
              <Logo iconClassName="w-20 h-20" textClassName="font-bold text-4xl text-white" />
            </motion.div>
            <motion.h1 variants={fadeUpVariants} className="text-2xl font-semibold text-white text-center mt-6">
              Keep your pets safe
            </motion.h1>
            <motion.p variants={fadeUpVariants} className="text-white/80 text-center mt-2 max-w-xs">
              Digital profiles, smart QR tags, and instant lost pet recovery.
            </motion.p>
          </motion.div>

          {/* Action buttons - bottom */}
          <motion.div 
            className="px-6 space-y-3"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
            initial="hidden"
            animate="visible"
            variants={buttonContainerVariants}
          >
            {/* Biometric sign-in button (if available and credentials stored) */}
            {biometric.isAvailable && biometric.hasCredentials && (
              <motion.div variants={fadeUpVariants}>
                <Button
                  className="w-full h-14 text-base bg-white/20 text-white border border-white/30 hover:bg-white/30 rounded-xl"
                  onClick={handleBiometricSignIn}
                  disabled={biometricLoading || loading}
                >
                  {biometricLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Fingerprint className="mr-2 h-5 w-5" />
                  )}
                  Sign in with {biometric.biometryName}
                </Button>
              </motion.div>
            )}
            
            {/* Email sign-in button */}
            <motion.div variants={fadeUpVariants}>
              <Button
                type="button"
                className="w-full h-14 text-base bg-white text-foreground hover:bg-white/90 rounded-xl"
                onClick={() => setAuthView('signin')}
                disabled={loading}
              >
                <Mail className="mr-2 h-5 w-5" />
                Continue with Email
              </Button>
            </motion.div>

            <motion.div variants={fadeUpVariants} className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthView('signup')}
                className="text-white/70 text-sm"
              >
                Don't have an account? <span className="text-white font-medium underline">Sign up</span>
              </button>
            </motion.div>

            {/* Terms */}
            <motion.p variants={fadeUpVariants} className="text-white/60 text-xs text-center pt-4">
              By continuing, you agree to our{' '}
              <Link to="/ios-terms" className="underline">Terms</Link> and{' '}
              <Link to="/ios-privacy" className="underline">Privacy Policy</Link>.
            </motion.p>
          </motion.div>
        </div>
      )}

      {/* Sign In Form */}
      {authView === 'signin' && (
        <div 
          className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
          style={{ 
            paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)'
          }}
        >
          {/* Back button */}
          <button
            type="button"
            onClick={() => setAuthView('welcome')}
            className="flex items-center text-white mb-6 -ml-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="ml-1">Back</span>
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
          <p className="text-white/70 mb-8">Welcome back to PetLinkID</p>

          <form onSubmit={handleSignIn} className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="signin-email" className="text-white text-sm font-medium">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="you@example.com"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-white/95 border-0 h-14 text-base rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signin-password" className="text-white text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white/95 border-0 h-14 text-base rounded-xl pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                </Button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(signInEmail);
                  setAuthView('forgot-password');
                }}
                className="text-white/70 text-sm mt-1"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit" 
              className="w-full h-14 text-base bg-white text-primary hover:bg-white/90 rounded-xl font-semibold mt-4" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center py-6">
            <button
              type="button"
              onClick={() => setAuthView('signup')}
              className="text-white/70 text-sm"
            >
              Don't have an account? <span className="text-white font-medium underline">Sign up</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign Up Form */}
      {authView === 'signup' && (
        <div 
          className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
          style={{ 
            paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)'
          }}
        >
          {/* Back button */}
          <button
            type="button"
            onClick={() => setAuthView('welcome')}
            className="flex items-center text-white mb-6 -ml-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="ml-1">Back</span>
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-white/70 mb-8">Join PetLinkID today</p>

          <form onSubmit={handleSignUp} className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-white text-sm font-medium">Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Your name"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
                disabled={loading}
                minLength={2}
                maxLength={100}
                className="bg-white/95 border-0 h-14 text-base rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-white text-sm font-medium">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-white/95 border-0 h-14 text-base rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-white text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                  className="bg-white/95 border-0 h-14 text-base rounded-xl pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                </Button>
              </div>
              <p className="text-xs text-white/60">Minimum 8 characters</p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-base bg-white text-primary hover:bg-white/90 rounded-xl font-semibold mt-4" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <p className="text-white/60 text-xs text-center pt-2">
              By signing up, you agree to our{' '}
              <Link to="/ios-terms" className="underline">Terms</Link> and{' '}
              <Link to="/ios-privacy" className="underline">Privacy Policy</Link>.
            </p>
          </form>

          <div className="text-center py-6">
            <button
              type="button"
              onClick={() => setAuthView('signin')}
              className="text-white/70 text-sm"
            >
              Already have an account? <span className="text-white font-medium underline">Sign in</span>
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Form */}
      {authView === 'forgot-password' && (
        <div 
          className="flex-1 flex flex-col px-6 py-4 overflow-y-auto"
          style={{ 
            paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)'
          }}
        >
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setAuthView('signin');
              setResetSent(false);
            }}
            className="flex items-center text-white mb-6 -ml-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="ml-1">Back</span>
          </button>

          {resetSent ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Check your email</h1>
              <p className="text-white/70 text-center max-w-xs mb-8">
                We sent a password reset link to<br /><span className="text-white font-medium">{resetEmail}</span>
              </p>
              <Button
                onClick={() => {
                  setAuthView('signin');
                  setResetSent(false);
                }}
                className="w-full h-14 text-base bg-white text-primary hover:bg-white/90 rounded-xl font-semibold"
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Reset password</h1>
              <p className="text-white/70 mb-8">Enter your email and we'll send you a reset link</p>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-white text-sm font-medium">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/95 border-0 h-14 text-base rounded-xl"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base bg-white text-primary hover:bg-white/90 rounded-xl font-semibold mt-4" 
                  disabled={loading || !resetEmail.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
    </>
  )
}

export default AuthPage
