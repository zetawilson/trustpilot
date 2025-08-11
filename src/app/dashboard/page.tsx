"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login via auth context
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
                Welcome, {user.name}
              </span>
              <Button variant="outline" onClick={logout}>
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
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Here's what's happening with your account today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">8</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                3 due this week
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">24</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                +3 new this month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">$45.2K</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest project updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'E-commerce Platform', status: 'In Progress', progress: 75 },
                { name: 'Mobile App Redesign', status: 'Review', progress: 90 },
                { name: 'API Integration', status: 'Completed', progress: 100 },
                { name: 'Database Migration', status: 'Planning', progress: 25 }
              ].map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{project.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{project.status}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {project.progress}%
                    </div>
                    <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                      <div 
                        className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
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
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">📁</span>
                Create New Project
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">👥</span>
                Invite Team Member
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">📊</span>
                View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/dashboard/feedback'}>
                <span className="mr-2">💬</span>
                View Feedback
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">⚙️</span>
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
