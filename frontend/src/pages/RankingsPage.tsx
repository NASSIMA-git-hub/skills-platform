import { useEffect, useState } from "react";
import { rankingsAPI, skillsAPI } from "../services/api";
import type { Ranking, Skill } from "../types";
import { Trophy, Medal, Crown, Star, TrendingUp } from "lucide-react";

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await skillsAPI.getAll();
        setSkills(res.data.skills);
      } catch (err) {
        console.error("Failed to fetch skills", err);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const res = await rankingsAPI.getLeaderboard(selectedSkill || undefined);
        setRankings(res.data.rankings);
      } catch (err) {
        console.error("Failed to fetch rankings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [selectedSkill]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-amber-600" size={24} />;
    return <span className="text-lg font-semibold text-gray-600">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-yellow-50 border-yellow-200";
    if (rank === 2) return "bg-gray-50 border-gray-200";
    if (rank === 3) return "bg-amber-50 border-amber-200";
    return "bg-white";
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500">See how you rank against other developers</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="mb-8">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Skills (Global)</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
        </div>

        {/* Top 3 */}
        {rankings.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Second Place */}
            <div className={`order-1 md:order-2 ${getRankBg(2)} rounded-2xl p-6 border-2`}>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600 mb-3">
                  {rankings[1].userName[0]}
                </div>
                <Medal className="text-gray-400 -mt-6 mb-2" size={32} />
                <h3 className="font-semibold text-lg">{rankings[1].userName}</h3>
                <p className="text-gray-500 mb-3">Level {rankings[1].level || 5}</p>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-2xl font-bold text-gray-700">{rankings[1].score || rankings[1].avgScore || 0}</span>
                  <span className="text-gray-500 text-sm ml-1">pts</span>
                </div>
              </div>
            </div>

            {/* First Place */}
            <div className={`order-2 md:order-1 ${getRankBg(1)} rounded-2xl p-6 border-2 border-yellow-300`}>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-3 shadow-lg">
                  {rankings[0].userName[0]}
                </div>
                <Crown className="text-yellow-500 -mt-8 mb-2" size={40} />
                <h3 className="font-semibold text-xl">{rankings[0].userName}</h3>
                <p className="text-gray-500 mb-3">Level {rankings[0].level || 5}</p>
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-2 rounded-lg shadow-lg">
                  <span className="text-3xl font-bold text-white">{rankings[0].score || rankings[0].avgScore || 0}</span>
                  <span className="text-yellow-100 text-sm ml-1">pts</span>
                </div>
              </div>
            </div>

            {/* Third Place */}
            <div className={`order-3 ${getRankBg(3)} rounded-2xl p-6 border-2`}>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600 mb-3">
                  {rankings[2].userName[0]}
                </div>
                <Medal className="text-amber-600 -mt-6 mb-2" size={32} />
                <h3 className="font-semibold text-lg">{rankings[2].userName}</h3>
                <p className="text-gray-500 mb-3">Level {rankings[2].level || 4}</p>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-2xl font-bold text-gray-700">{rankings[2].score || rankings[2].avgScore || 0}</span>
                  <span className="text-gray-500 text-sm ml-1">pts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Rankings</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {rankings.slice(0, 20).map((entry) => (
              <div key={entry.userId} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {entry.userName[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{entry.userName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {entry.verified && <Star size={14} className="fill-blue-500 text-blue-500" />}
                    <span>Level {entry.level || 5}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
                    <TrendingUp size={18} />
                    {entry.score || entry.avgScore || 0}
                  </div>
                  <span className="text-sm text-gray-500">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {rankings.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rankings yet</h3>
            <p className="text-gray-500">Add skills and complete projects to appear on the leaderboard</p>
          </div>
        )}
      </main>
    </div>
  );
}