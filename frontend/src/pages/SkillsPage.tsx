import { useEffect, useState } from "react";
import { skillsAPI } from "../services/api";
import type { Skill, UserSkill } from "../types";
import { Search, Plus, CheckCircle, Star, Code } from "lucide-react";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allSkillsRes, userSkillsRes] = await Promise.all([
          skillsAPI.getAll(selectedCategory || undefined),
          skillsAPI.getUserSkills(),
        ]);
        setSkills(allSkillsRes.data.skills);
        setUserSkills(userSkillsRes.data.userSkills);
      } catch (err) {
        console.error("Failed to fetch skills", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  const categories = [...new Set(skills.map((s) => s.category))];
  
  const userSkillIds = new Set(userSkills.map((us) => us.skillId));
  
  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || skill.category === selectedCategory)
  );

  const handleAddSkill = async (skillId: string) => {
    try {
      await skillsAPI.addUserSkill({ skillId, level: 1, score: 0 });
      const userSkillsRes = await skillsAPI.getUserSkills();
      setUserSkills(userSkillsRes.data.userSkills);
    } catch (err) {
      console.error("Failed to add skill", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
            <p className="text-gray-500">Track and develop your technical skills</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* My Skills */}
        {userSkills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSkills.map((us) => (
                <div key={us.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Code className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{us.skill.name}</h3>
                        <p className="text-sm text-gray-500">{us.skill.category}</p>
                      </div>
                    </div>
                    {us.verified && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Level {us.level}</span>
                      <span className="font-medium text-blue-600">{us.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${us.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Skills */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills
              .filter((s) => !userSkillIds.has(s.id))
              .map((skill) => (
                <div key={skill.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Code className="text-gray-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                        <p className="text-sm text-gray-500">{skill.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: skill.difficultyLevel }).map((_, i) => (
                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddSkill(skill.id)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Skill
                  </button>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}