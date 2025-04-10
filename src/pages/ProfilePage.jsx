// import { useState, useEffect } from "react"
// import { Navigate } from "react-router-dom"
// import DashboardLayout from "../components/DashboardLayout"
// import { useAuth } from "../context/AuthContext"
// import api from "../services/api"
// import { Camera } from 'lucide-react'

// // Add this component for the profile image section
// const ProfileImageSection = ({ user, onImageChange }) => {
//   return (
//     <div className="relative mx-auto w-32 h-32 mb-8">
//       <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-800 shadow-lg">
//         {user?.profileImage ? (
//           <img
//             src={user.profileImage}
//             alt={user.name}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <img
//             src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
//             alt={user.name}
//             className="w-full h-full object-cover"
//           />
//         )}
//       </div>
//       <label
//         htmlFor="profile-image"
//         className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition-colors"
//       >
//         <Camera size={16} />
//         <input
//           type="file"
//           id="profile-image"
//           className="hidden"
//           accept="image/*"
//           onChange={onImageChange}
//         />
//       </label>
//     </div>
//   );
// };

// const ProfilePage = () => {
//   const { user, isAuthenticated } = useAuth()
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [profileImage, setProfileImage] = useState(null)
//   const [error, setError] = useState(null)
  
//   // Separate form data for candidates and interviewers
//   const [formData, setFormData] = useState(
//     user?.role === 'interviewer' 
//       ? {
//           expertise: user?.expertise?.join(', ') || '',
//           interviewLevels: user?.interviewLevels?.join(', ') || '',
//           department: user?.department || '',
//           bio: user?.bio || '',
//           phone: user?.phone || '',
//           location: user?.location || '',
//           github_url: user?.github_url || '',
//           linkedin_url: user?.linkedin_url || '',
//           website: user?.website || '',
//         }
//       : {
//           skills: user?.skills?.join(', ') || '',
//           experience: user?.experience || '',
//           field_of_interest: user?.field_of_interest || '',
//           expertise_level: user?.expertise_level || '',
//           bio: user?.bio || '',
//           phone: user?.phone || '',
//           location: user?.location || '',
//           github_url: user?.github_url || '',
//           linkedin_url: user?.linkedin_url || '',
//           website: user?.website || '',
//         }
//   )

//   const [resume, setResume] = useState(null)
//   const [message, setMessage] = useState({ type: "", text: "" })

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       // If you're using mock data temporarily
//       const mockProfile = {
//         // ... your mock profile data
//       };
//       setProfile(mockProfile);
      
//       // When you have the actual API:
//       // const response = await api.get('/profile');
//       // setProfile(response.data);
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//       setError('Failed to load profile. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       fetchProfile()
//     }
//   }, [user, isAuthenticated])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleResumeChange = (e) => {
//     setResume(e.target.files[0])
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setSaving(true)
//     setMessage({ type: "", text: "" })

//     try {
//       const formDataToSend = new FormData()

//       // Append all form fields
//       Object.keys(formData).forEach((key) => {
//         formDataToSend.append(key, formData[key])
//       })

//       // Append resume if selected (only for candidates)
//       if (user?.role === 'candidate' && resume) {
//         formDataToSend.append("resume", resume)
//       }

//       // Use different endpoints based on user role
//       const endpoint = user?.role === 'interviewer' 
//         ? '/interviewer/profile' 
//         : '/candidate/profile';

//       const response = await api.post(endpoint, formDataToSend, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })

//       setProfile(response.data.profile)
//       setMessage({ type: "success", text: "Profile updated successfully!" })
//     } catch (error) {
//       console.error("Error updating profile:", error)
//       setMessage({ type: "error", text: "Failed to update profile. Please try again." })
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Add this function to handle profile image changes
//   const handleProfileImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       try {
//         setLoading(true);
//         const formData = new FormData();
//         formData.append('profileImage', file);

//         const endpoint = user?.role === 'interviewer' 
//           ? '/interviewer/profile/image' 
//           : '/candidate/profile/image';

//         const response = await api.post(endpoint, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });

//         // Update the user profile image
//         setProfile(prev => ({
//           ...prev,
//           profileImage: response.data.profileImage
//         }));

//         setMessage({ type: 'success', text: 'Profile image updated successfully!' });
//       } catch (error) {
//         console.error('Error updating profile image:', error);
//         setMessage({ type: 'error', text: 'Failed to update profile image.' });
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   // Redirect if not authenticated
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <DashboardLayout>
//       <div className="max-w-4xl mx-auto">
//         {/* <h1 className="text-3xl font-bold   text-gray-900 dark:text-white mb-6">Profile</h1> */}

