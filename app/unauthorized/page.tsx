import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Unauthorized Access
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </p>
        </div>
        
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
} 