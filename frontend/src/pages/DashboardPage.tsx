import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DOSHA_INFO } from '../constants';
import { Dosha } from '../types';
import { AlertCircle, CheckCircle, Info, Utensils, Sparkles, Heart } from 'lucide-react';
import { getLatestResult } from '../services/api';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { downloadReport } from "../services/api";

export const DashboardPage = () => {
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    const selectedAssessment = location.state?.assessment;

    // ⭐ If user came from history
    if (selectedAssessment) {

      const formatted = {
        assessment_id: selectedAssessment.assessment_id,
        scores: {
          Vata: selectedAssessment.vata_score,
          Pitta: selectedAssessment.pitta_score,
          Kapha: selectedAssessment.kapha_score
        },
        primary: selectedAssessment.primary_dosha,
        secondary: selectedAssessment.secondary_dosha,
        confidence: selectedAssessment.confidence
      };

      setResult(formatted);
      return;
    }

    // ⭐ Otherwise load latest result
    const fetchDashboard = async () => {
      try {
        const data = await getLatestResult();
        const d = data.dosha;

        const formatted = {
          assessment_id: d.assessment_id,
          scores: {
            Vata: d.vata_score,
            Pitta: d.pitta_score,
            Kapha: d.kapha_score
          },
          primary: d.primary,
          secondary: d.secondary,
          confidence: d.confidence
        };

        setResult(formatted);

      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      }
    };

    fetchDashboard();

  }, [location.state]);

  if (!result) return null;

  const scores = result.scores;
  const dominantDosha = result.primary as Dosha;
  const secondaryDosha = result.secondary as Dosha;
  const confidence = result.confidence;

  const info = DOSHA_INFO[dominantDosha];

  const chartData = [
    { name: 'Vata', value: scores.Vata, color: '#818CF8' },
    { name: 'Pitta', value: scores.Pitta, color: '#F87171' },
    { name: 'Kapha', value: scores.Kapha, color: '#34D399' },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-600 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-green-100 text-green-600 border-green-200';
    }
  };

  const handleDownload = async () => {

    if (!result?.assessment_id) {
      alert("Report not ready yet");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/assessment/report/${result.assessment_id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Error:", text);
        alert("Download failed");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `TriDoshaX_Report_${result.assessment_id}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert("Download failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Wellness Dashboard</h1>
          <p className="text-slate-500">Personalized analysis of your Ayurvedic constitution</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            //disabled={!result?.assessment_id}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
          >
            Download Report
          </button>
          <button
            onClick={() => navigate("/assessment")}
            className="btn-primary py-2 px-4 text-sm"
          >
            Retake Test
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Dosha Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 glass-card overflow-hidden"
        >
          <div className="bg-primary p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-white/90 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur shadow">
                  Primary Constitution
                </span>
                <h2 className="text-6xl font-black mt-4">{dominantDosha}</h2>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{confidence}%</div>
                <div className="text-xs opacity-80 font-bold uppercase">Confidence</div>
              </div>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Secondary Dosha</h3>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-slate-800">{secondaryDosha}</div>
                <div className="text-slate-400 font-bold">{scores[secondaryDosha]}%</div>
              </div>
              <p className="mt-6 text-slate-600 leading-relaxed">
                {info.description}
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Disease Susceptibility Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 glass-card p-8"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
            Disease Susceptibility
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Digestive Issues", risk: dominantDosha === 'Vata' ? 'High' : 'Low' },
              { label: "Inflammation", risk: dominantDosha === 'Pitta' ? 'High' : 'Medium' },
              { label: "Respiratory Congestion", risk: dominantDosha === 'Kapha' ? 'High' : 'Low' },
              { label: "Stress & Anxiety", risk: dominantDosha === 'Vata' ? 'High' : 'Medium' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-700 font-bold">{item.label}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getRiskColor(item.risk)}`}>
                    {item.risk}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.risk === 'High' ? 'bg-red-500 w-full' :
                    item.risk === 'Medium' ? 'bg-orange-500 w-2/3' : 'bg-green-500 w-1/3'
                    }`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations Section */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Diet Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Utensils className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Dietary Recommendations</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">Include</h4>
                <ul className="space-y-2">
                  {info.diet.include.slice(0, 4).map((item, idx) => (
                    <li key={idx} className="flex items-start text-slate-600 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-3">Avoid</h4>
                <ul className="space-y-2">
                  {info.diet.avoid.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start text-slate-600 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Lifestyle Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Lifestyle Advice</h3>
            <div className="space-y-4">
              {info.lifestyle.map((advice, idx) => (
                <div key={idx} className="flex items-center p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50">
                  <div className="w-2 h-2 rounded-full bg-rose-400 mr-4" />
                  <span className="text-slate-700 text-sm font-bold">{advice}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Panchakarma Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Panchakarma Therapy</h3>
            <div className="space-y-4">
              {info.panchakarma.map((therapy, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-blue-100 bg-blue-50/50">
                  <p className="font-black text-blue-900 text-lg">{therapy}</p>
                  <p className="text-xs text-blue-700 mt-2 font-medium">Targeted detoxification for {dominantDosha} balance.</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
