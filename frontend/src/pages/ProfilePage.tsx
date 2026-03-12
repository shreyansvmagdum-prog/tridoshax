import React from "react";
import { motion } from "motion/react";
import {
  Calendar,
  ChevronRight,
  User,
  Settings,
  Edit3
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getCurrentUser,
  getAssessmentHistory,
  updateProfile
} from "../services/api";

export const ProfilePage = () => {
  const [user, setUser] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // ⭐ Edit Mode State
  const [isEditing, setIsEditing] = React.useState(false);

  // ⭐ Form State
  const [form, setForm] = React.useState({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: ""
  });

  // 🔥 Fetch profile data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser();
        const u = userData.user || userData;

        setUser(u);

        // Prefill form
        setForm({
          age: u.age || "",
          gender: u.gender || "",
          height_cm: u.height_cm || "",
          weight_kg: u.weight_kg || ""
        });

        const historyData = await getAssessmentHistory();
        setHistory(historyData.history || []);
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ⭐ Handle form input
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ⭐ Save profile
  const handleSave = async () => {
    try {
      const updated = await updateProfile({
        age: Number(form.age),
        gender: form.gender,
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg)
      });

      // ⭐ Merge instead of replace
      setUser(prev => ({
        ...prev,
        ...(updated.user || updated)
      }));

      setIsEditing(false);

      alert("Profile updated successfully ✅");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ================= USER INFO ================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 text-center relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                <User className="h-16 w-16 text-primary" />
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border text-primary hover:bg-primary hover:text-white transition-all"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>

            {/* Name & Email */}
            <h2 className="text-2xl font-black text-slate-900">
              {user?.name || "User"}
            </h2>

            <p className="text-slate-500 font-medium">
              {user?.email || "email@example.com"}
            </p>

            {/* ================= EDIT MODE ================= */}
            {isEditing ? (
              <div className="mt-6 space-y-4 text-left">

                <input
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <input
                  name="height_cm"
                  type="number"
                  placeholder="Height (cm)"
                  value={form.height_cm}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />

                <input
                  name="weight_kg"
                  type="number"
                  placeholder="Weight (kg)"
                  value={form.weight_kg}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    className="btn-primary w-full py-2"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary w-full py-2"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            ) : (
              <>
                {/* ================= VIEW MODE ================= */}

                <div className="mt-6 text-left space-y-2 text-sm">
                  <p><b>Age:</b> {user?.age ?? "-"}</p>
                  <p><b>Gender:</b> {user?.gender ?? "-"}</p>
                  <p><b>Height:</b> {user?.height_cm ?? "-"} cm</p>
                  <p><b>Weight:</b> {user?.weight_kg ?? "-"} kg</p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 text-left">
                    <div className="text-xs font-black text-slate-400 uppercase mb-1">
                      Account Type
                    </div>
                    <div className="text-sm font-bold text-primary">
                      Premium Member
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 text-left">
                    <div className="text-xs font-black text-slate-400 uppercase mb-1">
                      Assessments
                    </div>
                    <div className="text-sm font-bold text-slate-700">
                      {history.length} Total
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= HISTORY ================= */}
        <div className="lg:col-span-8">
          <div className="glass-card p-8">

            <h3 className="text-2xl font-black text-slate-900 mb-8">
              Assessment History
            </h3>

            {history.length === 0 ? (
              <p className="text-slate-500 text-center py-10">
                No assessments yet
              </p>
            ) : (
              <div className="space-y-6">

                {history.map((item, idx) => (
                  <motion.div
                    key={item.assessment_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to="/dashboard"
                      state={{ assessment: item }}
                      className="block p-6 rounded-2xl border bg-white hover:border-primary/30 transition-all"
                    >
                      <div className="flex justify-between items-center">

                        <div>
                          <div className="text-xs text-slate-400">
                            {new Date(item.date).toLocaleDateString()}
                          </div>

                          <div className="text-xl font-bold">
                            Dominant:{" "}
                            <span className="text-primary">
                              {item.primary_dosha}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-400">
                            Confidence
                          </div>
                          <div className="font-bold">
                            {Math.round(item.confidence)}%
                          </div>
                        </div>

                      </div>
                    </Link>
                  </motion.div>
                ))}

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};