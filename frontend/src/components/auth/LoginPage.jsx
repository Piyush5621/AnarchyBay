import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import useLogin from "@/hooks/auth/use-login";
import { supabase } from "@/lib/supabase";
import { saveSessionTokens } from "@/lib/api/client";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { IconBrandGithub, IconBrandGitlab, IconBrandGoogle } from "@tabler/icons-react";
import { AnimatedAuthLayout } from "@/components/ui/animated-auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const navigate = useNavigate();
  
  const { mutate: login, isPending, error } = useLogin();

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        saveSessionTokens(session);
        navigate("/dashboard");
      }
    };
    checkExistingSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        saveSessionTokens(session);
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  const handleOAuthLogin = async (provider) => {
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message);
      }
    } catch {
      toast.error("OAuth login failed. Please try again.");
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <AnimatedAuthLayout isTyping={isTyping} password={password} showPassword={showPassword}>
      <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-black">
              <Sparkles className="size-4 text-primary" />
            </div>
            <span className="font-black text-2xl">Anarchy Bay</span>
          </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter mb-2 uppercase">Welcome back</h1>
          <p className="text-muted-foreground text-lg" style={{ fontFamily: "'Fleur De Leah', cursive", fontSize: '1.8rem', color: 'var(--pink-500)' }}>Ready to continue your journey?</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="anna@example.com"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              required
              className="h-14 bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_var(--black)] transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" disabled={isPending} className="text-sm font-bold uppercase tracking-wider">Password</Label>
              <Link to="/forgot-password" size="sm" className="text-xs font-bold uppercase underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-14 pr-12 bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_var(--black)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:scale-110 transition-transform"
              >
                {showPassword ? (
                  <EyeOff className="size-6" />
                ) : (
                  <Eye className="size-6" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 text-sm font-bold text-white bg-red-500 border-3 border-black shadow-[4px_4px_0px_var(--black)]">
              {error.message || "Login failed. Please check your credentials."}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-bold uppercase border-3 border-black bg-[var(--pink-500)] text-white shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all disabled:opacity-50" 
            size="lg" 
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-3 border-black" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold">
              <span className="bg-white px-3 text-black border-3 border-black">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-14 border-3 border-black bg-white shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all font-bold uppercase"
              type="button"
              onClick={() => handleOAuthLogin("github")}
              disabled={oauthLoading}
            >
              <IconBrandGithub className="mr-2 size-6" />
              GitHub
            </Button>
              <Button 
                variant="outline" 
                className="h-14 border-3 border-black bg-white shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all font-bold uppercase"
                type="button"
                onClick={() => handleOAuthLogin("gitlab")}
                disabled={oauthLoading}
              >
                <IconBrandGitlab className="mr-2 size-6" style={{ color: '#FC6D26' }} />
                GitLab
              </Button>
          </div>
          
            <Button 
              variant="outline" 
              className="w-full h-14 border-3 border-black bg-white shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all font-bold uppercase"
              type="button"
              onClick={() => handleOAuthLogin("google")}
              disabled={oauthLoading}
            >
              <IconBrandGoogle className="mr-2 size-6" style={{ color: '#4285F4' }} />
              Google
            </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-black font-bold mt-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[var(--pink-600)] underline">
            Sign Up
          </Link>
        </div>
      </div>
    </AnimatedAuthLayout>
  );
}
