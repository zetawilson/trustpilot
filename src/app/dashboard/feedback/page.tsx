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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (!isLoading && user) {
      fetchFeedback();
      fetchStats();
    }
  }, [user, isLoading, router, filter, currentPage, pageSize]);

  const fetchFeedback = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (filter !== 'all') {
        params.append('type', filter);
      }
      
      const response = await fetch(`/api/feedback?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFeedback(data.data.feedback);
        setTotalPages(data.data.totalPages);
        setTotalItems(data.data.total);
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

  const handleSelectAll = () => {
    if (selectedIds.size === feedback.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(feedback.map(f => f._id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const confirmMessage = selectedIds.size === 1 
      ? 'Are you sure you want to delete this feedback?' 
      : `Are you sure you want to delete ${selectedIds.size} feedback items?`;
    
    if (!confirm(confirmMessage)) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.data.message);
        setSelectedIds(new Set());
        fetchFeedback();
        fetchStats();
      } else {
        alert('Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds(new Set());
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setSelectedIds(new Set());
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
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-lg">T</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">Trust Feedback</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400">
                Welcome, {user?.name || user?.email}
              </span>

              <Link href="/feedback-demo">
                <Button variant="outline" size="sm">
                  💬 Demo
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  👤 Profile
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
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-2 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-slate-600 dark:text-slate-400 px-2 py-1">
                  Welcome, {user?.name || user?.email}
                </div>

                              <Link href="/feedback-demo" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  💬 Demo
                </Button>
              </Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  👤 Profile
                </Button>
              </Link>
                <Link href="/high-rating" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    ⭐ High Ratings
                  </Button>
                </Link>
                <Link href="/low-rating" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    📉 Low Ratings
                  </Button>
                </Link>
                {user?.isSuperUser && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      👨‍💼 Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 dark:text-red-400"
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                >
                  🚪 Logout
                </Button>
              </div>
            </div>
          )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
        <div className="mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700 inline-flex w-full sm:w-auto">
            <button
              onClick={() => { setFilter('all'); setCurrentPage(1); setSelectedIds(new Set()); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="hidden sm:inline">All Feedback</span>
              <span className="sm:hidden">All</span>
              {stats && <span className="ml-1 text-xs opacity-75">({stats.total})</span>}
            </button>
            <button
              onClick={() => { setFilter('high-rating'); setCurrentPage(1); setSelectedIds(new Set()); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === 'high-rating'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="hidden sm:inline">⭐ High Ratings</span>
              <span className="sm:hidden">⭐ High</span>
              {stats && <span className="ml-1 text-xs opacity-75">({stats.byType['high-rating']?.count || 0})</span>}
            </button>
            <button
              onClick={() => { setFilter('low-rating'); setCurrentPage(1); setSelectedIds(new Set()); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === 'low-rating'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span className="hidden sm:inline">📉 Low Ratings</span>
              <span className="sm:hidden">📉 Low</span>
              {stats && <span className="ml-1 text-xs opacity-75">({stats.byType['low-rating']?.count || 0})</span>}
            </button>
          </div>
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

        {/* Selection Controls */}
        {feedback.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {user?.isSuperUser ? (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === feedback.length && feedback.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Select All ({selectedIds.size} selected)
                  </span>
                </label>
                {selectedIds.size > 0 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : `Delete (${selectedIds.size})`}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Feedback Overview
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 dark:text-slate-400">Items per page:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
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
              <Card key={item._id} className={`hover:shadow-lg transition-shadow ${user?.isSuperUser && selectedIds.has(item._id) ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {user?.isSuperUser && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {item.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
                        {item.email}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Rating: {item.rating}/5
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
