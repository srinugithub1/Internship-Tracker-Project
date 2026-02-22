import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Link2, BookOpen, Zap, AlertTriangle, Plus, Minus } from "lucide-react";

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

const PAGE_SIZE = 3;

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
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">

                    {/* Header Banner */}
                    <div className="mb-8 rounded-3xl bg-gradient-to-r from-primary via-purple-600 to-violet-700 p-8 flex items-center gap-5 shadow-2xl shadow-primary/30 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                        <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">My Daily Diary</h1>
                            <p className="text-white/70 text-sm mt-1 font-medium">Track your daily progress and reflections</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* ── LEFT: Submit Today's Entry ── */}
                        <div className="glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            {/* Form header */}
                            <div className="flex items-center gap-4 p-6 border-b border-white/10">
                                <div className="bg-primary/20 rounded-xl p-2.5">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-foreground">Submit Today's Entry</h2>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Log your daily work and learnings</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto">
                                {/* Date */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                        📅 Date
                                    </label>
                                    <input
                                        type="date"
                                        value={logDate}
                                        onChange={(e) => setLogDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>

                                {/* Course Dropdown */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                        🎓 Course
                                    </label>
                                    <select
                                        value={course}
                                        onChange={(e) => { setCourse(e.target.value); setSelectedModules([]); }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    >
                                        <option value="" className="bg-background text-muted-foreground">Select a course...</option>
                                        {Object.keys(COURSE_MODULE_MAP).map((c) => (
                                            <option key={c} value={c} className="bg-background">{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Module dual-list */}
                                {course && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                            📚 Module
                                        </label>
                                        <p className="text-[10px] text-muted-foreground mb-2">Select Modules</p>
                                        <div className="flex gap-2 items-stretch">
                                            {/* Available */}
                                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-white/10">
                                                    Available
                                                </div>
                                                <div className="max-h-32 overflow-y-auto">
                                                    {unselectedModules.length === 0 ? (
                                                        <p className="text-[10px] text-muted-foreground px-3 py-2">All selected</p>
                                                    ) : unselectedModules.map((mod) => (
                                                        <button
                                                            key={mod}
                                                            onClick={() => addModule(mod)}
                                                            className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 hover:text-primary flex items-center justify-between group transition-colors"
                                                        >
                                                            <span className="truncate text-muted-foreground group-hover:text-primary">{mod}</span>
                                                            <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 shrink-0 text-primary" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                                                <ChevronRight className="h-4 w-4" />
                                                <ChevronLeft className="h-4 w-4" />
                                            </div>

                                            {/* Selected */}
                                            <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl overflow-hidden">
                                                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary border-b border-primary/10">
                                                    Selected
                                                </div>
                                                <div className="max-h-32 overflow-y-auto">
                                                    {selectedModules.length === 0 ? (
                                                        <p className="text-[10px] text-muted-foreground px-3 py-2">None selected</p>
                                                    ) : selectedModules.map((mod) => (
                                                        <button
                                                            key={mod}
                                                            onClick={() => removeModule(mod)}
                                                            className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 hover:text-red-400 flex items-center justify-between group transition-colors"
                                                        >
                                                            <span className="truncate text-primary group-hover:text-red-400">{mod}</span>
                                                            <Minus className="h-3 w-3 opacity-0 group-hover:opacity-100 shrink-0 text-red-400" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Topics */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                        🏷 Topics
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Enter topics covered..."
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                    />
                                </div>

                                {/* Hours + Submission Link (side by side) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                            ⏱ Hours Worked
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={hoursSpent}
                                            onChange={(e) => setHoursSpent(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                            🔗 Submission Link
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={submissionLink}
                                            onChange={(e) => setSubmissionLink(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                        🖊 Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe what you worked on today..."
                                        value={workDescription}
                                        onChange={(e) => setWorkDescription(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                    />
                                </div>

                                {/* Key Learnings */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                        <Zap className="h-3 w-3 text-yellow-400" /> Key Learnings
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="What did you learn today?"
                                        value={keyLearnings}
                                        onChange={(e) => setKeyLearnings(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                    />
                                </div>

                                {/* Blockers */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                        <AlertTriangle className="h-3 w-3 text-orange-400" /> Blockers & Challenges
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Any challenges or blockers?"
                                        value={blockers}
                                        onChange={(e) => setBlockers(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="p-6 border-t border-white/10">
                                <Button
                                    className="w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 font-black py-5 text-base shadow-xl shadow-primary/30"
                                    onClick={handleSubmit}
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? "Saving..." : "Submit Today's Entry"}
                                </Button>
                            </div>
                        </div>

                        {/* ── RIGHT: Previous Entries ── */}
                        <div className="flex flex-col gap-5">
                            <div className="glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                                <div className="flex items-center gap-4 p-6 border-b border-white/10">
                                    <div className="bg-green-500/20 rounded-xl p-2.5">
                                        <Clock className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground">Previous Entries</h2>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Your work history and progress</p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                                    {isLoading && (
                                        <p className="text-center text-muted-foreground text-sm animate-pulse py-12">Loading entries...</p>
                                    )}
                                    {!isLoading && logs.length === 0 && (
                                        <div className="text-center py-16 text-muted-foreground">
                                            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm font-medium">No diary entries yet.</p>
                                            <p className="text-xs mt-1 opacity-60">Start by submitting today's entry!</p>
                                        </div>
                                    )}
                                    {pagedLogs.map((log) => (
                                        <div key={log.id} className="glass rounded-2xl border border-white/10 p-4 hover:border-primary/20 transition-all">
                                            {/* Top row: date + hours */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                                                    📅 {log.logDate}
                                                </span>
                                                {log.hoursSpent && (
                                                    <span className="flex items-center gap-1 text-[11px] font-black text-muted-foreground uppercase">
                                                        <Clock className="h-3 w-3" />
                                                        {log.hoursSpent}h
                                                    </span>
                                                )}
                                            </div>

                                            {/* Course + Module */}
                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                {log.course && (
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                                        <span className="font-black text-[9px] text-muted-foreground">COURSE </span>
                                                        <span className="text-foreground font-bold">{log.course}</span>
                                                    </div>
                                                )}
                                                {log.module && (
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest ml-auto">
                                                        <span className="font-black text-[9px] text-muted-foreground">MODULE </span>
                                                        <span className="text-foreground font-bold">{log.module}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Topics as tags */}
                                            {log.topic && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {log.topic.split(",").map((t) => (
                                                        <span key={t} className="text-[9px] font-bold px-2 py-0.5 bg-secondary text-muted-foreground rounded-full border border-white/10">
                                                            + {t.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Key Learnings */}
                                            {log.keyLearnings && (
                                                <div className="mb-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400 mb-1 flex items-center gap-1">
                                                        <Zap className="h-2.5 w-2.5" /> KEY LEARNINGS
                                                    </p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{log.keyLearnings}</p>
                                                </div>
                                            )}

                                            {/* Blockers */}
                                            {log.blockers && (
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-1 flex items-center gap-1">
                                                        <AlertTriangle className="h-2.5 w-2.5" /> BLOCKERS
                                                    </p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{log.blockers}</p>
                                                </div>
                                            )}

                                            {/* Submission link */}
                                            {log.submissionLink && (
                                                <a href={log.submissionLink} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-[10px] text-primary hover:underline mt-2">
                                                    <Link2 className="h-3 w-3" /> Submission
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {logs.length > 0 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl gap-1 text-xs font-bold"
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" /> Previous
                                        </Button>
                                        <span className="text-xs font-black text-muted-foreground">
                                            {page} of {totalPages}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl gap-1 text-xs font-bold"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        >
                                            Next <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
