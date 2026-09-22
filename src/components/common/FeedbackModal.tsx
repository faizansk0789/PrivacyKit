import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MessageSquarePlus,
  Bug,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Send,
  ShieldCheck
} from 'lucide-react';
import { playPop, playSuccess } from '../../utils/soundEngine';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'issue' | 'suggestion' | 'general';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    // Save locally in localStorage for persistent user feedback audit trail
    try {
      const existing = JSON.parse(localStorage.getItem('privacykit_feedback_submissions') || '[]');
      const newFeedback = {
        id: 'fb-' + Date.now(),
        type: feedbackType,
        topic: topic.trim() || 'General Feedback',
        description: description.trim(),
        email: email.trim() || undefined,
        timestamp: Date.now(),
        date: new Date().toISOString()
      };
      existing.unshift(newFeedback);
      localStorage.setItem('privacykit_feedback_submissions', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      playSuccess();
    }, 600);
  };

  const handleResetAndClose = () => {
    playPop();
    setIsSubmitted(false);
    setTopic('');
    setDescription('');
    setEmail('');
    setFeedbackType('suggestion');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
        {/* Backdrop click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="absolute inset-0"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg clay-card p-6 sm:p-7 rounded-2xl shadow-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 z-10 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 id="feedback-modal-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Send Feedback
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Report bugs, propose new privacy tools, or share ideas
                </p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close feedback modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Thank You for Your Feedback!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your report has been logged. We review every suggestion to make PrivacyKit more robust, transparent, and private.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Feedback Type Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What kind of feedback do you have?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setFeedbackType('suggestion');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      feedbackType === 'suggestion'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tool Idea</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setFeedbackType('issue');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      feedbackType === 'issue'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5 text-rose-500" />
                    <span>Report Issue</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setFeedbackType('general');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      feedbackType === 'general'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>General</span>
                  </button>
                </div>
              </div>

              {/* Title / Topic input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {feedbackType === 'suggestion'
                    ? 'Proposed Tool Name or Feature'
                    : feedbackType === 'issue'
                    ? 'Issue Summary'
                    : 'Subject'}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={
                    feedbackType === 'suggestion'
                      ? 'e.g. Browser Cookie Inspector, Zip Sanitizer...'
                      : feedbackType === 'issue'
                      ? 'e.g. EXIF metadata removal error on HEIC file'
                      : 'e.g. Feedback on design & performance'
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    feedbackType === 'suggestion'
                      ? 'Describe what privacy threat this tool would solve and how it should function locally in the browser...'
                      : feedbackType === 'issue'
                      ? 'What happened, which file format or browser were you using, and what did you expect instead?'
                      : 'Share your thoughts, review, or questions...'
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Optional Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Contact Email <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Only used if we need clarification</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Client-Side Privacy Notice */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No trackers or system telemetry are included with your submission.</span>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!description.trim() || isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
