// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import DashboardLayout from "../components/DashboardLayout"
// import api from "../services/api"

// const SchedulePage = () => {
//   const navigate = useNavigate()
//   const [field, setField] = useState("")
//   const [level, setLevel] = useState("")
//   const [title, setTitle] = useState("")
//   const [notes, setNotes] = useState("")
//   const [availableSlots, setAvailableSlots] = useState([])
//   const [selectedSlot, setSelectedSlot] = useState(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [isLoadingSlots, setIsLoadingSlots] = useState(false)
//   const [errors, setErrors] = useState({})

//   // Fetch available slots when field or level changes
//   useEffect(() => {
//     if (field && level) {
//       fetchAvailableSlots()
//     } else {
//       setAvailableSlots([])
//     }
//   }, [field, level])

//   const fetchAvailableSlots = async () => {
//     setIsLoadingSlots(true)
//     try {
//       // In a real app, this would fetch all available slots based on field and level
//       const response = await api.get(`/availability?field=${field}&level=${level}`)
//       setAvailableSlots(response.data.availability || [])
//     } catch (error) {
//       console.error("Error fetching available slots:", error)
//       setAvailableSlots([])
//     } finally {
//       setIsLoadingSlots(false)
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     // Validate form
//     const newErrors = {}
//     if (!selectedSlot) newErrors.slot = "Time slot is required"
//     if (!field) newErrors.field = "Field is required"
//     if (!level) newErrors.level = "Level is required"
//     if (!title) newErrors.title = "Title is required"

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors)
//       return
//     }

//     setIsLoading(true)

//     try {
//       // Create interview using the selected availability slot
//       await api.post("/interviews", {
//         availability_id: selectedSlot.id,
//         field,
//         level,
//         title,
//         notes,
//       })

//       navigate("/dashboard")
//     } catch (error) {
//       console.error("Scheduling failed:", error)
//       setErrors({ form: "Failed to schedule interview. Please try again." })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Group slots by date for better organization
//   const slotsByDate = availableSlots.reduce((acc, slot) => {
//     const date = slot.date || "Unknown Date"
//     if (!acc[date]) {
//       acc[date] = []
//     }
//     acc[date].push(slot)
//     return acc
//   }, {})

//   return (
//     <DashboardLayout>
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Schedule an Interview</h1>

//         <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//             <h2 className="text-xl font-medium text-gray-900 dark:text-white">Interview Details</h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Select your preferred field and expertise level to see available time slots.
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="p-6 space-y-6">
//             <div className="space-y-2">
//               <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Interview Title
//               </label>
//               <input
//                 type="text"
//                 id="title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="e.g. Frontend Developer Interview"
//                 className={`block w-full px-3 py-2 border ${
//                   errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                 } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
//               />
//               {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="field" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Field of Interest
//               </label>
//               <select
//                 id="field"
//                 value={field}
//                 onChange={(e) => setField(e.target.value)}
//                 className={`block w-full px-3 py-2 border ${
//                   errors.field ? "border-red-500" : "border-gray-300 dark:border-gray-600"
//                 } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
//               >
//                 <option value="">Select field</option>
//                 <option value="frontend">Frontend Development</option>
//                 <option value="backend">Backend Engineering</option>
//                 <option value="fullstack">Full Stack Development</option>
//                 <option value="data">Data Science</option>
//                 <option value="devops">DevOps</option>
//               </select>
//               {errors.field && <p className="text-sm text-red-500">{errors.field}</p>}
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expertise Level</label>
//               <div className="grid grid-cols-2 gap-4">
//                 {["entry", "junior", "mid", "senior"].map((levelOption) => (
//                   <div key={levelOption} className="flex items-center space-x-2 rounded-md border p-3">
//                     <input
//                       type="radio"
//                       id={levelOption}
//                       name="level"
//                       value={levelOption}
//                       checked={level === levelOption}
//                       onChange={() => setLevel(levelOption)}
//                       className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
//                     />
//                     <label htmlFor={levelOption} className="cursor-pointer text-sm text-gray-700 dark:text-gray-300">
//                       {levelOption.charAt(0).toUpperCase() + levelOption.slice(1)}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//               {errors.level && <p className="text-sm text-red-500">{errors.level}</p>}
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Available Time Slots</label>

