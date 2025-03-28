import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="nav-header">
        <div className="container flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">InterviewPro</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Streamline Your Technical Interviews
        </h1>
        <p className="hero-subtitle">
          A comprehensive platform for conducting seamless technical interviews with
          integrated video calls and live coding environments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register?role=candidate">
            <Button className="w-full sm:w-auto" size="lg">
              Join as Candidate
            </Button>
          </Link>
          <Link to="/register?role=interviewer">
            <Button className="w-full sm:w-auto" variant="outline" size="lg">
              Join as Interviewer
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="mb-4">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Video Interviews</h3>
            <p className="text-muted-foreground">
              High-quality, low-latency video and audio communication for seamless interviews.
            </p>
          </div>

          <div className="feature-card">
            <div className="mb-4">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Coding Environment</h3>
            <p className="text-muted-foreground">
              Integrated code editor with syntax highlighting and real-time execution.
            </p>
          </div>

          <div className="feature-card">
            <div className="mb-4">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-muted-foreground">
              Intuitive calendar integration for managing interview appointments.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 