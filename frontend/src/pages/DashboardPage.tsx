import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DOSHA_INFO } from '../constants';
import { Dosha } from '../types';
import { AlertCircle, CheckCircle, Info, Utensils, Sparkles, Heart } from 'lucide-react';

export const DashboardPage = () => {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lastAssessment');
    if (saved) {
      setResult(JSON.parse(saved));
    } else {
      // Mock result if none found
      setResult({
        scores: { Vata: 40, Pitta: 35, Kapha: 25 }
      });
    }
  }, []);

  if (!result) return null;

  const scores = result.scores;
  const dominantDosha = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as Dosha;
  const info = DOSHA_INFO[dominantDosha];

  const chartData = [
    { name: 'Vata', value: scores.Vata, color: '#818CF8' },
    { name: 'Pitta', value: scores.Pitta, color: '#F87171' },
    { name: 'Kapha', value: scores.Kapha, color: '#34D399' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Wellness Dashboard</h1>
        <p className="text-slate-500">Comprehensive analysis based on your unique Prakriti</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dominant Dosha Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-8 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
              Dominant Dosha
            </div>
            <h2 className="text-5xl font-black text-primary mb-4">{dominantDosha}</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              {info.description}
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Info className="h-4 w-4" />
              Confidence Level: {scores[dominantDosha]}%
            </div>
          </div>
        </motion.div>

        {/* Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
            Disease Susceptibility
          </h3>
          <div className="space-y-4">
            {[
              { label: "Digestive Issues", risk: dominantDosha === 'Vata' ? 'High' : 'Low' },
              { label: "Inflammation", risk: dominantDosha === 'Pitta' ? 'High' : 'Medium' },
              { label: "Respiratory Congestion", risk: dominantDosha === 'Kapha' ? 'High' : 'Low' },
              { label: "Stress & Anxiety", risk: dominantDosha === 'Vata' ? 'High' : 'Medium' }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                <span className="text-slate-700 font-medium">{item.label}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  item.risk === 'High' ? 'bg-red-100 text-red-600' : 
                  item.risk === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                }`}>
                  {item.risk}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Diet Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Utensils className="mr-2 h-5 w-5 text-primary" />
            Dietary Recommendations
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Foods to Include</h4>
              <ul className="space-y-2">
                {info.diet.include.map((item, idx) => (
                  <li key={idx} className="flex items-start text-slate-600 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3">Foods to Avoid</h4>
              <ul className="space-y-2">
                {info.diet.avoid.map((item, idx) => (
                  <li key={idx} className="flex items-start text-slate-600 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Panchakarma */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-blue-500" />
            Panchakarma Therapy
          </h3>
          <div className="space-y-4">
            {info.panchakarma.map((therapy, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <p className="font-bold text-blue-900">{therapy}</p>
                <p className="text-xs text-blue-700 mt-1">Recommended for balancing {dominantDosha} imbalances.</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lifestyle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Heart className="mr-2 h-5 w-5 text-rose-500" />
            Lifestyle Advice
          </h3>
          <ul className="space-y-4">
            {info.lifestyle.map((advice, idx) => (
              <li key={idx} className="flex items-center p-3 rounded-lg bg-rose-50/50 border border-rose-100">
                <div className="w-2 h-2 rounded-full bg-rose-400 mr-3" />
                <span className="text-slate-700 text-sm font-medium">{advice}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};
