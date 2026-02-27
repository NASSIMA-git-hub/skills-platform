import { useEffect, useState } from "react";
import { jobsAPI, applicationsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { JobOpening } from "../types";
import { Briefcase, DollarSign, MapPin } from "lucide-react";

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [myApplications, setMyApplications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    if (user?.role === "STUDENT") {
      fetchApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const res = await jobsAPI.getAll();
      setJobs(res.data.jobs);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await applicationsAPI.getMy();
      setMyApplications(res.data.applications.map(a => a.jobId));
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await applicationsAPI.apply({ jobId });
      setMyApplications([...myApplications, jobId]);
    } catch (err) {
      console.error("Failed to apply", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Job Openings</h1>
        
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.company.name}</p>
                </div>
                {user?.role === "STUDENT" && (
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={myApplications.includes(job.id)}
                    className={`${
                      myApplications.includes(job.id)
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : "btn-primary"
                    }`}
                  >
                    {myApplications.includes(job.id) ? "Applied" : "Apply Now"}
                  </button>
                )}
              </div>
              
              <p className="mt-3 text-gray-700">{job.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <DollarSign size={16} />
                  ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={16} />
                  {job.minExperience}+ years
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {job.company.industry}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
