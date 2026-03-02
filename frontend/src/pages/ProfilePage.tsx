import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, User, Mail, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const history = [
    { id: '1', date: '2026-02-28', dosha: 'Vata', confidence: 40 },
    { id: '2', date: '2025-11-15', dosha: 'Vata', confidence: 38 },
    { id: '3', date: '2025-08-20', dosha: 'Pitta', confidence: 42 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-8 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Shreyans Magdum</h2>
            <p className="text-slate-500 text-sm">shreyansvmagdum@gmail.com</p>
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center text-sm text-slate-600">
                <Mail className="h-4 w-4 mr-2" />
                Verified Account
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Shield className="h-4 w-4 mr-2" />
                Premium Member
              </div>
            </div>
          </div>
        </div>

        {/* Assessment History */}
        <div className="md:col-span-2">
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Assessment History</h3>
            <div className="space-y-4">
              {history.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                      <Calendar className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-medium">{item.date}</p>
                      <p className="text-lg font-bold text-slate-900">Result: <span className="text-primary">{item.dosha}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Confidence</p>
                      <p className="text-sm font-bold text-slate-700">{item.confidence}%</p>
                    </div>
                    <Link 
                      to="/dashboard" 
                      className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:text-primary group-hover:border-primary transition-all"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
