import React, { useState } from "react";
import { User, Star, Briefcase, Clock, Award, Calendar, ExternalLink } from "lucide-react";
import ScheduleModal from "./ScheduleModal";
import { motion, AnimatePresence } from "framer-motion";

const CandidateCard = ({ candidate }) => {
  const [isScheduling, setIsScheduling] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!candidate) {
    console.log(candidate, "Candidate not found");
    return null;
  }

  const cardVariants = {
    hover: {
      y: -3,
      scale: 1.02,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      {isScheduling && (
        <ScheduleModal
          isOpen={true}
          onClose={() => setIsScheduling(false)}
          candidate={candidate}
        />
      )}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center mb-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-blue-500">
              <img
                src={
                  candidate.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`
                }
                alt={candidate.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5">
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <div className="ml-5 flex-1">
            <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
            <p className="text-sm text-gray-400">{candidate.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="px-3 py-1 text-sm rounded-full bg-blue-600/20 text-blue-300 border border-blue-600">
                {candidate.role}
              </span>
              {candidate.isAvailable && (
                <span className="px-3 py-1 text-sm rounded-full bg-green-600/20 text-green-300 border border-green-600">
                  Available
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-blue-400">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidate.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-600 hover:bg-blue-600/20 hover:text-blue-300 transition-all"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gray-800/50 flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Department</p>
                    <p className="text-sm text-white">{candidate.department}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/50 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Experience</p>
                    <p className="text-sm text-white">{candidate.experience} years</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/50 flex items-center gap-3">
                  <Award className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Preferred Role</p>
                    <p className="text-sm text-white">{candidate.preferredRole}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/50 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Availability</p>
                    <p className="text-sm text-white">Immediate</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScheduling(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all"
          >
            Schedule Interview
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 bg-gray-800 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-600/20 transition-all"
          >
            {isExpanded ? (
              <>
                Less
                <ExternalLink className="w-4 h-4 rotate-180" />
              </>
            ) : (
              <>
                More
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default CandidateCard;
