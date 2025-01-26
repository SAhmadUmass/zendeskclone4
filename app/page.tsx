import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[blob_7s_infinite]"></div>
      <div className="absolute top-0 right-10 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[blob_7s_infinite_2s]"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[blob_7s_infinite_4s]"></div>

      <div className="relative text-center space-y-8 p-8 backdrop-blur-sm bg-white/30 rounded-2xl shadow-xl border border-white/50 max-w-2xl mx-4">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 filter drop-shadow-sm">
            Support Desk
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Your customer support solution
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 mt-12 justify-center items-center">
          <Link 
            href="/login" 
            className="group relative inline-flex items-center justify-center px-8 py-4 font-medium text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-xl w-64 sm:w-auto"
          >
            <span className="absolute inset-0 w-full h-full rounded-lg border border-white/30"></span>
            <span className="relative">
              Customer Portal
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
            </span>
          </Link>
          <Link 
            href="/employee-login" 
            className="group relative inline-flex items-center justify-center px-8 py-4 font-medium transition-all duration-200 ease-in-out hover:-translate-y-0.5 rounded-lg bg-white/80 text-blue-600 hover:text-blue-700 shadow-lg hover:shadow-xl border border-blue-100 hover:border-blue-200 w-64 sm:w-auto backdrop-blur-sm"
          >
            <span className="relative">
              Employee Portal
              <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
} 