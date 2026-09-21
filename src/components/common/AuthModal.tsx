import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Lock, ShieldCheck } from 'lucide-react';
import { getStoredAccount, saveStoredAccount } from '../../utils/storage';
import { UserAccount } from '../../types';
import { useBouncyAnimation, useBouncyBackdropAnimation } from '../../hooks/useBouncyAnimation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAccountUpdated?: (account: UserAccount) => void;
  onAuthSuccess?: (account: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAccountUpdated,
  onAuthSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const modalAnimation = useBouncyAnimation({ type: 'modal', enableHover: false });
  const backdropAnimation = useBouncyBackdropAnimation();

  const notifyAccountUpdated = (updated: UserAccount) => {
    if (typeof onAuthSuccess === 'function') {
      onAuthSuccess(updated);
    }
    if (typeof onAccountUpdated === 'function') {
      onAccountUpdated(updated);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    const current = getStoredAccount();
    const updated: UserAccount = {
      ...current,
      isLoggedIn: true,
      email,
    };
    saveStoredAccount(updated);
    notifyAccountUpdated(updated);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-modal-backdrop"
          initial={backdropAnimation.initial}
          animate={backdropAnimation.animate}
          exit={backdropAnimation.exit}
          transition={backdropAnimation.transition}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="auth-modal-dialog"
            initial={modalAnimation.initial}
            animate={modalAnimation.animate}
            exit={modalAnimation.exit}
            transition={modalAnimation.transition}
            className="w-full max-w-md rounded-[28px] p-6 sm:p-7 relative clay-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Logged In Securely
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your session preferences and saved reports will be synced locally.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold text-xs mb-2">
                  <Lock className="w-4 h-4" />
                  <span>Optional Session Account</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1.5">Sign in to PrivacyKit</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                  PrivacyKit is completely free with no subscriptions. Sign in only if you wish to label and save your local privacy reports across visits.
                </p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl clay-inset-search text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl clay-button-pro text-white font-bold text-sm transition-all cursor-pointer active:scale-98"
                  >
                    Sign In With Email
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Client-Side • No Subscriptions • Zero Paywalls</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
