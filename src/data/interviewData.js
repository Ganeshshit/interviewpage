import { users } from './userData';

// Mock candidate data
const candidates = [
  {
    id: "cand-001",
    name: "John Smith",
    skills: ["JavaScript", "React", "Node.js"],
    status: "available"
  },
  {
    id: "cand-002",
    name: "Sarah Johnson",
    skills: ["Python", "Django", "SQL"],
    status: "available"
  },
  {
    id: "cand-003",
    name: "Michael Chen",
    skills: ["Java", "Spring", "Microservices"],
    status: "available"
  }
];

export const interviewDetails = {
  // Active interviews with detailed information
  activeInterviews: [
    {
      id: 1,
      interviewId: "INT-2024-001",
      candidateId: 1, // References candidates[0]
      interviewerId: 1, // References interviewers[0]
      scheduledAt: "2024-03-25T10:00:00",
      duration: 60, // in minutes
      status: "scheduled", // scheduled, in-progress, completed, cancelled
      type: "Frontend Development",
      level: "mid-level",
      topic: {
        mainTopic: "React Development",
        subTopics: ["Hooks", "State Management", "Component Lifecycle"],
        requirements: ["JavaScript", "React", "CSS"]
      },
      meetingDetails: {
        platform: "Zoom",
        link: "https://meet.example.com/room1",
        password: "123456"
      },
      questions: [
        {
          id: 1,
          title: "React Hooks Implementation",
          description: "Implement a custom hook for handling form state",
          difficulty: "medium",
          expectedDuration: 20, // in minutes
          codeSnippet: `// Create a custom form hook
const useForm = (initialState) => {
  // Your implementation here
};`
        },
        {
          id: 2,
          title: "State Management",
          description: "Implement a counter using useState and useReducer",
          difficulty: "easy",
          expectedDuration: 15
        }
      ],
      feedback: null // Will be filled after interview
    },
    {
      id: 2,
      interviewId: "INT-2024-002",
      candidateId: 2, // References candidates[1]
      interviewerId: 2, // References interviewers[1]
      scheduledAt: "2024-03-26T14:00:00",
      duration: 60,
      status: "scheduled",
      type: "Backend Development",
      level: "senior",
      topic: {
        mainTopic: "Python Backend Development",
        subTopics: ["Django REST Framework", "Database Design", "API Security"],
        requirements: ["Python", "Django", "PostgreSQL"]
      },
      meetingDetails: {
        platform: "Google Meet",
        link: "https://meet.example.com/room2",
        password: null
      },
      questions: [
        {
          id: 3,
          title: "API Design",
          description: "Design a RESTful API for a social media platform",
          difficulty: "hard",
          expectedDuration: 30
        }
      ],
      feedback: null
    }
  ],

  // Completed interviews with feedback
  completedInterviews: [
    {
      id: 3,
      interviewId: "INT-2024-000",
      candidateId: 1,
      interviewerId: 1,
      conductedAt: "2024-03-20T10:00:00",
      duration: 60,
      status: "completed",
      type: "Frontend Development",
      level: "mid-level",
      topic: {
        mainTopic: "Frontend Architecture",
        subTopics: ["Component Design", "Performance Optimization"],
        requirements: ["JavaScript", "React"]
      },
      feedback: {
        rating: 4.5,
        technicalSkills: {
          score: 9,
          comments: "Strong understanding of React concepts"
        },
        communicationSkills: {
          score: 8,
          comments: "Clear communication and good problem-solving approach"
        },
        problemSolving: {
          score: 8,
          comments: "Methodical approach to solving problems"
        },
        recommendations: "Recommended for next round",
        improvements: "Could improve on optimization techniques",
        overallComments: "Strong candidate with good potential",
        interviewerNotes: "Candidate showed excellent knowledge of React ecosystem"
      },
      recording: {
        url: "https://recording.example.com/int-2024-000",
        duration: "58:30"
      }
    }
  ],

  // Helper functions to link data
  getInterviewDetails: function(interviewId) {
    return [...this.activeInterviews, ...this.completedInterviews]
      .find(interview => interview.id === interviewId);
  },

  getCandidateInterviews: function(candidateId) {
    return [...this.activeInterviews, ...this.completedInterviews]
      .filter(interview => interview.candidateId === candidateId);
  },

  getInterviewerSchedule: function(interviewerId) {
    return this.activeInterviews
      .filter(interview => interview.interviewerId === interviewerId);
  },

  // Function to match candidates with interviewers based on skills
  matchCandidateWithInterviewer: function(candidateId, users) {
    const candidate = users.candidates.find(c => c.id === candidateId);
    if (!candidate) return null;

    return users.interviewers.filter(interviewer => 
      interviewer.expertise.some(skill => 
        candidate.skills.includes(skill)
      ) &&
      interviewer.interviewLevels.includes(candidate.level)
    );
  },

  // Function to update interview status
  updateInterviewStatus: function(interviewId, newStatus, feedback = null) {
    const interview = this.activeInterviews.find(i => i.id === interviewId);
    if (interview) {
      interview.status = newStatus;
      if (feedback && newStatus === 'completed') {
        interview.feedback = feedback;
        this.completedInterviews.push({...interview});
        this.activeInterviews = this.activeInterviews.filter(i => i.id !== interviewId);
      }
      return true;
    }
    return false;
  },

  // Function to schedule new interview
  scheduleInterview: async (interviewData) => {
    try {
      const candidateEmail = users.getCandidateEmailById(interviewData.candidateId);
      const candidate = users.getCandidatePublicInfo(interviewData.candidateId);
      
      if (!candidateEmail || !candidate) {
        throw new Error('Candidate not found');
      }

      // Create new interview record
      const newInterview = {
        id: `int-${Date.now()}`,
        ...interviewData,
        status: 'scheduled'
      };

      // Add to active interviews
      interviewDetails.activeInterviews.push(newInterview);

      // Return the email data separately from the interview data
      return {
        interview: newInterview,
        emailData: {
          receiverEmail: candidateEmail,
          candidateName: candidate.name
        }
      };
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }
  },

  // Add these new functions
  getAvailableCandidates: () => {
    // Return only public info of available candidates
    return users.candidates
      .filter(candidate => candidate.status === "available")
      .map(candidate => {
        const { email, ...publicInfo } = candidate;
        return publicInfo;
      });
  },

  getInterviewerSchedule: (interviewerId) => {
    return interviewDetails.activeInterviews.filter(
      interview => interview.interviewerId === interviewerId
    );
  },

  scheduleInterview: (interviewData) => {
    const newInterview = {
      id: `int-${Date.now()}`,
      ...interviewData,
      status: 'scheduled'
    };
    interviewDetails.activeInterviews.push(newInterview);
    return newInterview;
  }
}; 