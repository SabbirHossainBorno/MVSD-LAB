import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardCheck } from 'react-feather';

export default function DirectorDashboardSidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/director_dashboard',
      icon: <LayoutDashboard size={20} />
    },
    { 
      name: 'Approval Panel', 
      path: '/director_dashboard/approval',
      icon: <ClipboardCheck size={20} />
    }
  ];

  return (
    <div className="sidebar h-full bg-gray-800 text-white w-64 fixed inset-y-0 left-0 transform md:translate-x-0 transition duration-300 ease-in-out z-30">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
          <h2 className="ml-3 text-xl font-bold">Director Portal</h2>
        </div>
      </div>
      
      <nav className="mt-5">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 text-center text-xs text-gray-400">
        MVSD LAB © {new Date().getFullYear()}
      </div>
    </div>
  );
}