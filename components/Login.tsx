
import React, { useState } from 'react';
import { Leaf, Lock, Mail, ArrowRight, CheckCircle2, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  existingUsers: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, existingUsers }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      if (isLoginMode) {
        // LOGIN LOGIC
        const foundUser = existingUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (foundUser) {
          onLogin(foundUser);
        } else {
          setError('Invalid email or password');
          setIsLoading(false);
        }
      } else {
        // REGISTER LOGIC
        if (existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          setError('Email already registered');
          setIsLoading(false);
          return;
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          name,
          email,
          password,
          role: 'user', // Default role
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          joinedDate: new Date().toISOString(),
          plan: 'free',
          scansRemaining: 3
        };
        onRegister(newUser);
      }
    }, 800);
  };

  const fillCredentials = (role: UserRole) => {
    setIsLoginMode(true);
    if (role === 'admin') {
      setEmail('admin@plantpal.com');
      setPassword('admin');
    } else {
      setEmail('user@plantpal.com');
      setPassword('user');
    }
    setError(null);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
         <img 
            src="https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=2560&auto=format&fit=crop" 
            alt="Plant Background" 
            className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-[3px]"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-transparent to-stone-900/20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3 bg-teal-600/90 backdrop-blur-md rounded-2xl shadow-lg mb-4 ring-1 ring-white/20">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-stone-100/90 font-medium drop-shadow-sm">
            {isLoginMode ? 'Sign in for free to try it out' : 'Join Plant Pal to start identifying'}
          </p>
        </div>

        <div className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-white/20" style={{ animationDelay: '0.1s' }}>
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-stone-900 dark:text-white"
                      placeholder="Enter your name"
                      required={!isLoginMode}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-stone-900 dark:text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-stone-900 dark:text-white"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium text-center animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-teal-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLoginMode ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={toggleMode}
                  className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
                >
                  {isLoginMode ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
          
          {isLoginMode && (
            <div className="px-6 md:px-8 py-6 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-700">
               <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
                 Demo Credentials
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <button 
                   type="button"
                   onClick={() => fillCredentials('user')}
                   className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 dark:border-stone-600 hover:bg-white dark:hover:bg-stone-700 transition-colors text-left group"
                 >
                   <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                     <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-medium text-stone-700 dark:text-stone-200">User</span>
                     <span className="text-[10px] text-stone-400">Limited (3 Scans)</span>
                   </div>
                 </button>

                 <button 
                   type="button"
                   onClick={() => fillCredentials('admin')}
                   className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 dark:border-stone-600 hover:bg-white dark:hover:bg-stone-700 transition-colors text-left group"
                 >
                   <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                     <Lock className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-medium text-stone-700 dark:text-stone-200">Admin</span>
                     <span className="text-[10px] text-stone-400">Unlimited Access</span>
                   </div>
                 </button>
               </div>
            </div>
          )}
        </div>
        
        <p className="text-center mt-6 text-sm text-stone-200/80 font-medium drop-shadow-sm">
          Powered by Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
};

export default Login;
