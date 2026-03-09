import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, User, Settings, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const history = [
    { id: '1', date: '2026-03-09', dosha: 'Vata', confidence: 45 },
    { id: '2', date: '2026-02-28', dosha: 'Vata', confidence: 40 },
    { id: '3', date: '2025-11-15', dosha: 'Vata', confidence: 38 },
    { id: '4', date: '2025-08-20', dosha: 'Pitta', confidence: 42 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                <User className="h-16 w-16 text-primary" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 text-primary hover:bg-primary hover:text-white transition-all">
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Shreyans Magdum</h2>
            <p className="text-slate-500 font-medium">shreyansvmagdum@gmail.com</p>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 text-left">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Type</div>
                <div className="text-sm font-bold text-primary">Premium Member</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 text-left">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assessments</div>
                <div className="text-sm font-bold text-slate-700">{history.length} Total</div>
              </div>
            </div>

            <button className="w-full mt-8 btn-secondary py-3 flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile Settings
            </button>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Most Frequent Dosha</span>
                <span className="text-sm font-bold text-primary">Vata</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Last Assessment</span>
                <span className="text-sm font-bold text-slate-700">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment History */}
        <div className="lg:col-span-8">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900">Assessment History</h3>
              <button className="text-sm font-bold text-primary hover:underline">View All</button>
            </div>
            
            <div className="relative space-y-6 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {history.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-14 group"
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-primary z-10 group-hover:scale-125 transition-transform" />
                  
                  <Link 
                    to="/dashboard" 
                    className="block p-6 rounded-2xl border border-slate-100 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-xl font-black text-slate-900">
                            Dominant: <span className="text-primary">{item.dosha}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-8">
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</div>
                          <div className="text-lg font-black text-slate-800">{item.confidence}%</div>
                        </div>
                        <div className="p-2 rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
