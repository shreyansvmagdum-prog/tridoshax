import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Lock, User } from 'lucide-react';

interface AuthPageProps {
  type: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
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
          <h2 className="text-3xl font-extrabold text-slate-900">
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link
              to={type === 'login' ? '/register' : '/login'}
              className="font-medium text-primary hover:text-primary-light underline"
            >
              {type === 'login' ? 'Register here' : 'Login here'}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            {type === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Full Name"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Email Address"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button type="submit" className="w-full btn-primary py-4 text-lg">
              {type === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
