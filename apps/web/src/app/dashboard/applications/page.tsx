"use client";

import { useApplications, type Application, type TimelineEntry } from "@/hooks/useApplications";
import { ApplicationPageSkeleton } from "@/components/dashboard/ApplicationsSkeleton";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Trash2,
  X,
  ExternalLink,
  TrendingUp,
  FileText,
  AlertCircle,
  Clock,
  Search,
} from "lucide-react";

const COLUMNS = [
  { id: "SAVED", label: "Saved", color: "border-zinc-800 bg-zinc-900/10", text: "text-zinc-400", dot: "bg-zinc-500" },
  { id: "APPLIED", label: "Applied", color: "border-blue-900 bg-blue-950/10", text: "text-blue-400", dot: "bg-blue-500" },
  { id: "OA_RECEIVED", label: "Online Assessment", color: "border-amber-900 bg-amber-950/10", text: "text-amber-450", dot: "bg-amber-500" },
  { id: "INTERVIEW_SCHEDULED", label: "Interviewing", color: "border-teal-900 bg-teal-950/10", text: "text-teal-400", dot: "bg-teal-500" },
  { id: "OFFER_RECEIVED", label: "Offers", color: "border-emerald-900 bg-emerald-950/10", text: "text-emerald-400", dot: "bg-emerald-500" },
  { id: "REJECTED", label: "Rejected", color: "border-rose-900 bg-rose-950/10", text: "text-rose-450", dot: "bg-rose-500" },
  { id: "WITHDRAWN", label: "Withdrawn", color: "border-zinc-800 bg-zinc-950/20", text: "text-zinc-500", dot: "bg-zinc-650" }
];

