export const users = {
  interviewers: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password: "password123", // In real app, this would be hashed
      role: "interviewer",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      expertise: ["JavaScript", "React", "Node.js"],
      interviewLevels: ["junior", "mid-level", "senior"],
      created_at: "2024-01-15T08:00:00",
      status: "active",
      department: "Engineering",
      totalInterviews: 45,
      rating: 4.8,
      availability: [
        {
          date: "2024-03-25",
          slots: ["10:00", "14:00", "16:00"]
        },
        {
          date: "2024-03-26",
          slots: ["09:00", "13:00", "15:00"]
        }
      ],
      completedInterviews: [
        {
          id: 1,
          candidateName: "Alice Smith",
          date: "2024-03-20T10:00:00",
          type: "Frontend Development",
          rating: 4.5,
          status: "completed"
        }
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password123",
      role: "interviewer",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      expertise: ["Python", "Django", "Machine Learning"],
      interviewLevels: ["mid-level", "senior"],
      created_at: "2024-02-01T09:00:00",
      status: "active",
      department: "AI/ML",
      totalInterviews: 32,
      rating: 4.9,
      availability: [
        {
          date: "2024-03-25",
          slots: ["11:00", "15:00", "17:00"]
        }
      ]
    }
  ],

  candidates: [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      password: "password123",
      role: "candidate",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      skills: ["JavaScript", "React", "CSS"],
      experience: "3 years",
      preferredRole: "Frontend Developer",
      level: "mid-level",
      created_at: "2024-03-01T10:00:00",
      status: "active",
      resume: {
        url: "path/to/resume.pdf",
        lastUpdated: "2024-03-01T10:00:00"
      },
      interviews: [
        {
          id: 1,
          interviewerId: 1,
          interviewerName: "John Doe",
          date: "2024-03-25T10:00:00",
          status: "scheduled",
          type: "Frontend Development"
        }
      ],
      preferences: {
        availableDays: ["Monday", "Wednesday", "Friday"],
        preferredTimeSlots: ["morning", "afternoon"]
      }
    },
    {
      id: 2,
      name: "Bob Wilson",
      email: "bob@example.com",
      password: "password123",
      role: "candidate",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      skills: ["Python", "Django", "PostgreSQL"],
      experience: "5 years",
      preferredRole: "Backend Developer",
      level: "senior",
      created_at: "2024-03-02T11:00:00",
      status: "active",
      resume: {
        url: "path/to/resume.pdf",
        lastUpdated: "2024-03-02T11:00:00"
      },
      interviews: [
        {
          id: 2,
          interviewerId: 2,
          interviewerName: "Jane Smith",
          date: "2024-03-26T14:00:00",
          status: "scheduled",
          type: "Backend Development"
        }
      ],
      preferences: {
        availableDays: ["Tuesday", "Thursday"],
        preferredTimeSlots: ["afternoon", "evening"]
      }
    }
  ],

  // Mock interview data
  interviews: [
    {
      id: 1,
      candidateId: 1,
      interviewerId: 1,
      date: "2024-03-25T10:00:00",
      type: "Frontend Development",
      level: "mid-level",
      status: "scheduled",
      duration: 60,
      meetingLink: "https://meet.example.com/room1",
      questions: [
        {
          id: 1,
          title: "React Hooks Implementation",
          description: "Implement a custom hook for handling form state",
          difficulty: "medium"
        }
      ]
    },
    {
      id: 2,
      candidateId: 2,
      interviewerId: 2,
      date: "2024-03-26T14:00:00",
      type: "Backend Development",
      level: "senior",
      status: "scheduled",
      duration: 60,
      meetingLink: "https://meet.example.com/room2",
      questions: [
        {
          id: 2,
          title: "API Design",
          description: "Design a RESTful API for a social media platform",
          difficulty: "hard"
        }
      ]
    }
  ]
};

// Helper functions for authentication
export const findUserByEmail = (email) => {
  const interviewer = users.interviewers.find(i => i.email === email);
  if (interviewer) return interviewer;

  const candidate = users.candidates.find(c => c.email === email);
  if (candidate) return candidate;

  return null;
};

export const validateCredentials = (email, password) => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    // Remove sensitive data before returning
    const { password, ...safeUser } = user;
    return safeUser;
  }
  return null;
};

// Helper function to get user's interviews
export const getUserInterviews = (userId, role) => {
  if (role === 'interviewer') {
    return users.interviews.filter(interview => interview.interviewerId === userId);
  } else if (role === 'candidate') {
    return users.interviews.filter(interview => interview.candidateId === userId);
  }
  return [];
};

// Helper function to get user's profile
export const getUserProfile = (userId, role) => {
  if (role === 'interviewer') {
    return users.interviewers.find(i => i.id === userId);
  } else if (role === 'candidate') {
    return users.candidates.find(c => c.id === userId);
  }
  return null;
}; 