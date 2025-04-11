import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Camera, X } from "lucide-react";

// Profile Image Section Component
const ProfileImageSection = ({ user, onImageChange }) => {
  return (
    <div className="relative mx-auto w-32 h-32 mb-8">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-800 shadow-lg">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <label
        htmlFor="profile-image"
        className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition-colors"
      >
        <Camera size={16} />
        <input
          type="file"
          id="profile-image"
          className="hidden"
          accept="image/*"
          onChange={onImageChange}
        />
      </label>
    </div>
  );
};

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(null);

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
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // If you're using mock data temporarily
      const mockProfile = {
        // ... your mock profile data
      };
      setProfile(mockProfile);

      // When you have the actual API:
      // const response = await api.get('/profile');
      // setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [user, isAuthenticated]);

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

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Append resume if selected (only for candidates)
      if (user?.role === "candidate" && resume) {
        formDataToSend.append("resume", resume);
      }

      // Use different endpoints based on user role
      const endpoint =
        user?.role === "interviewer" ? "/interviewer/profile" : "/candidate/profile";

      const response = await api.post(endpoint, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(response.data.profile);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("profileImage", file);

        const endpoint =
          user?.role === "interviewer" ? "/interviewer/profile/image" : "/candidate/profile/image";

        const response = await api.post(endpoint, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Update the user profile image
        setProfile((prev) => ({
          ...prev,
          profileImage: response.data.profileImage,
        }));

        setMessage({ type: "success", text: "Profile image updated successfully!" });
      } catch (error) {
        console.error("Error updating profile image:", error);
        setMessage({ type: "error", text: "Failed to update profile image." });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900"></div>
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
            </div>
            <p className="text-indigo-600 dark:text-indigo-400 animate-pulse">Loading profile...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-6 py-8 border-b border-gray-200 dark:border-gray-700 text-center">
              <ProfileImageSection user={user} onImageChange={handleProfileImageChange} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {user?.role === "interviewer" ? "Interviewer" : "Candidate"}
              </p>
              {user?.role === "interviewer" && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {user?.department || "Department"}
                  </span>
                </div>
              )}
            </motion.div>

            {message.text && (
              <div
                className={`px-6 py-4 flex items-center gap-3 animate-fadeIn ${{
                  success: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-l-4 border-green-500",
                  error: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-l-4 border-red-500",
                }[message.type]}`}
              >
                {message.type === "success" ? (
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <p className="flex-1">{message.text}</p>
                <button 
                  onClick={() => setMessage({ type: "", text: "" })} 
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.name}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    placeholder="Enter 10-digit phone number"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-500"
                    required
                    onInvalid={(e) => e.target.setCustomValidity('Please enter a valid 10-digit phone number')}
                    onInput={(e) => e.target.setCustomValidity('')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-500"
                    required
                    minLength={2}
                    maxLength={100}
                    onInvalid={(e) => e.target.setCustomValidity('Please enter your location (City, Country)')}
                    onInput={(e) => e.target.setCustomValidity('')}
                  />
                </div>
              </div>

              {user?.role === "interviewer" ? (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Areas of Expertise
                      </label>
                      <input
                        type="text"
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Interview Levels
                      </label>
                      <input
                        type="text"
                        name="interviewLevels"
                        value={formData.interviewLevels}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Skills
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Field of Interest
                      </label>
                      <select
                        name="field_of_interest"
                        value={formData.field_of_interest}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select a field</option>
                        <option value="Frontend Development">Frontend Development</option>
                        <option value="Backend Engineering">Backend Engineering</option>
                        <option value="Full Stack Development">Full Stack Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Data Science">Data Science</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Experience Level
                      </label>
                      <select
                        name="expertise_level"
                        value={formData.expertise_level}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select level</option>
                        <option value="entry">Entry Level</option>
                        <option value="junior">Junior</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resume
                    </label>
                    <input
                      type="file"
                      onChange={handleResumeChange}
                      accept=".pdf,.doc,.docx"
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Social Profiles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="github_url"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      id="github_url"
                      name="github_url"
                      value={formData.github_url}
                        onChange={handleChange}
                      
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"                      
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400"> 
                      (https://github.com/username)</span>
                    </div>      

                    <div> 
                      <label
                        htmlFor="linkedin_url"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        id="linkedin_url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleChange}     
                      
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"    
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400"> 
                      (https://www.linkedin.com/in/username)</span>
                    </div>    

                    <div>
                      <label      
                        htmlFor="twitter_url" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Twitter URL
                      </label>
                      <input  
                      type="url"
                        id="twitter_url"
                        name="twitter_url"
                        value={formData.twitter_url}    
                      
                        onChange={handleChange} 
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"   
                      />  
                      <span className="text-xs text-gray-500 dark:text-gray-400"> 
                        (https://twitter.com/username)</span>   
                    </div>
                  </div>
                </div>
                      
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => window.history.back()}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>Save Changes</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;   