//               {isLoadingSlots ? (
//                 <div className="flex justify-center py-4">
//                   <svg
//                     className="animate-spin h-5 w-5 text-indigo-600"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                 </div>
//               ) : field && level && Object.keys(slotsByDate).length === 0 ? (
//                 <div className="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-md">
//                   <p className="text-gray-500 dark:text-gray-400">No available slots for this field and expertise level</p>
//                 </div>
//               ) : field && level ? (
//                 <div className="space-y-4">
//                   {Object.entries(slotsByDate).map(([date, slots]) => (
//                     <div key={date} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
//                       <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
//                         <h3 className="font-medium text-gray-900 dark:text-white">{date.split('T')[0]}</h3>
//                       </div>
//                       <div className="divide-y divide-gray-200 dark:divide-gray-700">
//                         {slots.map((slot) => (
//                           <div
//                             key={slot.id}
//                             onClick={() => setSelectedSlot(slot)}
//                             className={`p-3 cursor-pointer ${
//                               selectedSlot?.id === slot.id
//                                 ? "bg-indigo-50 dark:bg-indigo-900/20"
//                                 : "hover:bg-gray-50 dark:hover:bg-gray-700"
//                             }`}
//                           >
//                             <div className="flex justify-between items-center">
//                               <div>
//                                 <p className="font-medium text-gray-900 dark:text-white">
//                                   {slot.start_time} - {slot.end_time}
//                                 </p>
//                                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                                   with {slot.interviewer?.name || "Unknown Interviewer"}
//                                 </p>
//                               </div>
//                               <div className="flex items-center">
//                                 <input
//                                   type="radio"
//                                   checked={selectedSlot?.id === slot.id}
//                                   onChange={() => {}}
//                                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-md">
//                   <p className="text-gray-500 dark:text-gray-400">Select a field and expertise level to see available slots</p>
//                 </div>
//               )}

//               {errors.slot && <p className="text-sm text-red-500">{errors.slot}</p>}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Notes (Optional)
//               </label>
//               <textarea
//                 id="notes"
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 rows="3"
//                 placeholder="Any specific topics you'd like to discuss or questions you have"
//                 className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
//               ></textarea>
//             </div>

//             {errors.form && (
//               <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-md text-sm">{errors.form}</div>
//             )}

//             <button
//               type="submit"
//               disabled={isLoading || !selectedSlot || !field || !level || !title}
//               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//             >
//               {isLoading ? (
//                 <>
//                   <svg
//                     className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Scheduling...
//                 </>
//               ) : (
//                 "Schedule Interview"
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </DashboardLayout>
//   )
// }

// export default SchedulePage
import { useState, useEffect } from "react";
import {
  X,
  AtSign,
  PhoneCall,
  GraduationCap,
  CalendarClock,
  Eye,
  Search,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import ScheduleModal from "../components/ScheduleModal";
import CandidateCard from "../components/CandidateCard";
import api from "../services/api";

const SchedulePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await api.get("/users/candidates");
        setCandidates(response.data.data);
        setFilteredCandidates(response.data.data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setCandidates([]);
        setFilteredCandidates([]);
      }
    };
    fetchCandidates();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
    setFilteredCandidates(filtered);
  }, [searchTerm, candidates]);

  const openScheduleModal = (candidate) => {
    setSelectedCandidate(candidate);
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setSelectedCandidate(null);
    setIsScheduleModalOpen(false);
  };

  const openDetailsModal = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedCandidate(null);
    setIsDetailsModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          Schedule an Interview
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Candidates
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Browse and schedule interviews with qualified candidates.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-gray-500 dark:text-gray-400">
                  No matching candidates found.
                </p>
              </div>
            ) : (
              filteredCandidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all hover:shadow-md dark:hover:shadow-gray-900"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {candidate.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <AtSign size={16} /> {candidate.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <PhoneCall size={16} /> {candidate.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <GraduationCap size={16} /> {candidate.experience}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openScheduleModal(candidate)}
                      className="flex items-center gap-1 bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                      <CalendarClock size={16} />
                      Schedule
                    </button>
                    <button
                      onClick={() => openDetailsModal(candidate)}
                      className="flex items-center gap-1 bg-gray-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isScheduleModalOpen && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={closeScheduleModal}
          onSchedule={(interview) => {
            // Optional: toast or update UI
          }}
          candidate={selectedCandidate}
        />
      )}

      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md relative shadow-xl">
            <button
              onClick={closeDetailsModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <X size={20} />
            </button>
            <CandidateCard
              candidate={selectedCandidate}
              onSchedule={openScheduleModal}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SchedulePage;
