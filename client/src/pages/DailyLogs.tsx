import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Link2, BookOpen, Zap, AlertTriangle, Plus, Minus, Calendar } from "lucide-react";

// ─── COURSE + MODULE DATA ─────────────────────────────────────────
const COURSE_MODULE_MAP: Record<string, string[]> = {
    "Bharat Unnati AI Fellowship": [
        "CodeXpert", "Expertpedia AI", "Generative AI...", "Agentic AI Int...",
    ],
    "Full Stack Development": [
        "HTML & CSS", "JavaScript", "React.js", "Node.js", "PostgreSQL",
    ],
    "Python & Data Science": [
        "Python Basics", "Pandas", "NumPy", "Machine Learning", "Deep Learning",
    ],
    "UI/UX Design": [
        "Figma", "Design Thinking", "Prototyping", "User Research",
    ],
};

type DiaryEntry = {
    id: string;
    logDate: string;
    course?: string | null;
    module?: string | null;
    topic?: string | null;
    hoursSpent?: string | null;
    submissionLink?: string | null;
    workDescription?: string | null;
    keyLearnings?: string | null;
    blockers?: string | null;
};

const PAGE_SIZE = 5;

export default function DailyLogs() {
    const { toast } = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Form state
    const [logDate, setLogDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [course, setCourse] = useState("");
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [topic, setTopic] = useState("");
    const [hoursSpent, setHoursSpent] = useState("0.0");
    const [submissionLink, setSubmissionLink] = useState("");
    const [workDescription, setWorkDescription] = useState("");
    const [keyLearnings, setKeyLearnings] = useState("");
    const [blockers, setBlockers] = useState("");

    // Previous entries pagination
    const [page, setPage] = useState(1);

    const availableModules = course ? (COURSE_MODULE_MAP[course] || []) : [];

    const { data: logs = [], isLoading } = useQuery<DiaryEntry[]>({
        queryKey: [`/api/logs/${user.id}`],
    });

    const mutation = useMutation({
        mutationFn: (data: any) => apiRequest("POST", "/api/logs", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/logs/${user.id}`] });
            toast({ title: "Diary Saved!", description: "Today's entry has been recorded." });
            // Reset form
            setLogDate(format(new Date(), "yyyy-MM-dd"));
            setCourse("");
            setSelectedModules([]);
            setTopic("");
            setHoursSpent("0.0");
            setSubmissionLink("");
            setWorkDescription("");
            setKeyLearnings("");
            setBlockers("");
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save diary entry.", variant: "destructive" });
        },
    });

    const handleSubmit = () => {
        mutation.mutate({
            userId: user.id,
            logDate,
            course,
            module: selectedModules.join(", "),
            topic,
            hoursSpent,
            submissionLink,
            workDescription,
            keyLearnings,
            blockers,
        });
    };

    // Module dual-list handlers
    const addModule = (mod: string) => {
        if (!selectedModules.includes(mod)) setSelectedModules([...selectedModules, mod]);
    };
    const removeModule = (mod: string) => {
        setSelectedModules(selectedModules.filter((m) => m !== mod));
    };
    const unselectedModules = availableModules.filter((m) => !selectedModules.includes(m));

    // Pagination
    const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
    const pagedLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Standardized Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <BookOpen className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Logbook</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Daily Diary</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Track your daily progress and key learnings.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ── LEFT: Submit Today's Entry ── */}
                    <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-[700px]">
                        {/* Form header */}
                        <div className="flex items-center gap-4 p-5 border-b border-white/10 bg-white/5">
                            <div className="bg-primary/20 rounded-xl p-2">
                                <Plus className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">New Entry</h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Log today's work</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
                            {/* Date */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    <Calendar className="h-3 w-3 text-primary" /> Log Date
                                </label>
                                <input
                                    type="date"
                                    value={logDate}
                                    onChange={(e) => setLogDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>

                            {/* Course Dropdown */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    <Zap className="h-3 w-3 text-primary" /> Target Course
                                </label>
                                <select
                                    value={course}
                                    onChange={(e) => { setCourse(e.target.value); setSelectedModules([]); }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer font-medium"
                                >
                                    <option value="" className="bg-background">Select Course...</option>
                                    {Object.keys(COURSE_MODULE_MAP).map((c) => (
                                        <option key={c} value={c} className="bg-background">{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Module selection */}
                            {course && (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                        Module Mapping
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Available */}
                                        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden h-40 flex flex-col">
                                            <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground border-b border-white/10 bg-white/5">
                                                Available
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                {unselectedModules.length === 0 ? (
                                                    <p className="p-4 text-[10px] text-muted-foreground italic">All mapped</p>
                                                ) : unselectedModules.map((mod) => (
                                                    <button
                                                        key={mod}
                                                        onClick={() => addModule(mod)}
                                                        className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 transition-colors flex items-center justify-between group"
                                                    >
                                                        <span className="truncate">{mod}</span>
                                                        <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Selected */}
                                        <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl overflow-hidden h-40 flex flex-col">
                                            <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-primary border-b border-primary/10 bg-primary/10">
                                                Selected
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                {selectedModules.length === 0 ? (
                                                    <p className="p-4 text-[10px] text-muted-foreground italic">None</p>
                                                ) : selectedModules.map((mod) => (
                                                    <button
                                                        key={mod}
                                                        onClick={() => removeModule(mod)}
                                                        className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 transition-colors flex items-center justify-between group"
                                                    >
                                                        <span className="text-primary group-hover:text-red-400">{mod}</span>
                                                        <Minus className="h-3 w-3 opacity-100 text-primary group-hover:text-red-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Topics */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    Topics Covered
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Enter topics..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                />
                            </div>

                            {/* Hours + Link */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                        Time Spent (Hrs)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={hoursSpent}
                                        onChange={(e) => setHoursSpent(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-black tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                        Artifact Link
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="GitHub / Drive link"
                                        value={submissionLink}
                                        onChange={(e) => setSubmissionLink(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    Work Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Summary of today's work..."
                                    value={workDescription}
                                    onChange={(e) => setWorkDescription(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                />
                            </div>

                            {/* Key Learnings + Blockers */}
                            <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-yellow-400 ml-1">
                                        <Zap className="h-3 w-3" /> Key Insights
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="What did you discover today?"
                                        value={keyLearnings}
                                        onChange={(e) => setKeyLearnings(e.target.value)}
                                        className="w-full bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/30 resize-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-orange-400 ml-1">
                                        <AlertTriangle className="h-3 w-3" /> Impediments
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Any technical blockers?"
                                        value={blockers}
                                        onChange={(e) => setBlockers(e.target.value)}
                                        className="w-full bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="p-5 border-t border-white/10 bg-white/5">
                            <Button
                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black text-sm shadow-lg shadow-primary/20 uppercase tracking-widest"
                                onClick={handleSubmit}
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? "Persisting Data..." : "Finalize Entry"}
                            </Button>
                        </div>
                    </div>

                    {/* ── RIGHT: Previous Entries ── */}
                    <div className="flex flex-col gap-5 h-[700px]">
                        <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col flex-1">
                            <div className="flex items-center gap-4 p-5 border-b border-white/10 bg-white/5">
                                <div className="bg-primary/20 rounded-xl p-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Audit History</h2>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Verified diary submissions</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {isLoading && (
                                    <div className="flex flex-col items-center justify-center py-20 animate-pulse opacity-40">
                                        <BookOpen className="h-10 w-10 mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Hydrating state...</p>
                                    </div>
                                )}
                                {!isLoading && logs.length === 0 && (
                                    <div className="text-center py-20 opacity-30">
                                        <BookOpen className="h-10 w-10 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No entries recorded</p>
                                    </div>
                                )}
                                {pagedLogs.map((log) => (
                                    <div key={log.id} className="glass rounded-2xl border border-white/5 p-4 hover:border-primary/20 transition-all group bg-white/[0.02]">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 tabular-nums">
                                                {format(new Date(log.logDate), "MMM dd, yyyy")}
                                            </span>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40 flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" /> {log.hoursSpent}h
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                                            {log.course && (
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                    Course: <span className="text-foreground">{log.course}</span>
                                                </p>
                                            )}
                                        </div>

                                        {log.module && (
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {log.module.split(",").map((m) => (
                                                    <span key={m} className="text-[8px] font-black uppercase px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-muted-foreground">
                                                        {m.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            {log.keyLearnings && (
                                                <div className="bg-yellow-500/5 border-l-2 border-yellow-500/30 p-2.5 rounded-r-xl">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-yellow-500/60 mb-1">Key Insights</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">{log.keyLearnings}</p>
                                                </div>
                                            )}
                                            {log.blockers && (
                                                <div className="bg-orange-500/5 border-l-2 border-orange-500/30 p-2.5 rounded-r-xl">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-orange-500/60 mb-1">Blockers</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">{log.blockers}</p>
                                                </div>
                                            )}
                                        </div>

                                        {log.submissionLink && (
                                            <div className="mt-4 pt-3 border-t border-white/5">
                                                <a href={log.submissionLink} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                                    <Link2 className="h-3 w-3" /> View Submitted Artifact
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {logs.length > 0 && (
                                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-xl px-3 border-white/10 text-[10px] uppercase font-black"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground tabular-nums">
                                        Page {page} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-xl px-3 border-white/10 text-[10px] uppercase font-black"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    >
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
