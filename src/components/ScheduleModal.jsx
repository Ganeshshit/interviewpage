import React, { useState } from "react";
import { X, Calendar, Clock, Video, MessageSquare } from "lucide-react";
import { api } from "../config/axios";
import { toast } from "react-hot-toast";

const ScheduleModal = ({ isOpen, onClose, onSchedule, candidate }) => {
  const [formData, setFormData] = useState({
    scheduledTime: "",
    duration: 60,
    topic: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const generateRoomId = () => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomString}`;
  };

  const generateInterviewLink = (roomId) => {
    return `${window.location.origin}/interview/${roomId}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roomId = generateRoomId();
      const interviewLink = generateInterviewLink(roomId);

      const response = await api.post("/api/interviews/schedule", {
        ...formData,
        candidateId: candidate._id,
        roomId,
        meetingLink: interviewLink,
        status: "scheduled",
      });

      if (response.data.success) {
        toast.success("Interview scheduled successfully!");
        onSchedule(response.data.interview);
        onClose();
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error(
        error.response?.data?.message || "Failed to schedule interview"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1f2937] rounded-xl p-6 w-full max-w-md relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          Schedule Interview
        </h2>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scheduling interview with:
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {candidate?.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Skills: {candidate?.skills?.join(", ")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date and Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledTime: e.target.value })
                }
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
              <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interview Topic
            </label>
            <div className="relative">
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                placeholder="e.g., React Frontend Development"
              />
              <Video className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Message
            </label>
            <div className="relative">
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Any additional information for the candidate..."
              />
              <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Scheduling...
              </>
            ) : (
              "Schedule and Send Invitation"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
