import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useIsNativeApp } from '@/hooks/useIsNativeApp'
import { isAppleSignInAvailable, handleAppleSignIn } from '@/lib/appleAuth'

const AuthPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isNative = useIsNativeApp()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const showAppleSignIn = isAppleSignInAvailable()
  
  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  
  // Sign Up form state
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')

  useEffect(() => {
    if (user) {
      navigate(isNative ? '/ios-home' : '/dashboard')
    }
  }, [user, navigate, isNative])

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
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
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
          emailRedirectTo: `${window.location.origin}/dashboard`,
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

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  const onAppleSignIn = async () => {
    setLoading(true)
    try {
      await handleAppleSignIn()
    } finally {
      setLoading(false)
    }
  }

  // Apple Sign-In Button Component
  const AppleSignInButton = ({ className = "" }: { className?: string }) => (
    <Button
      type="button"
      variant="outline"
      className={`w-full h-12 bg-black text-white border-0 hover:bg-black/90 ${className}`}
      onClick={onAppleSignIn}
      disabled={loading}
    >
      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
      Apple
    </Button>
  )

  // Google Sign-In Button Component
  const GoogleSignInButton = ({ className = "" }: { className?: string }) => (
    <Button
      type="button"
      variant="outline"
      className={`w-full h-12 ${className}`}
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Google
    </Button>
  )

  // Social Sign-In Buttons (shows Apple on iOS, Google everywhere)
  const SocialSignInButtons = ({ nativeStyle = false }: { nativeStyle?: boolean }) => (
    <div className={showAppleSignIn ? "space-y-3" : ""}>
      {showAppleSignIn && (
        <AppleSignInButton className={nativeStyle ? "text-base" : ""} />
      )}
      <GoogleSignInButton className={nativeStyle ? "text-base bg-white border-0" : "rounded-full"} />
    </div>
  )

  // iOS Native App Layout - Full screen, no card borders
  if (isNative) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex-1 flex flex-col px-6 py-8">
          {/* Logo section */}
          <div className="text-center mb-8 pt-8">
            <div className="flex items-center justify-center mb-4">
              <Logo iconClassName="w-16 h-16" textClassName="font-bold text-3xl text-white" />
            </div>
            <p className="text-white/90 text-lg">Your pet's digital companion</p>
          </div>

          {/* Auth form - no card wrapper */}
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/20">
                <TabsTrigger value="signin" className="text-white data-[state=active]:bg-white data-[state=active]:text-foreground">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-white data-[state=active]:bg-white data-[state=active]:text-foreground">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-white">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-white/95 border-0 h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="bg-white/95 border-0 h-12 text-base pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base bg-white text-primary hover:bg-white/90" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/30" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/70">Or continue with</span>
                    </div>
                  </div>

                  <SocialSignInButtons nativeStyle />
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white">Name</Label>
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
                      className="bg-white/95 border-0 h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-white/95 border-0 h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Password</Label>
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
                        className="bg-white/95 border-0 h-12 text-base pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                      </Button>
                    </div>
                    <p className="text-xs text-white/70">Minimum 8 characters</p>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base bg-white text-primary hover:bg-white/90" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/30" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/70">Or continue with</span>
                    </div>
                  </div>

                  <SocialSignInButtons nativeStyle />
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Terms at bottom */}
          <div className="text-center mt-auto pt-6">
            <p className="text-white/70 text-xs">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="underline">Terms</Link> and{' '}
              <Link to="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Web Layout - mobile first with iOS-inspired card stack
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3 pt-4">
          <div className="flex items-center justify-center">
            <Logo iconClassName="w-14 h-14" textClassName="font-bold text-3xl text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-white">Welcome to PetLinkID</h1>
            <p className="text-white/80 text-sm">Your pet's passport, safety tag and health hub in one place.</p>
          </div>
        </div>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6 space-y-4">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted/60 h-11">
                <TabsTrigger value="signin" className="rounded-full text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full text-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 pt-2">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-full font-semibold" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-white px-3 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <SocialSignInButtons />
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 pt-2">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
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
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
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
                        className="h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-full font-semibold" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-white px-3 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <SocialSignInButtons />
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center px-6 pb-2">
          <p className="text-white/80 text-xs leading-relaxed">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-white">Terms of Service</Link>,{' '}
            <Link to="/subscription-terms" className="underline hover:text-white">Subscription Terms</Link>, and{' '}
            <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
