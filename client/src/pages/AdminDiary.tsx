import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, ChevronRight, ChevronLeft, Clock, Link2, Zap, AlertTriangle, Eye } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { type DailyLog, type User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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

    const { data: logs = [], isLoading } = useQuery<DiaryEntry[]>({ queryKey: ["/api/logs"] });
    const { data: interns = [] } = useQuery<User[]>({ queryKey: ["/api/interns"] });

    const getInternName = (id: string) => interns.find((i) => i.id === id)?.name || "Unknown";
    const allCourses: string[] = Array.from(new Set(logs.map((l) => l.course).filter(Boolean) as string[]));

    const filteredLogs = logs.filter((log) => {
        const nameMatch = getInternName(log.userId).toLowerCase().includes(filterName.toLowerCase());
        const courseMatch = filterCourse === "All Courses" || log.course === filterCourse;
        return nameMatch && courseMatch;
    });

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
    const pagedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <AppLayout>
            <div className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Work Logs</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Intern Diary</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Track daily work logs, learnings and challenges.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl h-11">
                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Entries</span>
                        <span className="text-lg font-black text-primary tabular-nums">{filteredLogs.length}</span>
                    </div>
                </header>

                <div className="glass rounded-xl border-white/10 shadow-xl overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:max-w-xs group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search by intern name..."
                                className="pl-9 h-9 bg-white/5 border-white/10 rounded-lg text-[10px] font-medium"
                                value={filterName}
                                onChange={(e) => { setFilterName(e.target.value); setPage(1); }}
                            />
                        </div>
                        <select
                            className="h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-[10px] font-black uppercase tracking-tight focus:outline-none w-full sm:w-[160px]"
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
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {["Intern", "Date", "Course", "Module", "Hours", "Progress", "Action"].map(h => (
                                        <th key={h} className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] first:pl-6 last:pr-6">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan={7} className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest animate-pulse">Accessing data vault...</td></tr>
                                ) : pagedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 first:pl-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                                                    {getInternName(log.userId).charAt(0)}
                                                </div>
                                                <span className="font-black text-[11px] text-foreground">{getInternName(log.userId)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[10px] font-bold opacity-70 whitespace-nowrap tabular-nums">
                                            {log.logDate ? format(new Date(log.logDate), "MMM dd, yyyy") : "N/A"}
                                        </td>
                                        <td className="p-4 text-[10px] font-black text-primary max-w-[120px] truncate">{log.course || "—"}</td>
                                        <td className="p-4 max-w-[140px]">
                                            {log.module ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {log.module.split(",").slice(0, 2).map((m) => (
                                                        <span key={m} className="text-[8px] font-bold px-1.5 py-0.5 bg-white/5 rounded border border-white/10 whitespace-nowrap">
                                                            {m.trim()}
                                                        </span>
                                                    ))}
                                                    {log.module.split(",").length > 2 && (
                                                        <span className="text-[8px] text-muted-foreground">+{log.module.split(",").length - 2}</span>
                                                    )}
                                                </div>
                                            ) : <span className="text-[10px] opacity-40">—</span>}
                                        </td>
                                        <td className="p-4 text-[10px] font-black tabular-nums">
                                            {log.hoursSpent ? `${log.hoursSpent}h` : "—"}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {log.keyLearnings && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/20 uppercase tracking-widest">
                                                        <Zap className="h-2 w-2" /> Learn
                                                    </span>
                                                )}
                                                {log.blockers && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 bg-orange-500/10 text-orange-400 rounded border border-orange-500/20 uppercase tracking-widest">
                                                        <AlertTriangle className="h-2 w-2" /> Block
                                                    </span>
                                                )}
                                                {log.submissionLink && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 uppercase tracking-widest">
                                                        <Link2 className="h-2 w-2" /> Link
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 last:pr-6">
                                            <Button size="sm" variant="ghost" onClick={() => setViewingLog(log)}
                                                className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary">
                                                <Eye className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && filteredLogs.length === 0 && (
                                    <tr><td colSpan={7} className="p-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">No diary entries found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest tabular-nums">
                            {filteredLogs.length} entries / Page {page} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-white/10"
                                disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-white/10"
                                disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail View Dialog */}
            <Dialog open={!!viewingLog} onOpenChange={(open) => !open && setViewingLog(null)}>
                <DialogContent className="max-w-xl border-none bg-transparent p-0 shadow-none w-[95vw] max-h-[90vh]">
                    <div className="bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass flex flex-col max-h-[90vh]">
                        <DialogHeader className="p-6 border-b border-white/5 bg-white/5 shrink-0">
                            <DialogTitle className="text-lg font-black uppercase tracking-tight">
                                {viewingLog ? getInternName(viewingLog.userId) : ""}'s Diary
                            </DialogTitle>
                            <DialogDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
                                {viewingLog?.logDate ? format(new Date(viewingLog.logDate), "EEEE, MMMM dd yyyy") : ""}
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Course</p>
                                        <p className="text-xs font-bold text-primary">{viewingLog?.course || "—"}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Module(s)</p>
                                        <p className="text-xs font-bold">{viewingLog?.module || "—"}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" /> Hours
                                        </p>
                                        <p className="text-xl font-black">{viewingLog?.hoursSpent || "0"}h</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2">Topics</p>
                                        {viewingLog?.topic ? (
                                            <div className="flex flex-wrap gap-1">
                                                {viewingLog.topic.split(",").map((t) => (
                                                    <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 bg-white/5 text-muted-foreground rounded border border-white/10">{t.trim()}</span>
                                                ))}
                                            </div>
                                        ) : <p className="text-xs text-muted-foreground">—</p>}
                                    </div>
                                </div>
                                {viewingLog?.workDescription && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{viewingLog.workDescription}</p>
                                    </div>
                                )}
                                {viewingLog?.keyLearnings && (
                                    <div className="bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-yellow-400 mb-2 flex items-center gap-1">
                                            <Zap className="h-3 w-3" /> Key Learnings
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{viewingLog.keyLearnings}</p>
                                    </div>
                                )}
                                {viewingLog?.blockers && (
                                    <div className="bg-orange-500/5 rounded-xl p-4 border border-orange-500/20">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-orange-400 mb-2 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Blockers & Challenges
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{viewingLog.blockers}</p>
                                    </div>
                                )}
                                {viewingLog?.submissionLink && (
                                    <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/20">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-1">
                                            <Link2 className="h-3 w-3" /> Submission Link
                                        </p>
                                        <a href={viewingLog.submissionLink} target="_blank" rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:underline break-all">{viewingLog.submissionLink}</a>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-6 pt-0 border-t border-white/5 shrink-0">
                            <Button onClick={() => setViewingLog(null)} className="w-full h-10 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white text-black hover:bg-white/90">
                                Close Entry
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}