//         {loading ? (
//           <div className="flex justify-center py-8">
//             <svg
//               className="animate-spin h-8 w-8 text-indigo-600"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               ></path>
//             </svg>
//           </div>
//         ) : (
//           <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
//             {/* Profile Header with Image */}
//             <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700 text-center">
//               {/* <ProfileImageSection 
//                 user={user} 
//                 onImageChange={handleProfileImageChange} 
//               /> */}
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//                 {user?.name}
//               </h2>
//               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//                 {user?.role === 'interviewer' ? 'Interviewer' : 'Candidate'}
//               </p>
//               {user?.role === 'interviewer' && (
//                 <div className="mt-2">
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
//                     {user?.department || 'Department'}
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Rest of the profile form */}
//             {message.text && (
//               <div
//                 className={`px-6 py-4 ${
//                   message.type === "success" 
//                     ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
//                     : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
//                 }`}
//               >
//                 {message.text}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="p-6 space-y-6">
//               {/* Basic Information */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     value={user?.name}
//                     disabled
//                     className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     value={user?.email}
//                     disabled
//                     className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
//                   />
//                 </div>

//                 {/* Common fields */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Location
//                   </label>
//                   <input
//                     type="text"
//                     name="location"
//                     value={formData.location}
//                     onChange={handleChange}
//                     className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                   />
//                 </div>
//               </div>

//               {/* Role-specific fields */}
//               {user?.role === 'interviewer' ? (
//                 // Interviewer specific fields
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Professional Information</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Areas of Expertise
//                       </label>
//                       <input
//                         type="text"
//                         name="expertise"
//                         value={formData.expertise}
//                         onChange={handleChange}
//                         className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Interview Levels
//                       </label>
//                       <input
//                         type="text"
//                         name="interviewLevels"
//                         value={formData.interviewLevels}
//                         onChange={handleChange}
//                         className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Department
//                       </label>
//                       <input
//                         type="text"
//                         name="department"
//                         value={formData.department}
//                         onChange={handleChange}
//                         className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 // Candidate specific fields
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Professional Information</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Skills
//                       </label>
//                       <input
//                         type="text"
//                         name="skills"
//                         value={formData.skills}
//                         onChange={handleChange}
//                         className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Field of Interest
//                       </label>
//                       <select
//                         name="field_of_interest"
//                         value={formData.field_of_interest}
//                         onChange={handleChange}
//                         className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                       >
//                         <option value="">Select a field</option>
//                         <option value="Frontend Development">Frontend Development</option>
//                         <option value="Backend Engineering">Backend Engineering</option>
//                         <option value="Full Stack Development">Full Stack Development</option>
//                         <option value="Mobile Development">Mobile Development</option>
//                         <option value="DevOps">DevOps</option>
//                         <option value="Data Science">Data Science</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Experience Level
//                       </label>
//                       <select
//                         name="expertise_level"
//                         value={formData.expertise_level}
//                         onChange={handleChange}
//                         className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                       >
//                         <option value="">Select level</option>
//                         <option value="entry">Entry Level</option>
//                         <option value="junior">Junior</option>
//                         <option value="mid">Mid Level</option>
//                         <option value="senior">Senior</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Years of Experience
//                       </label>
//                       <input
//                         type="text"
//                         name="experience"
//                         value={formData.experience}
//                         onChange={handleChange}
//                         className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                       />
//                     </div>
//                   </div>

//                   {/* Resume upload - only for candidates */}
//                   <div className="mt-6">
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                       Resume
//                     </label>
//                     <input
//                       type="file"
//                       onChange={handleResumeChange}
//                       accept=".pdf,.doc,.docx"
//                       className="block w-full text-sm text-gray-500 dark:text-gray-400
//                         file:mr-4 file:py-2 file:px-4
//                         file:rounded-md file:border-0
//                         file:text-sm file:font-medium
//                         file:bg-indigo-50 file:text-indigo-700
//                         hover:file:bg-indigo-100"
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Common social profiles section */}
//               <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
//                 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Social Profiles</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label
//                       htmlFor="github_url"
//                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                     >
//                       GitHub URL
//                     </label>
//                     <input
//                       type="url"
//                       id="github_url"
//                       name="github_url"
//                       value={formData.github_url}
//                       onChange={handleChange}
//                       placeholder="https://github.com/username"
//                       className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                     />
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="linkedin_url"
//                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                     >
//                       LinkedIn URL
//                     </label>
//                     <input
//                       type="url"
//                       id="linkedin_url"
//                       name="linkedin_url"
//                       value={formData.linkedin_url}
//                       onChange={handleChange}
//                       placeholder="https://linkedin.com/in/username"
//                       className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                     />
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="website"
//                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                     >
//                       Personal Website
//                     </label>
//                     <input
//                       type="url"
//                       id="website"
//                       name="website"
//                       value={formData.website}
//                       onChange={handleChange}
//                       placeholder="https://yourwebsite.com"
//                       className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//                 >
//                   {saving ? "Saving..." : "Save Changes"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   )
// }

// export default ProfilePage

import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
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
          <div className="flex justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700 text-center">
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
            </div>

            {message.text && (
              <div
                className={`px-6 py-4 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message.text}
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
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
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
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
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
                      
                <div className="flex justify-end">  

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"   
                  >
                    {saving ? "Saving..." : "Save"}
                  </button> 
                </div>
              </form>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default ProfilePage;   

