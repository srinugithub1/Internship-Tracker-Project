import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, ChevronRight, ChevronLeft, Clock, Link2, Zap, AlertTriangle, Eye, X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { type DailyLog, type User } from "@shared/schema";

type DiaryEntry = DailyLog & {
    keyLearnings?: string | null;
    blockers?: string | null;
    submissionLink?: string | null;
};

const PAGE_SIZE = 8;

export default function AdminDiary() {
    const [filterName, setFilterName] = useState("");
    const [filterCourse, setFilterCourse] = useState("All Courses");
    const [viewingLog, setViewingLog] = useState<DiaryEntry | null>(null);
    const [page, setPage] = useState(1);

    const { data: logs = [], isLoading } = useQuery<DiaryEntry[]>({
        queryKey: ["/api/logs"],
    });

    const { data: interns = [] } = useQuery<User[]>({
        queryKey: ["/api/interns"],
    });

    const getInternName = (id: string) =>
        interns.find((i) => i.id === id)?.name || "Unknown";

    const allCourses: string[] = Array.from(
        new Set(logs.map((l) => l.course).filter(Boolean) as string[])
    );

    const filteredLogs = logs.filter((log) => {
        const nameMatch = getInternName(log.userId).toLowerCase().includes(filterName.toLowerCase());
        const courseMatch = filterCourse === "All Courses" || log.course === filterCourse;
        return nameMatch && courseMatch;
    });

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
    const pagedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">

                    {/* Header */}
                    <header className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground">
                                Intern Diary
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">
                                Track daily work logs, learnings and challenges of all interns
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-secondary/50 px-4 py-2 rounded-2xl border border-white/20 shadow-sm flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Entries:</span>
                                <span className="text-lg font-black text-primary">{filteredLogs.length}</span>
                            </div>
                        </div>
                    </header>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 glass rounded-2xl border-white/10 shadow-xl shadow-primary/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by intern name..."
                                className="pl-10 h-11 bg-white/5 border-white/10 rounded-xl"
                                value={filterName}
                                onChange={(e) => { setFilterName(e.target.value); setPage(1); }}
                            />
                        </div>
                        <select
                            className="h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-muted-foreground"
                            value={filterCourse}
                            onChange={(e) => { setFilterCourse(e.target.value); setPage(1); }}
                        >
                            <option value="All Courses" className="bg-background">All Courses</option>
                            {allCourses.map((c) => (
                                <option key={c} value={c} className="bg-background">{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="glass rounded-2xl border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="p-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Intern</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Date</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Course</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Module</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Hours</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Progress</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={7} className="p-20 text-center text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Accessing Data...</td></tr>
                                    ) : pagedLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-[10px]">
                                                        {getInternName(log.userId).charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-sm">{getInternName(log.userId)}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-bold opacity-80 whitespace-nowrap">
                                                {log.logDate ? format(new Date(log.logDate), "MMM dd, yyyy") : "N/A"}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-primary max-w-[120px] truncate">{log.course || "—"}</td>
                                            <td className="p-4 text-sm font-medium max-w-[140px]">
                                                {log.module ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {log.module.split(",").slice(0, 2).map((m) => (
                                                            <span key={m} className="text-[9px] font-bold px-2 py-0.5 bg-secondary rounded-full border border-white/10 whitespace-nowrap">
                                                                {m.trim()}
                                                            </span>
                                                        ))}
                                                        {log.module.split(",").length > 2 && (
                                                            <span className="text-[9px] text-muted-foreground">+{log.module.split(",").length - 2} more</span>
                                                        )}
                                                    </div>
                                                ) : "—"}
                                            </td>
                                            <td className="p-4 text-sm font-black">
                                                {log.hoursSpent ? `${log.hoursSpent}h` : "—"}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    {log.keyLearnings && (
                                                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20">
                                                            <Zap className="h-2.5 w-2.5" /> Learnings
                                                        </span>
                                                    )}
                                                    {log.blockers && (
                                                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
                                                            <AlertTriangle className="h-2.5 w-2.5" /> Blockers
                                                        </span>
                                                    )}
                                                    {log.submissionLink && (
                                                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                                                            <Link2 className="h-2.5 w-2.5" /> Link
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setViewingLog(log)}
                                                    className="h-8 w-8 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                                                    title="View full entry"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && filteredLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-20 text-center text-muted-foreground italic font-medium">
                                                No diary entries found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Total Records: {filteredLogs.length}
                            </p>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline" size="sm"
                                    className="h-8 rounded-xl px-4 border-white/10 bg-white/5"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <span className="text-xs font-black uppercase tracking-widest">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline" size="sm"
                                    className="h-8 rounded-xl px-4 border-white/10 bg-white/5"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Detail View Dialog ── */}
            {viewingLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass border border-white/10 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 glass z-10">
                            <div>
                                <h2 className="text-xl font-black text-foreground">
                                    {getInternName(viewingLog.userId)}'s Diary
                                </h2>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {viewingLog.logDate ? format(new Date(viewingLog.logDate), "EEEE, MMMM dd yyyy") : ""}
                                </p>
                            </div>
                            <Button
                                variant="ghost" size="sm"
                                onClick={() => setViewingLog(null)}
                                className="rounded-xl h-9 w-9 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Course + Module */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Course</p>
                                    <p className="text-sm font-bold text-primary">{viewingLog.course || "—"}</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Module(s)</p>
                                    <p className="text-sm font-bold">{viewingLog.module || "—"}</p>
                                </div>
                            </div>

                            {/* Hours + Topics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" /> Hours Worked
                                    </p>
                                    <p className="text-2xl font-black text-foreground">{viewingLog.hoursSpent || "0"}h</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Topics</p>
                                    {viewingLog.topic ? (
                                        <div className="flex flex-wrap gap-1">
                                            {viewingLog.topic.split(",").map((t) => (
                                                <span key={t} className="text-[9px] font-bold px-2 py-0.5 bg-secondary text-muted-foreground rounded-full border border-white/10">
                                                    {t.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    ) : <p className="text-xs text-muted-foreground">—</p>}
                                </div>
                            </div>

                            {/* Description */}
                            {viewingLog.workDescription && (
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{viewingLog.workDescription}</p>
                                </div>
                            )}

                            {/* Key Learnings */}
                            {viewingLog.keyLearnings && (
                                <div className="bg-yellow-500/5 rounded-2xl p-4 border border-yellow-500/20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400 mb-2 flex items-center gap-1">
                                        <Zap className="h-3 w-3" /> Key Learnings
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{viewingLog.keyLearnings}</p>
                                </div>
                            )}

                            {/* Blockers */}
                            {viewingLog.blockers && (
                                <div className="bg-orange-500/5 rounded-2xl p-4 border border-orange-500/20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-2 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Blockers & Challenges
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{viewingLog.blockers}</p>
                                </div>
                            )}

                            {/* Submission Link */}
                            {viewingLog.submissionLink && (
                                <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-1">
                                        <Link2 className="h-3 w-3" /> Submission Link
                                    </p>
                                    <a
                                        href={viewingLog.submissionLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-400 hover:underline break-all"
                                    >
                                        {viewingLog.submissionLink}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
