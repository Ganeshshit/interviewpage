import React, { useState } from "react";
import { User, Star } from "lucide-react";
import ScheduleModal from "./ScheduleModal"; // Make sure the path is correct

const CandidateCard = ({ candidate }) => {
  const [isScheduling, setIsScheduling] = useState(false);

  if (!candidate) {
    console.log(candidate, "Candidate not found");
    return null;
  }

  if (isScheduling) {
    return (
      <ScheduleModal
        isOpen={true}
        onClose={() => setIsScheduling(false)}
        candidate={candidate}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transition-all hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center mb-5">
        <img
          src={candidate.profileImage}
          alt={candidate.name}
          className="h-20 w-20 rounded-full border-2 border-indigo-500 object-cover mr-5"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {candidate.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {candidate.email}
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            {candidate.role}
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.map((skill, index) => (
            <span
              key={index}
              className="bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-white text-xs font-medium px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Additional Info
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <li className="flex items-center">
            <User className="h-4 w-4 mr-2 text-indigo-500" />
            <span>Department: {candidate.department}</span>
          </li>
          <li className="flex items-center">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            <span>Rating: {candidate.rating}</span>
          </li>
          <li className="flex items-center">
            <User className="h-4 w-4 mr-2 text-green-500" />
            <span>Experience: {candidate.experience}</span>
          </li>
          <li className="flex items-center">
            <User className="h-4 w-4 mr-2 text-purple-500" />
            <span>Preferred Role: {candidate.preferredRole}</span>
          </li>
        </ul>
      </div>

      {/* Only Schedule Button */}
      <div>
        <button
          onClick={() => setIsScheduling(true)}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg shadow hover:bg-indigo-700 transition-all"
        >
          Schedule Interview
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;