export default function ApplicationsPage() {
  const {
    applications,
    stats,
    isLoading,
    fetchApplications,
    fetchStats,
    updateApplication,
    deleteApplication
  } = useApplications();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // UI drag/drop state
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [transitionErrorMessage, setTransitionErrorMessage] = useState<string | null>(null);

  // Selected Application for Detail Drawer
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isNotesEditing, setIsNotesEditing] = useState(false);
  const [isCoverLetterEditing, setIsCoverLetterEditing] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [transitionNote, setTransitionNote] = useState("");

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  useEffect(() => {
    void fetchApplications();
    void fetchStats();
  }, [fetchApplications, fetchStats]);

  if (isLoading) return <ApplicationPageSkeleton />;

  // Handle Drag Over
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData("text/plain", appId);
    setTransitionErrorMessage(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumnId(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const appId = e.dataTransfer.getData("text/plain") || draggedAppId;
    setDraggedAppId(null);

    if (!appId) return;

    const originalApp = applications.find((a) => a.id === appId);
    if (!originalApp || originalApp.status === targetStatus) return;

    try {
      await updateApplication(appId, {
        status: targetStatus,
        note: `Moved application to ${targetStatus.toLowerCase()} via board drag`
      });
    } catch (err: any) {
      setTransitionErrorMessage(err.message || "Invalid status transition");
      // Auto-clear error after 6 seconds
      setTimeout(() => {
        setTransitionErrorMessage((prev) => (prev === err.message ? null : prev));
      }, 6000);
    }
  };

  // Filters trigger
  const handleApplyFilters = () => {
    void fetchApplications({
      status: filterStatus || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setFilterStatus("");
    void fetchApplications({});
  };

  // Open detail panel
  const handleOpenDetail = (app: Application) => {
    setSelectedAppId(app.id);
    setNotesText(app.notes || "");
    setCoverLetterText(app.coverLetter || "");
    setTransitionNote("");
    setIsNotesEditing(false);
    setIsCoverLetterEditing(false);
    setTransitionErrorMessage(null);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppId) return;
    try {
      await updateApplication(selectedAppId, { notes: notesText });
      setIsNotesEditing(false);
    } catch (err: any) {
      alert(err.message || "Failed to update notes");
    }
  };

  const handleSaveCoverLetter = async () => {
    if (!selectedAppId) return;
    try {
      await updateApplication(selectedAppId, { coverLetter: coverLetterText });
      setIsCoverLetterEditing(false);
    } catch (err: any) {
      alert(err.message || "Failed to update cover letter");
    }
  };

  const handleManualStatusChange = async (targetStatus: string) => {
    if (!selectedAppId) return;
    try {
      await updateApplication(selectedAppId, {
        status: targetStatus,
        note: transitionNote.trim() || `Status updated manually to ${targetStatus.toLowerCase()}`
      });
      setTransitionNote("");
      setTransitionErrorMessage(null);
    } catch (err: any) {
      setTransitionErrorMessage(err.message || "Transition rejected by state machine");
    }
  };

  // Filter application cards by client-side search box (company/title)
  const filteredAppsBySearch = applications.filter((app) => {
    const term = searchQuery.toLowerCase();
    return (
      app.job.title.toLowerCase().includes(term) ||
      app.job.company.toLowerCase().includes(term) ||
      app.job.location.toLowerCase().includes(term)
    );
  });

  const renderTimeline = (timelineJson: string | TimelineEntry[]) => {
    let list: TimelineEntry[] = [];
    try {
      list = typeof timelineJson === "string" ? JSON.parse(timelineJson) : timelineJson;
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }

    return (
      <div className="relative border-l border-zinc-800 pl-4 ml-2 flex flex-col gap-4 py-2">
        {list.map((entry, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-zinc-700 ring-4 ring-zinc-950" />
            <div className="text-[10px] text-zinc-500 font-mono">
              {new Date(entry.at).toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-zinc-300 capitalize">{entry.status.replace("_", " ")}</div>
            <div className="text-xs text-zinc-400 mt-0.5">{entry.note}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-white relative">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Application Tracker</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your pipeline, track interview status, and view metrics.</p>
        </div>

        {/* Dynamic Analytics Stats Widgets */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-800">
            <div className="px-3 py-1 flex flex-col border-r border-zinc-800 last:border-0">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total</span>
              <span className="text-lg font-bold text-white">{applications.length}</span>
            </div>
            <div className="px-3 py-1 flex flex-col border-r border-zinc-800 last:border-0">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Active</span>
              <span className="text-lg font-bold text-blue-400">
                {applications.filter(a => !["SAVED", "REJECTED", "WITHDRAWN"].includes(a.status)).length}
              </span>
            </div>
            <div className="px-3 py-1 flex flex-col border-r border-zinc-800 last:border-0">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Offers</span>
              <span className="text-lg font-bold text-emerald-400">{stats.counts?.OFFER_RECEIVED || 0}</span>
            </div>
            <div className="px-3 py-1 flex flex-col">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Avg Interview</span>
              <span className="text-lg font-bold text-teal-400">
                {stats.avgTimeToInterviewDays > 0 ? `${stats.avgTimeToInterviewDays}d` : "—"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert Display */}
      {transitionErrorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6 rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-400 flex items-center gap-2"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>Transition rejected: {transitionErrorMessage}</span>
          <button onClick={() => setTransitionErrorMessage(null)} className="ml-auto hover:text-white">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Company/Title Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 text-zinc-650" size={15} />
            <input
              type="text"
              placeholder="Search company, title, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-350 focus:outline-none focus:border-zinc-750 placeholder-zinc-600"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-zinc-750"
          >
            <option value="">All Statuses</option>
            {COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {col.label}
              </option>
            ))}
          </select>

          {/* Date Pickers */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-zinc-750"
            />
            <span className="text-zinc-600 text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-zinc-750"
            />
          </div>

          {/* Buttons */}
          <button
            onClick={handleApplyFilters}
            className="text-xs bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="text-xs bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg font-medium hover:bg-zinc-750 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent select-none">
        {COLUMNS.map((col) => {
          const colApps = filteredAppsBySearch.filter((a) => a.status === col.id);
          const isOver = dragOverColumnId === col.id;

          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-80 rounded-xl border p-4 transition-all flex flex-col gap-3 min-h-[500px] ${
                isOver ? "border-zinc-600 bg-zinc-900/40 ring-1 ring-zinc-700" : "border-zinc-900/60 bg-zinc-900/10"
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                  <span className="text-xs font-semibold text-zinc-300">{col.label}</span>
                </div>
                <span className="text-[10px] text-zinc-550 font-mono bg-zinc-850 px-2 py-0.5 rounded">
                  {colApps.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[600px] pr-1">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    onClick={() => handleOpenDetail(app)}
                    className="group rounded-lg border border-zinc-850 bg-zinc-900/60 p-3 hover:border-zinc-700 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <h3 className="text-xs font-semibold text-white group-hover:text-zinc-200 truncate">
                      {app.job.title}
                    </h3>
                    <p className="text-[11px] text-zinc-450 truncate mt-0.5">{app.job.company}</p>

                    <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-550">
                      <span className="flex items-center gap-1">
                        <MapPin size={9} />
                        {app.job.location}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={9} />
                        {new Date(app.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}

                {colApps.length === 0 && (
                  <div className="flex-1 border border-dashed border-zinc-850/60 rounded-lg flex items-center justify-center p-6 text-center text-[10px] text-zinc-700">
                    Drag items here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Detail Slide-out Drawer */}
      <AnimatePresence>
        {selectedApp && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppId(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slideout Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-zinc-950 border-l border-zinc-900 z-50 overflow-y-auto flex flex-col p-6 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                    Application Details
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAppId(null)}
                  className="w-7 h-7 rounded-lg border border-zinc-850 flex items-center justify-center hover:bg-zinc-900 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Company & Role Details */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{selectedApp.job.title}</h3>
                    <p className="text-zinc-400 font-semibold text-sm mt-1">{selectedApp.job.company}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {selectedApp.job.location}
                      </span>
                      <span className="flex items-center gap-1 uppercase tracking-wider bg-zinc-900 px-2 py-0.5 rounded text-[10px] font-mono border border-zinc-850">
                        {selectedApp.job.jobType.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <a
                    href={selectedApp.job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center hover:bg-zinc-800 transition-all"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Status Transition & Note Form */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={13} className="text-zinc-550" />
                  <span className="text-xs font-semibold text-zinc-400">Transition Status</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {COLUMNS.map((col) => {
                    const isActive = selectedApp.status === col.id;
                    return (
                      <button
                        key={col.id}
                        onClick={() => handleManualStatusChange(col.id)}
                        className={`text-[10px] font-medium px-2.5 py-1 rounded transition-all ${
                          isActive
                            ? "bg-brand text-black font-semibold"
                            : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850"
                        }`}
                      >
                        {col.label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  placeholder="Optional status transition log note..."
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-xs text-zinc-350 focus:outline-none focus:border-zinc-800 placeholder-zinc-700"
                />
              </div>

              {/* Collapsible/Sections tabs */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Notes Section */}
                <div className="flex flex-col border-b border-zinc-900 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-zinc-500" />
                      <span className="text-xs font-semibold text-zinc-300">My Interview Notes</span>
                    </div>
                    <button
                      onClick={() => {
                        if (isNotesEditing) handleSaveNotes();
                        else setIsNotesEditing(true);
                      }}
                      className="text-xs font-medium text-white hover:underline flex items-center gap-1"
                    >
                      {isNotesEditing ? "Save" : "Edit"}
                    </button>
                  </div>

                  {isNotesEditing ? (
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      rows={5}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-xs text-zinc-350 focus:outline-none focus:border-zinc-800 placeholder-zinc-700"
                      placeholder="Write notes about your interview, questions asked, recruiter info..."
                    />
                  ) : (
                    <div className="text-xs text-zinc-450 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900 min-h-[50px] whitespace-pre-wrap">
                      {selectedApp.notes || "No notes written yet. Click edit to write thoughts, tasks, or follow-ups."}
                    </div>
                  )}
                </div>

                {/* Cover Letter Section */}
                <div className="flex flex-col border-b border-zinc-900 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-zinc-500" />
                      <span className="text-xs font-semibold text-zinc-300">Cover Letter</span>
                    </div>
                    <button
                      onClick={() => {
                        if (isCoverLetterEditing) handleSaveCoverLetter();
                        else setIsCoverLetterEditing(true);
                      }}
                      className="text-xs font-medium text-white hover:underline flex items-center gap-1"
                    >
                      {isCoverLetterEditing ? "Save" : "Edit"}
                    </button>
                  </div>

                  {isCoverLetterEditing ? (
                    <textarea
                      value={coverLetterText}
                      onChange={(e) => setCoverLetterText(e.target.value)}
                      rows={8}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-xs text-zinc-350 focus:outline-none focus:border-zinc-800 placeholder-zinc-700"
                      placeholder="Paste cover letter template or custom text utilized for this job application..."
                    />
                  ) : (
                    <div className="text-xs text-zinc-450 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900 min-h-[80px] whitespace-pre-wrap font-mono">
                      {selectedApp.coverLetter || "No cover letter saved. Click edit to paste templates."}
                    </div>
                  )}
                </div>

                {/* Timeline Log Section */}
                <div className="flex flex-col pb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={13} className="text-zinc-500" />
                    <span className="text-xs font-semibold text-zinc-300">History Timeline Log</span>
                  </div>
                  {renderTimeline(selectedApp.timeline)}
                </div>
              </div>

              {/* Danger Action Footer */}
              <div className="border-t border-zinc-900 pt-4 mt-6 flex justify-between items-center">
                <span className="text-[10px] text-zinc-600 font-mono">ID: {selectedApp.id}</span>
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this application tracker?")) {
                      await deleteApplication(selectedApp.id);
                      setSelectedAppId(null);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 font-medium transition-colors"
                >
                  <Trash2 size={13} />
                  Delete Tracker
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
