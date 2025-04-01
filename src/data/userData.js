export const users = {
    interviewers: [
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
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
        },
    ],
    candidates: [
        {
            id: 1,
            name: "Alice Johnson",
            email: "gshit2003@gmail.com",
            password: "password123",
            role: "candidate",
            profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
            skills: ["JavaScript", "React", "CSS"],
            experience: "3 years",
            preferredRole: "Frontend Developer",
            level: "mid-level",
            created_at: "2024-03-01T10:00:00",
            status: "available",
        },
    ],
    interviews: []
};

// Function to find a user by email
export const findUserByEmail = (email) => {
    return users.interviewers.find(i => i.email === email) || users.candidates.find(c => c.email === email) || null;
};

// Function to validate user credentials
export const validateCredentials = (email, password) => {
    const user = findUserByEmail(email);
    if (user && user.password === password) {
        const { password, ...safeUser } = user;
        return safeUser;
    }
    return null;
};

// Function to get a user's interviews
export const getUserInterviews = (userId, role) => {
    if (role === 'interviewer') {
        return users.interviews.filter(interview => interview.interviewerId === userId);
    } else if (role === 'candidate') {
        return users.interviews.filter(interview => interview.candidateId === userId);
    }
    return [];
};

// Function to get a user's profile
export const getUserProfile = (userId, role) => {
    return role === 'interviewer' ? users.interviewers.find(i => i.id === userId) : users.candidates.find(c => c.id === userId);
};

// Function to get candidate email by ID
export const getCandidateEmailById = (candidateId) => {
    return users.candidates.find(c => c.id === candidateId)?.email || null;
};

// Function to get candidate public info (without email)
export const getCandidatePublicInfo = (candidateId) => {
    const candidate = users.candidates.find(c => c.id === candidateId);
    if (!candidate) return null;
    const { email, ...publicInfo } = candidate;
    return publicInfo;
};

// Function to get available candidates
export const getAvailableCandidates = () => {
    return users.candidates.filter(candidate => candidate.status === "available");
};

