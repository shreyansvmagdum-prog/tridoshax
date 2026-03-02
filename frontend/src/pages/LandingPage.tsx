import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Apple, Sparkles, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6">
                Discover Your <span className="text-primary">Prakriti</span> with AI
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                Experience the fusion of ancient Ayurvedic wisdom and modern artificial intelligence. 
                Get personalized wellness, diet, and Panchakarma recommendations tailored to your unique Dosha.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/assessment" className="btn-primary text-lg px-8 py-4 flex items-center justify-center">
                  Start Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Comprehensive Wellness Insights</h2>
            <p className="text-slate-500 mt-4">Our AI analyzes 25+ physiological and psychological parameters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "AI Prediction",
                desc: "Advanced machine learning models to predict Vata, Pitta, and Kapha dominance.",
                icon: ShieldCheck,
                color: "bg-emerald-50 text-emerald-600"
              },
              {
                title: "Personalized Diet",
                desc: "Customized nutritional plans based on your metabolic type and current imbalances.",
                icon: Apple,
                color: "bg-orange-50 text-orange-600"
              },
              {
                title: "Panchakarma Therapy",
                desc: "Scientific recommendations for detoxification and rejuvenation treatments.",
                icon: Sparkles,
                color: "bg-blue-50 text-blue-600"
              },
              {
                title: "Wellness Insights",
                desc: "Track your progress and understand your body's natural rhythms over time.",
                icon: Activity,
                color: "bg-purple-50 text-purple-600"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to balance your life?</h2>
          <p className="text-lg text-slate-600 mb-10">
            Join thousands of users who have transformed their health through AI-guided Ayurvedic wisdom.
          </p>
          <Link to="/assessment" className="btn-primary px-10 py-4 text-lg">
            Begin Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
};
