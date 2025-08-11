"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function HighRatingForm() {
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
      if (ratingNum >= 4 && ratingNum <= 5) {
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
      const response = await fetch('/api/feedback/high-rating', {
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-green-900 dark:via-emerald-900 dark:to-teal-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              Thank You! 🎉
            </h2>
            <p className="text-green-700 dark:text-green-300 mb-6">
              Your positive feedback has been submitted successfully. We appreciate you taking the time to share your experience!
            </p>
            <Button 
              onClick={() => window.close()} 
              className="bg-green-600 hover:bg-green-700"
            >
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-green-900 dark:via-emerald-900 dark:to-teal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">⭐</span>
          </div>
          <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">
            We're Thrilled! 🎉
          </h1>
          <p className="text-green-700 dark:text-green-300">
            Thank you for your {rating}-star rating! Please share what made your experience great.
          </p>
        </div>

        {/* Feedback Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-green-900 dark:text-green-100">Share Your Experience</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your feedback helps us improve and serve others better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating Display */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">Your Rating:</p>
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
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {rating === 5 ? 'Excellent!' : 'Great!'}
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
                <Label htmlFor="feedback">What made your experience great?</Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us what you loved about our service, product, or experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-green-600 dark:text-green-400">
                  Share specific details about what impressed you most
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
              <p className="text-xs text-green-600 dark:text-green-400">
                Your feedback will help us continue providing excellent service to others
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HighRatingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-green-900 dark:via-emerald-900 dark:to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 dark:text-green-300">Loading...</p>
        </div>
      </div>
    }>
      <HighRatingForm />
    </Suspense>
  );
}
