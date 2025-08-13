'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface SignupRequest {
  _id: string;
  email: string;
  name?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export default function AdminPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (!isLoading && user && !user.isSuperUser) {
      router.push('/dashboard/feedback');
      return;
    }

    if (user?.isSuperUser) {
      fetchSignupRequests();
    }
  }, [user, isLoading, router]);

  const fetchSignupRequests = async () => {
    try {
      const response = await fetch('/api/admin/signup-requests');
      if (response.ok) {
        const data = await response.json();
        setSignupRequests(data.data);
      } else {
        setError('Failed to fetch signup requests');
      }
    } catch (error) {
      setError('Failed to fetch signup requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/signup-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, action }),
      });

      if (response.ok) {
        // Refresh the list
        fetchSignupRequests();
      } else {
        const error = await response.json();
        setError(error.message || 'Action failed');
      }
    } catch (error) {
      setError('Action failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user?.isSuperUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-600 dark:text-slate-400 hidden sm:block">
                Welcome, {user.name || user.email}
              </span>
              <Link href="/dashboard/feedback">
                <Button variant="outline" size="sm">📊 Feedback</Button>
              </Link>
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

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Signup Requests Management 👨‍💼
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Review and manage user signup requests. Approve or reject new account requests.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {signupRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-slate-400 text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No Signup Requests
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  There are no pending signup requests at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            signupRequests.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.email}</CardTitle>
                      {request.name && (
                        <CardDescription>{request.name}</CardDescription>
                      )}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Requested:</span>
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction(request._id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(request._id, 'reject')}
                        >
                          ❌ Reject
                        </Button>
                      </div>
                    )}

                    {(request.status === 'approved' || request.status === 'rejected') && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            {request.status === 'approved' ? 'Approved' : 'Rejected'} by:
                          </span>
                          <span>{request.approvedBy}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Date:</span>
                          <span>{request.approvedAt ? formatDate(request.approvedAt) : 'N/A'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
