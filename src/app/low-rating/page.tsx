"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LowRatingPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Get email and rating from query parameters
    const emailParam = searchParams.get('email');
    const ratingParam = searchParams.get('rating');
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    if (ratingParam) {
      const ratingNum = parseInt(ratingParam);
      if (ratingNum >= 1 && ratingNum <= 3) {
        setRating(ratingNum);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      alert("Please provide your feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback/low-rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          rating,
          feedback,
          name
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        alert(data.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      default: return "";
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 dark:from-orange-900 dark:via-amber-900 dark:to-yellow-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-2">
              Thank You! 🙏
            </h2>
            <p className="text-orange-700 dark:text-orange-300 mb-6">
              Your feedback has been submitted successfully. We take all feedback seriously and will use it to improve our service.
            </p>
            <Button 
              onClick={() => window.close()} 
              className="bg-orange-600 hover:bg-orange-700"
            >
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 dark:from-orange-900 dark:via-amber-900 dark:to-yellow-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">💬</span>
          </div>
          <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            We Value Your Feedback
          </h1>
          <p className="text-orange-700 dark:text-orange-300">
            Thank you for your {rating}-star rating. We'd love to hear how we can improve.
          </p>
        </div>

        {/* Feedback Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-orange-900 dark:text-orange-100">Help Us Improve</CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Your honest feedback helps us provide better service to everyone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating Display */}
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">Your Rating:</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-2xl ${
                        star <= rating 
                          ? 'text-yellow-400' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  {getRatingText()}
                </p>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Your Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">What could we improve?</Label>
                <Textarea
                  id="feedback"
                  placeholder="Please share what didn't meet your expectations and how we can make it better..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Be specific about what went wrong and what you expected instead
                </p>
              </div>

              {/* Additional Questions */}
              <div className="space-y-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Quick questions to help us understand better:
                </p>
                <div className="space-y-2 text-xs text-orange-700 dark:text-orange-300">
                  <p>• Was it a specific feature, service, or overall experience?</p>
                  <p>• Did you encounter any technical issues?</p>
                  <p>• How could we have made it right for you?</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-orange-600 dark:text-orange-400">
                We review all feedback and will work to address the issues you've raised
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
