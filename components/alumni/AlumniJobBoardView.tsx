'use client';

import React, { useState, useMemo } from 'react';
import { AlumniJob } from '@/lib/alumniTypes';
import { 
  Briefcase, MapPin, Clock, Plus, ExternalLink, 
  Mail, Building, CheckCircle2, Search, Filter, 
  X, AlertCircle, Sparkles, Send
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface AlumniJobBoardViewProps {
  jobs: AlumniJob[];
  userProfile?: any;
  onJobPosted?: () => void;
}

export function AlumniJobBoardView({ jobs, userProfile, onJobPosted }: AlumniJobBoardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<AlumniJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Job Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    organization: userProfile?.organization || '',
    location: userProfile?.city ? `${userProfile.city}, ${userProfile.country}` : 'Dhaka, Bangladesh',
    employmentType: 'Full-time' as AlumniJob['employmentType'],
    category: 'Education & Teaching',
    description: '',
    requirements: '',
    applicationMethod: 'email' as 'email' | 'url',
    applicationEmailOrUrl: userProfile?.email || '',
    deadline: '2026-10-30',
    salary: 'Negotiable'
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (job.status === 'rejected' || job.status === 'closed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = job.title?.toLowerCase().includes(q);
        const matchOrg = job.organization?.toLowerCase().includes(q);
        const matchLoc = job.location?.toLowerCase().includes(q);
        const matchDesc = job.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchLoc && !matchDesc) return false;
      }

      if (selectedType !== 'all' && job.employmentType !== selectedType) {
        return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedType]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: AlumniJob = {
        id: '',
        title: jobForm.title,
        organization: jobForm.organization,
        location: jobForm.location,
        employmentType: jobForm.employmentType,
        category: jobForm.category,
        description: jobForm.description,
        requirements: jobForm.requirements,
        applicationMethod: jobForm.applicationMethod,
        applicationEmailOrUrl: jobForm.applicationEmailOrUrl,
        deadline: jobForm.deadline,
        salary: jobForm.salary,
        postedBy: userProfile?.id || 'alumni-user',
        postedByName: userProfile?.fullName || 'Honored Alumni Member',
        postedByAlumniId: userProfile?.alumniId || '',
        status: 'approved',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'alumni_jobs'), payload);

      setShowPostModal(false);
      setJobForm({
        title: '',
        organization: '',
        location: 'Dhaka, Bangladesh',
        employmentType: 'Full-time',
        category: 'Education & Teaching',
        description: '',
        requirements: '',
        applicationMethod: 'email',
        applicationEmailOrUrl: '',
        deadline: '2026-10-30',
        salary: 'Negotiable'
      });

      if (onJobPosted) onJobPosted();
      alert('Job listing published successfully!');
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to publish job. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Post CTA */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
            Alumni Career & Opportunity Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#064e3b]">
            Islamic Research & Professional Career Board
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Verified job openings, academic positions, and career opportunities provided by alumni and partner institutions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPostModal(true)}
          className="px-6 py-3.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Post New Job Circular
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, organization, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
          >
            <option value="all">All Employment Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {job.employmentType}
                </span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {job.category || 'General'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-xs text-[#064e3b] font-semibold mt-0.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  {job.organization}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Deadline: <strong>{job.deadline}</strong></span>
                </div>
                {job.salary && (
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50/60 p-2 rounded-xl">
                    Salary: {job.salary}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {job.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Posted by: {job.postedByName}
              </span>

              <button
                type="button"
                onClick={() => setSelectedJob(job)}
                className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                Apply Details
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-linear-to-r from-[#064e3b] to-[#043e2f] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase">{selectedJob.organization}</span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  {selectedJob.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p><span className="text-slate-400">Employment Type:</span> <strong>{selectedJob.employmentType}</strong></p>
                <p><span className="text-slate-400">Location:</span> <strong>{selectedJob.location}</strong></p>
                <p><span className="text-slate-400">Salary:</span> <strong>{selectedJob.salary || 'Negotiable'}</strong></p>
                <p><span className="text-slate-400">Deadline:</span> <strong>{selectedJob.deadline}</strong></p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Job Description & Responsibilities:</h4>
                <p className="leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Qualifications & Requirements:</h4>
                  <p className="leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{selectedJob.requirements}</p>
                </div>
              )}

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <h4 className="font-bold text-[#064e3b]">How to Apply:</h4>
                {selectedJob.applicationMethod === 'email' ? (
                  <p>
                    Please send your comprehensive CV and academic credentials to the following email address:<br/>
                    <a href={`mailto:${selectedJob.applicationEmailOrUrl}`} className="font-bold text-emerald-800 underline text-sm mt-1 block">
                      {selectedJob.applicationEmailOrUrl}
                    </a>
                  </p>
                ) : (
                  <p>
                    Complete your application directly via the official online link:<br/>
                    <a href={selectedJob.applicationEmailOrUrl} target="_blank" rel="noreferrer" className="font-bold text-emerald-800 underline text-sm mt-1 block break-all">
                      {selectedJob.applicationEmailOrUrl}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-linear-to-r from-[#064e3b] to-[#043e2f] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif font-bold text-base text-amber-300">
                  Post New Job Circular
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-6 sm:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g., Senior Arabic Instructor / Islamic Research Officer"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Institute *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.organization}
                    onChange={(e) => setJobForm({ ...jobForm, organization: e.target.value })}
                    placeholder="Organization Name"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Location *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type *</label>
                  <select
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value as any })}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Application Deadline *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    placeholder="2026-10-30"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  rows={2}
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Briefly describe responsibilities..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requirements & Qualifications</label>
                <textarea
                  rows={2}
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  placeholder="Educational background and required skills..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Application Method *</label>
                  <select
                    value={jobForm.applicationMethod}
                    onChange={(e) => setJobForm({ ...jobForm, applicationMethod: e.target.value as any })}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                  >
                    <option value="email">Via Email</option>
                    <option value="url">Via Online Link (URL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email address or URL *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.applicationEmailOrUrl}
                    onChange={(e) => setJobForm({ ...jobForm, applicationEmailOrUrl: e.target.value })}
                    placeholder="hr@example.com or https://..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Posting...' : 'Publish Job Listing'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
