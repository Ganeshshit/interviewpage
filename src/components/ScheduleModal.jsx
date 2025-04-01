import React, { useState } from 'react';
import { X } from 'lucide-react';

const ScheduleModal = ({ isOpen, onClose, onSchedule, candidate }) => {
  const [formData, setFormData] = useState({
    scheduledTime: '',
    duration: 60,
    topic: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSchedule({
      ...formData,
      candidateId: candidate.id,
      candidateName: candidate.name
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#29354d] rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Schedule Interview
        </h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scheduling interview with:
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {candidate?.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Skills: {candidate?.skills?.join(', ')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date and Time
            </label>
            <input
              type="datetime-local"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interview Topic
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., React Frontend Development"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Message
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any additional information for the candidate..."
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#fcc250] text-[#29354d] rounded-md hover:bg-[#ffbb33] transition-colors"
          >
            Schedule and Send Invitation
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal; 