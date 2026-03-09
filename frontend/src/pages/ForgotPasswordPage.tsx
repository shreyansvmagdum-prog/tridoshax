import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 glass-card p-10"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Leaf className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-primary">TriDoshaX</span>
          </Link>
          <h2 className="text-3xl font-black text-slate-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            We'll send you a link to reset your password.
          </p>
        </div>

        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Email Address"
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-4 text-lg">
              Send Reset Link
            </button>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
              <p className="text-slate-500 text-sm">
                We've sent a password reset link to <span className="font-bold text-slate-700">{email}</span>.
              </p>
            </div>
            <Link to="/login" className="block w-full btn-secondary py-4 text-lg">
              Return to Login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
