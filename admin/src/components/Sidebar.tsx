import Link from 'next/link'
import { Users, GraduationCap, BookOpen, BarChart3, FileText, Calendar, LogOut } from 'lucide-react'

export default function Sidebar() {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Teachers', href: '/teachers', icon: GraduationCap },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Exams', href: '/exams', icon: FileText },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">uEdu Admin</h1>
        <p className="text-gray-400 text-sm">English Academy</p>
      </div>
      
      <nav className="space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  )
}
