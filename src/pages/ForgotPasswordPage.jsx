import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: email.trim()
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success('Password reset instructions sent to your email!');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'Failed to send reset instructions. Please try again.');
      toast.error('Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-violet-200 to-purple-100 relative overflow-hidden py-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-indigo-100/30 to-violet-100/30 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-t from-violet-100/30 to-indigo-100/30 blur-3xl" />
      </div>
      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/login" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 transition-colors mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>

          <Card className="border border-indigo-100 bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-200 to-transparent opacity-50 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-200 to-transparent opacity-50 rounded-full blur-3xl -ml-20 -mb-20" />
            
            <CardHeader className="space-y-3 relative">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg mb-2">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                Reset Password
              </CardTitle>
              <CardDescription>
                Enter your email address and we'll send you instructions to reset your password
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-1 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
                      <h3 className="text-lg font-semibold text-gray-700">Email Address</h3>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:scale-105 shadow-lg hover:shadow-indigo-200/50 text-lg py-6 mt-4" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending instructions...
                      </>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="bg-green-50 border border-green-100 text-green-600 p-6 rounded-xl text-center space-y-4">
                  <div className="text-lg font-semibold">Check your email</div>
                  <p>We've sent password reset instructions to your email address.</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    Send new instructions
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500 transition-colors font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
