"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Feedback {
  _id: string;
  email: string;
  rating: number;
  feedback: string;
  name?: string;
  type: 'high-rating' | 'low-rating';
  timestamp: string;
  ipAddress?: string;
}

interface FeedbackStats {
  total: number;
  byType: {
    'high-rating': {
      count: number;
      avgRating: number;
      ratings: number[];
    };
    'low-rating': {
      count: number;
      avgRating: number;
      ratings: number[];
    };
  };
}

export default function FeedbackDashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high-rating' | 'low-rating'>('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (!isLoading && user) {
      fetchFeedback();
      fetchStats();
    }
  }, [user, isLoading, router, filter]);

  const fetchFeedback = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/feedback'
        : `/api/feedback?type=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setFeedback(data.data.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/feedback/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Trust Feedback System</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400 hidden sm:block">
                Welcome, {user?.name || user?.email}
              </span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  📊 Dashboard
                </Button>
              </Link>
              <Link href="/feedback-demo">
                <Button variant="outline" size="sm">
                  💬 Demo
                </Button>
              </Link>
              <Link href="/high-rating">
                <Button variant="outline" size="sm">
                  ⭐ High Ratings
                </Button>
              </Link>
              <Link href="/low-rating">
                <Button variant="outline" size="sm">
                  📉 Low Ratings
                </Button>
              </Link>
              {user?.isSuperUser && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    👨‍💼 Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={async () => {
                await logout();
                router.push('/login');
              }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to Trust Feedback System! 👋
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Manage and analyze all your feedback in one place. View statistics, filter feedback, and respond to user comments.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.total}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  High Ratings (4-5★)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.byType['high-rating']?.count || 0}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Avg: {stats.byType['high-rating']?.avgRating || 0}★
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Low Ratings (1-3★)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.byType['low-rating']?.count || 0}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Avg: {stats.byType['low-rating']?.avgRating || 0}★
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total > 0 ? Math.round((stats.total / (stats.total + 10)) * 100) : 0}%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Based on total feedback
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Feedback
          </Button>
          <Button
            variant={filter === 'high-rating' ? 'default' : 'outline'}
            onClick={() => setFilter('high-rating')}
            className="bg-green-600 hover:bg-green-700"
          >
            High Ratings
          </Button>
          <Button
            variant={filter === 'low-rating' ? 'default' : 'outline'}
            onClick={() => setFilter('low-rating')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Low Ratings
          </Button>
        </div>

        {/* Development Tools */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Development Tools
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/feedback/sample', { method: 'POST' });
                    if (response.ok) {
                      alert('Sample data added successfully!');
                      fetchFeedback();
                      fetchStats();
                    }
                  } catch (error) {
                    alert('Failed to add sample data');
                  }
                }}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                Add Sample Data
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (confirm('Are you sure you want to clear all feedback data?')) {
                    try {
                      const response = await fetch('/api/feedback/sample', { method: 'DELETE' });
                      if (response.ok) {
                        alert('All feedback data cleared!');
                        fetchFeedback();
                        fetchStats();
                      }
                    } catch (error) {
                      alert('Failed to clear feedback data');
                    }
                  }
                }}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Clear All Data
              </Button>
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  No feedback found for the selected filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            feedback.map((item) => (
              <Card key={item._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {renderStars(item.rating)}
                      </div>
                      <Badge 
                        variant={item.type === 'high-rating' ? 'default' : 'secondary'}
                        className={item.type === 'high-rating' ? 'bg-green-600' : 'bg-orange-600'}
                      >
                        {item.type === 'high-rating' ? 'High Rating' : 'Low Rating'}
                      </Badge>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {item.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Rating: {item.rating}/5
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-300">
                      {item.feedback}
                    </p>
                  </div>

                  {item.ipAddress && item.ipAddress !== 'unknown' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      IP: {item.ipAddress}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
