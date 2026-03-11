import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

interface AuthPageProps {
  type: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (type === 'login') {
        const res = await loginUser(email, password);

        // ⭐ Save JWT
        localStorage.setItem("token", res.access_token);

        navigate("/dashboard");
      } else {
        await registerUser(name, email, password);

        alert("Account created successfully. Please login.");
        navigate("/login");
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4">
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
            {type === 'login'
              ? "Don't have an account?"
              : "Already have an account?"}{' '}
            <Link
              to={type === 'login' ? '/register' : '/login'}
              className="font-medium text-primary underline"
            >
              {type === 'login' ? 'Register here' : 'Login here'}
            </Link>
          </p>
        </div>

        {/* IMPORTANT */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">

            {type === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  required
                  placeholder="Full Name"
                  className="block w-full pl-10 py-3 border rounded-xl"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Email Address"
                className="block w-full pl-10 py-3 border rounded-xl"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="Password"
                className="block w-full pl-10 py-3 border rounded-xl"
              />
            </div>

            {type === 'login' && (
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-bold text-primary">
                  Forgot Password?
                </Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg"
          >
            {loading
              ? "Please wait..."
              : type === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};