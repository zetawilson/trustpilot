"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeedbackDemoPage() {
  const demoEmail = "user@example.com";
  
  const handleHighRatingClick = (rating: number) => {
    const url = `/high-rating?email=${encodeURIComponent(demoEmail)}&rate=${rating}`;
    window.open(url, '_blank');
  };

  const handleLowRatingClick = (rating: number) => {
    const url = `/low-rating?email=${encodeURIComponent(demoEmail)}&rate=${rating}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Feedback System Demo
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Test the feedback pages with different ratings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* High Rating Section */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-300">High Rating Feedback (4-5 stars)</CardTitle>
              <CardDescription>
                Click to test the high-rating feedback page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Demo Email: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs sm:text-sm break-all">{demoEmail}</code>
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleHighRatingClick(4)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  4 Stars
                </Button>
                <Button 
                  onClick={() => handleHighRatingClick(5)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  5 Stars
                </Button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p><strong>Example URLs:</strong></p>
                <p className="break-all"><code className="text-xs">/high-rating?email=user@example.com&rate=4</code></p>
                <p className="break-all"><code className="text-xs">/high-rating?email=user@example.com&rate=5</code></p>
              </div>
            </CardContent>
          </Card>

          {/* Low Rating Section */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-orange-700 dark:text-orange-300">Low Rating Feedback (1-3 stars)</CardTitle>
              <CardDescription>
                Click to test the low-rating feedback page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Demo Email: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs sm:text-sm break-all">{demoEmail}</code>
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleLowRatingClick(1)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  1 Star
                </Button>
                <Button 
                  onClick={() => handleLowRatingClick(2)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  2 Stars
                </Button>
                <Button 
                  onClick={() => handleLowRatingClick(3)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  3 Stars
                </Button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p><strong>Example URLs:</strong></p>
                <p className="break-all"><code className="text-xs">/low-rating?email=user@example.com&rate=1</code></p>
                <p className="break-all"><code className="text-xs">/low-rating?email=user@example.com&rate=2</code></p>
                <p className="break-all"><code className="text-xs">/low-rating?email=user@example.com&rate=3</code></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Guide */}
        <Card className="mt-8 shadow-xl border-0">
          <CardHeader>
            <CardTitle>Implementation Guide</CardTitle>
            <CardDescription>
              How to integrate these feedback pages into your email system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Email Template Integration:</h4>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs sm:text-sm">
{`<!-- Star Rating Links in Email -->
<div class="rating-stars">
  <a href="https://yoursite.com/high-rating?email={{user_email}}&rate=5">⭐</a>
  <a href="https://yoursite.com/high-rating?email={{user_email}}&rate=4">⭐</a>
  <a href="https://yoursite.com/low-rating?email={{user_email}}&rate=3">⭐</a>
  <a href="https://yoursite.com/low-rating?email={{user_email}}&rate=2">⭐</a>
  <a href="https://yoursite.com/low-rating?email={{user_email}}&rate=1">⭐</a>
</div>`}
                </pre>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">URL Structure:</h4>
              <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                <li>• <strong>High Rating:</strong> <code>/high-rating?email=user@example.com&rate=4</code></li>
                <li>• <strong>Low Rating:</strong> <code>/low-rating?email=user@example.com&rate=2</code></li>
                <li>• <strong>Parameters:</strong> email (required), rate (required, 1-5)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Features:</h4>
              <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                <li>• ✅ Automatic email and rating extraction from URL parameters</li>
                <li>• ✅ Different UI themes for high vs low ratings</li>
                <li>• ✅ Form validation and submission</li>
                <li>• ✅ Success confirmation page</li>
                <li>• ✅ No authentication required (public pages)</li>
                <li>• ✅ API endpoints for data collection</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
