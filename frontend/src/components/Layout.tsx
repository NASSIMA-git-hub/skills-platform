import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Code, 
  Briefcase, 
  LogOut,
  Trophy,
  Newspaper,
  MessageSquare,
  Bell,
  GraduationCap
} from "lucide-react";
import { useEffect, useState } from "react";
import { notificationsAPI } from "../services/api";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationsAPI.getAll();
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/skills", icon: GraduationCap, label: "Skills" },
    { to: "/projects", icon: Code, label: "Projects" },
    { to: "/jobs", icon: Briefcase, label: "Jobs" },
    { to: "/rankings", icon: Trophy, label: "Rankings" },
    { to: "/feed", icon: Newspaper, label: "Feed" },
    { to: "/chat", icon: MessageSquare, label: "Chat" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <GraduationCap size={28} />
            SkillsHub
          </h1>
        </div>
        
        <nav className="px-4 pb-20">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
              {item.to === "/notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
