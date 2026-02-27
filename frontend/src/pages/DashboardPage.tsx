import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { skillsAPI, projectsAPI, notificationsAPI } from "../services/api";
import type { UserSkill, Project, Notification } from "../types";
import { Trophy, Bell, Code, TrendingUp, Star } from "lucide-react";

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, projectsRes, notifRes] = await Promise.all([
          skillsAPI.getUserSkills(),
          projectsAPI.getAll(),
          notificationsAPI.getAll(),
        ]);
        setUserSkills(skillsRes.data.userSkills);
        setProjects(projectsRes.data.projects);
        setNotifications(notifRes.data.notifications);
        setUnreadCount(notifRes.data.unreadCount);
        await refreshUser();
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const completedProjects = projects.filter(p => 
    p.assignments.some(a => a.userId === user?.id && a.completed)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.fullName?.[0]}
              </div>
              <span className="font-medium">{user?.fullName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Skills</p>
                <p className="text-2xl font-bold">{userSkills.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Code className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Projects</p>
                <p className="text-2xl font-bold">{completedProjects}/{projects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Score</p>
                <p className="text-2xl font-bold">
                  {userSkills.length > 0
                    ? Math.round(userSkills.reduce((a, b) => a + b.score, 0) / userSkills.length)
                    : 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Trophy className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-2xl font-bold">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">My Skills</h2>
            {userSkills.length === 0 ? (
              <p className="text-gray-500">No skills added yet</p>
            ) : (
              <div className="space-y-3">
                {userSkills.map((us) => (
                  <div key={us.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{us.skill.name}</p>
                      <p className="text-sm text-gray-500">{us.skill.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{us.score}</p>
                      <p className="text-xs text-gray-500">Level {us.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg ${n.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                  >
                    <p className="text-sm">{n.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
