"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    router.push('/login');
    return null;
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
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Trust Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-600 dark:text-slate-400 hidden sm:block">
                Welcome, {user?.name || user?.email}
              </span>
              <Link href="/dashboard/feedback">
                <Button variant="outline" size="sm">
                  📊 Feedback
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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to Trust Dashboard! 👋
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Here's what's happening with your feedback system today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">156</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                +23 from last week
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                High Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">89</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                57% of total feedback
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Low Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                8% of total feedback
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
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">94%</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>Latest feedback submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { message: 'Great experience with the new interface!', rating: 5, time: '2 hours ago' },
                { message: 'Could use some improvements in mobile view', rating: 3, time: '4 hours ago' },
                { message: 'Excellent customer service', rating: 5, time: '6 hours ago' },
                { message: 'Found a bug in the checkout process', rating: 2, time: '1 day ago' }
              ].map((feedback, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-2">{feedback.message}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{feedback.time}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < feedback.rating ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/feedback-demo">
                <Button className="w-full justify-start" variant="outline">
                  <span className="mr-2">💬</span>
                  Try Feedback Demo
                </Button>
              </Link>
              <Link href="/dashboard/feedback">
                <Button className="w-full justify-start" variant="outline">
                  <span className="mr-2">📊</span>
                  View All Feedback
                </Button>
              </Link>
              <Link href="/high-rating">
                <Button className="w-full justify-start" variant="outline">
                  <span className="mr-2">⭐</span>
                  High Ratings
                </Button>
              </Link>
              <Link href="/low-rating">
                <Button className="w-full justify-start" variant="outline">
                  <span className="mr-2">📉</span>
                  Low Ratings
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">📈</span>
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
