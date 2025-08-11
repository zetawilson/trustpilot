import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl font-bold">404</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Sorry, the page you're looking for doesn't exist.
          </p>
        </div>

        {/* Content Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">What happened?</CardTitle>
            <CardDescription>
              The page you're looking for might have been moved, deleted, or you entered the wrong URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  🏠 Go to Home
                </Button>
              </Link>
              
              <Link href="/dashboard" className="block">
                <Button className="w-full" variant="outline">
                  📊 Go to Dashboard
                </Button>
              </Link>
              
              <Link href="/feedback-demo" className="block">
                <Button className="w-full" variant="outline">
                  💬 Try Feedback Demo
                </Button>
              </Link>
            </div>

            {/* Helpful Links */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Popular Pages:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link href="/high-rating" className="text-blue-600 dark:text-blue-400 hover:underline">
                  High Rating Feedback
                </Link>
                <Link href="/low-rating" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Low Rating Feedback
                </Link>
                <Link href="/dashboard/feedback" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Feedback Dashboard
                </Link>
                <Link href="/feedback-demo" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Feedback Demo
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
