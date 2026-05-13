import { signInWithGoogle, auth } from '../../lib/firebase';
import { motion } from 'motion/react';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      // App.tsx handles state change via onAuthStateChanged
    } catch (err: any) {
      if (err.code === 'auth/disallowed-useragent' || err.message?.includes('disallowed_useragent')) {
        setError("LOGIN BLOCKED: Google prevents login from within some mobile apps and iframes. Please open this site in a standard browser (Safari/Chrome) to log in.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
      console.error(err);
    }
  };

  const openDirectly = () => {
    window.open(window.location.origin + window.location.pathname + '#admin-portal', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-background p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass rounded-3xl p-12 text-center border-blue-500/10"
      >
        <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-600/20 shadow-xl shadow-blue-600/5">
          <Lock className="text-blue-500" size={32} />
        </div>
        
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight mb-2">Staff Portal</h1>
        <p className="text-slate-500 mb-12 text-sm font-medium">Authorized personnel only</p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-3 rounded-xl"
          >
            <div className="flex items-center gap-3 w-full">
              <ShieldAlert size={18} />
              <span className="flex-1 text-left">{error}</span>
            </div>
            {error.includes('LOGIN BLOCKED') && (
              <button 
                onClick={openDirectly}
                className="mt-2 w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all"
              >
                OPEN IN FULL BROWSER
              </button>
            )}
          </motion.div>
        )}

        <button 
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl flex items-center justify-center gap-4 font-bold uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
        >
          <Mail size={18} />
          Authenticate via Google
        </button>

        <div className="mt-12 flex flex-col gap-4">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold leading-loose">
            Secure terminal for 3CSValeting operations.
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={openDirectly}
              className="text-[9px] text-slate-400 hover:text-white uppercase tracking-widest font-black transition-colors"
            >
              Trouble logging in? Open in New Tab
            </button>
            <button 
              onClick={() => window.location.hash = ''} 
              className="text-[9px] text-blue-500/50 hover:text-blue-400 uppercase tracking-widest font-black transition-colors"
            >
              Return to Public Site
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
