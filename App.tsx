
import React, { useState, useEffect } from 'react';
import { Leaf, Stethoscope, Moon, Sun, LayoutDashboard, LogOut, Scan, Crown, Zap, Clapperboard } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import PricingModal from './components/PricingModal';
import { analyzePlant, generatePlantVideo } from './services/geminiService';
import { AppState, PlantAnalysisResult, ScanMode, User, ViewMode, SubscriptionPlan } from './types';

// Initial Mock Database
const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@plantpal.com',
    password: 'admin',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    joinedDate: new Date('2024-01-15').toISOString(),
    plan: 'lifetime',
    scansRemaining: -1 // Unlimited
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'user@plantpal.com',
    password: 'user',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    joinedDate: new Date('2024-03-10').toISOString(),
    plan: 'free',
    scansRemaining: 2 // 2 left
  }
];

const App: React.FC = () => {
  // Start with no user to show Login screen
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [viewMode, setViewMode] = useState<ViewMode>('scanner');
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [scanMode, setScanMode] = useState<ScanMode>('identify');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [showPricing, setShowPricing] = useState(false);

  // Toggle Dark Mode Class on Document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleImageSelected = async (base64: string) => {
    // Check usage limits
    if (user && user.plan === 'free' && user.scansRemaining <= 0) {
      setShowPricing(true);
      return;
    }

    setSelectedImage(base64);
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      let analysisResult: PlantAnalysisResult;

      if (scanMode === 'animate') {
        analysisResult = await generatePlantVideo(base64);
      } else {
        analysisResult = await analyzePlant(base64, scanMode);
      }
      
      setResult(analysisResult);
      setAppState(AppState.SUCCESS);
      
      // Decrement usage for free plan
      if (user && user.plan === 'free') {
        const updatedUser = { ...user, scansRemaining: Math.max(0, user.scansRemaining - 1) };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setViewMode('scanner');
  };

  const handleRegister = (newUser: User) => {
    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setViewMode('scanner');
  };

  const handleLogout = () => {
    setUser(null);
    handleReset();
    setViewMode('scanner');
  };

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (!user) return;
    
    const updatedUser: User = { 
      ...user, 
      plan: plan,
      scansRemaining: plan === 'free' ? 3 : -1 // Restore to 3 if downgraded, or -1 unlimited
    };
    
    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setShowPricing(false);
  };

  // Login Screen
  if (!user) {
    return (
      <>
        <div className="absolute top-4 right-4 z-50">
           <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-sm"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
        </div>
        <Login 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
          existingUsers={allUsers}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-50 via-teal-50/20 to-stone-100 dark:from-stone-900 dark:via-stone-950 dark:to-black p-4 md:p-8">
      
      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)}
        onUpgrade={handleUpgrade}
        currentPlan={user.plan}
      />

      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center md:justify-start" onClick={() => { setViewMode('scanner'); handleReset(); }}>
          <div className="bg-teal-600 p-2 rounded-xl shadow-lg animate-logo-entry">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Plant Pal</span>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 w-full md:w-auto">
          
          {/* Plan Status / Upgrade Button */}
          {user.plan === 'free' ? (
             <button 
               onClick={() => setShowPricing(true)}
               className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
             >
               <Zap className="w-3 h-3" />
               <span>Free Plan: {user.scansRemaining} left</span>
               <span className="underline ml-1">Upgrade</span>
             </button>
          ) : (
             <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-semibold">
               <Crown className="w-3 h-3" />
               <span className="capitalize">{user.plan} Plan</span>
             </div>
          )}

          <div className="h-6 w-[1px] bg-stone-200 dark:bg-stone-700 mx-1 hidden md:block"></div>

          {/* Admin Toggle */}
          {user.role === 'admin' && (
            <div className="flex bg-white dark:bg-stone-800 rounded-lg p-1 border border-stone-200 dark:border-stone-700 mr-2 shadow-sm">
              <button
                onClick={() => setViewMode('scanner')}
                className={`p-2 rounded-md transition-all ${viewMode === 'scanner' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700'}`}
                title="Scanner"
              >
                <Scan className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('admin_dashboard')}
                className={`p-2 rounded-md transition-all ${viewMode === 'admin_dashboard' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700'}`}
                title="Admin Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>
            </div>
          )}

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-sm"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="h-8 w-[1px] bg-stone-200 dark:bg-stone-700 mx-1 hidden sm:block"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-1">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 leading-none">{user.name}</p>
               <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 capitalize">{user.role}</p>
             </div>
             <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full bg-stone-200 border border-white dark:border-stone-700 shadow-sm" />
             <button 
                onClick={handleLogout}
                className="ml-1 p-2 text-stone-400 hover:text-red-500 transition-colors"
                title="Logout"
             >
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {viewMode === 'admin_dashboard' ? (
        <AdminDashboard users={allUsers} />
      ) : (
        <main className="flex flex-col items-center justify-center min-h-[60vh] w-full">
          
          {appState === AppState.IDLE && (
            <div className="text-center mb-8 space-y-4 animate-fade-in-up px-2">
              <h1 className="text-3xl md:text-6xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                {scanMode === 'identify' ? (
                  <>
                    Identify any plant <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-300">
                      in seconds.
                    </span>
                  </>
                ) : scanMode === 'diagnose' ? (
                  <>
                    Diagnose plant <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-300">
                      diseases instantly.
                    </span>
                  </>
                ) : (
                  <>
                    Animate plants <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300">
                      with AI video.
                    </span>
                  </>
                )}
              </h1>
              <p className="text-base md:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
                {scanMode === 'identify' 
                  ? "Upload a photo to get instant identification, care tips, and scientific facts verified by Google Search."
                  : scanMode === 'diagnose' 
                    ? "Spot symptoms, identify diseases, and get expert treatment advice for your sick plants."
                    : "Turn your still plant photos into cinematic videos using Google's Veo AI technology."
                }
              </p>
            </div>
          )}

          {/* Mode Toggle */}
          {(appState === AppState.IDLE) && (
            <div className="flex p-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-sm mb-8 animate-fade-in-up transition-colors duration-300 max-w-full overflow-x-auto">
              <button
                onClick={() => setScanMode('identify')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  scanMode === 'identify'
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700'
                }`}
              >
                <Leaf className="w-4 h-4" />
                Identify
              </button>
              <button
                onClick={() => setScanMode('diagnose')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  scanMode === 'diagnose'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                Diagnose
              </button>
              <button
                onClick={() => setScanMode('animate')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  scanMode === 'animate'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700'
                }`}
              >
                <Clapperboard className="w-4 h-4" />
                Animate
              </button>
            </div>
          )}

          {appState === AppState.IDLE || appState === AppState.ANALYZING ? (
             <ImageUploader 
                onImageSelected={handleImageSelected} 
                isLoading={appState === AppState.ANALYZING}
                mode={scanMode}
             />
          ) : null}

          {appState === AppState.ERROR && (
            <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl p-6 text-center shadow-sm">
              <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2">Analysis Failed</h3>
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>
              <button 
                onClick={handleReset}
                className="text-red-700 dark:text-red-300 text-sm font-medium hover:underline"
              >
                Try Again
              </button>
            </div>
          )}

          {appState === AppState.SUCCESS && result && selectedImage && (
            <ResultCard 
              result={result} 
              imageSrc={selectedImage} 
              onReset={handleReset} 
            />
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-12 md:mt-20 py-8 text-center text-stone-400 dark:text-stone-600 text-sm border-t border-stone-200/60 dark:border-stone-800/60 transition-colors duration-300">
        <p>&copy; {new Date().getFullYear()} Plant Pal. Powered by Google Gemini.</p>
        <div className="mt-2 flex justify-center gap-4 flex-wrap">
          <button onClick={() => setShowPricing(true)} className="hover:text-teal-600 transition-colors">Pricing</button>
          <span>•</span>
          <a href="#" className="hover:text-teal-600 transition-colors">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-teal-600 transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
