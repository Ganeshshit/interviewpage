import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Briefcase, MapPin, Phone, Mail, Github, Linkedin, Globe } from "lucide-react";

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState(
    user?.role === "interviewer"
      ? {
          expertise: user?.expertise?.join(", ") || "",
          interviewLevels: user?.interviewLevels?.join(", ") || "",
          department: user?.department || "",
          bio: user?.bio || "",
          phone: user?.phone || "",
          location: user?.location || "",
          github_url: user?.github_url || "",
          linkedin_url: user?.linkedin_url || "",
          website: user?.website || "",
        }
      : {
          skills: user?.skills?.join(", ") || "",
          experience: user?.experience || "",
          field_of_interest: user?.field_of_interest || "",
          expertise_level: user?.expertise_level || "",
          bio: user?.bio || "",
          phone: user?.phone || "",
          location: user?.location || "",
          github_url: user?.github_url || "",
          linkedin_url: user?.linkedin_url || "",
          website: user?.website || "",
        }
  );

  const [resume, setResume] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [user, isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const mockProfile = {};
      setProfile(mockProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (user?.role === "candidate" && resume) {
        formDataToSend.append("resume", resume);
      }

      const endpoint = user?.role === "interviewer" ? "/interviewer/profile" : "/candidate/profile";
      const response = await api.post(endpoint, formDataToSend);

      setProfile(response.data.profile);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-24 h-24">
              <div className="absolute top-0 left-0 w-full h-full border-8 border-indigo-200 rounded-full animate-ping"></div>
              <div className="absolute top-0 left-0 w-full h-full border-8 border-indigo-500 rounded-full animate-pulse"></div>
            </div>
            <p className="mt-4 text-indigo-600 font-medium">Loading your profile...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Section */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-8 text-white shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold">{user?.name}</h1>
                  <p className="mt-2 text-indigo-100 flex items-center gap-2">
                    <Briefcase size={16} />
                    {user?.role === "interviewer" ? "Technical Interviewer" : "Candidate"}
                  </p>
                  {user?.department && (
                    <p className="mt-1 text-indigo-100 flex items-center gap-2">
                      <MapPin size={16} />
                      {user?.department}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Message Alert */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                  : "bg-red-50 text-red-700 border-l-4 border-red-500"
              }`}
            >
              {message.text}
            </motion.div>

            {/* Form Section */}
            <motion.form 
              variants={containerVariants}
              onSubmit={handleSubmit} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-8 space-y-8">
                {/* Contact Information */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Phone size={16} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Mail size={16} />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Professional Information */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Professional Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user?.role === "interviewer" ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Areas of Expertise
                          </label>
                          <input
                            type="text"
                            name="expertise"
                            value={formData.expertise}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Interview Levels
                          </label>
                          <input
                            type="text"
                            name="interviewLevels"
                            value={formData.interviewLevels}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Skills
                          </label>
                          <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Experience Level
                          </label>
                          <select
                            name="expertise_level"
                            value={formData.expertise_level}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          >
                            <option value="">Select level</option>
                            <option value="entry">Entry Level</option>
                            <option value="junior">Junior</option>
                            <option value="mid">Mid Level</option>
                            <option value="senior">Senior</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Social Links */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Social Links
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Github size={16} />
                        GitHub Profile
                      </label>
                      <input
                        type="url"
                        name="github_url"
                        value={formData.github_url}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Linkedin size={16} />
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div 
                  variants={itemVariants}
                  className="flex justify-end gap-4 pt-6"
                >
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </motion.div>
              </div>
            </motion.form>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;
