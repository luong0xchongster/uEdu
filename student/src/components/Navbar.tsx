import Link from 'next/link'
import { Home, BookOpen, Calendar, User, LogOut } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              uEdu
            </Link>
            <span className="ml-2 text-gray-400">| Student Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Home size={18} />
              Home
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              <BookOpen size={18} />
              Courses
            </Link>
            <Link
              href="/schedule"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Calendar size={18} />
              Schedule
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              <User size={18} />
              Profile
            </Link>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
