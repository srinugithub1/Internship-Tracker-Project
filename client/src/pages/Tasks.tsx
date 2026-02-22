import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, Circle, Clock, AlertCircle, Link2, FileText, MessageSquare, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Task = {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    dueDate?: string | null;
    priority?: string | null;
    todayProgress?: string | null;
    submissionLink?: string | null;
    remarks?: string | null;
};

const STATUSES = ["assigned", "in_progress", "completed"];
const STATUS_LABELS: Record<string, string> = {
    assigned: "Assigned",
    in_progress: "In Progress",
    completed: "Completed",
};

function StatusStepper({ current }: { current: string }) {
    const idx = STATUSES.indexOf(current);
    return (
        <div className="flex items-center justify-center gap-0 mb-6">
            {STATUSES.map((s, i) => {
                const done = i <= idx;
                const active = i === idx;
                return (
                    <div key={s} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all
                                ${done
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                                    : "bg-secondary border-white/20 text-muted-foreground"}`}>
                                {i === 2 && done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5
                                ${active ? "text-primary" : done ? "text-primary/70" : "text-muted-foreground"}`}>
                                {STATUS_LABELS[s]}
                            </span>
                        </div>
                        {i < STATUSES.length - 1 && (
                            <div className={`w-16 h-0.5 mb-4 mx-1 transition-all ${i < idx ? "bg-primary" : "bg-white/10"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function UpdateModal({
    task,
    onClose,
}: {
    task: Task;
    onClose: () => void;
}) {
    const { toast } = useToast();
    const [status, setStatus] = useState(task.status);
    const [todayProgress, setTodayProgress] = useState(task.todayProgress || "");
    const [submissionLink, setSubmissionLink] = useState(task.submissionLink || "");
    const [remarks, setRemarks] = useState(task.remarks || "");

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const updateMutation = useMutation({
        mutationFn: () =>
            apiRequest("PATCH", `/api/tasks/${task.id}/progress`, {
                status,
                todayProgress,
                submissionLink,
                remarks,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/tasks/${user.id}`] });
            toast({ title: "Updated!", description: "Task progress saved successfully." });
            onClose();
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.message || "Failed to save changes.", variant: "destructive" });
        },
    });

    return (
        <DialogContent className="max-w-lg w-full bg-[#1a1b2e] border border-white/10 rounded-2xl p-0 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-black text-foreground">{task.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{task.description}</p>
            </div>

            {/* Stepper */}
            <div className="px-6 pt-5">
                <StatusStepper current={status} />

                {/* Status Buttons */}
                <div className="flex gap-2 mb-5">
                    {STATUSES.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl border transition-all
                                ${status === s
                                    ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                                    : "bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40"}`}>
                            {STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form fields */}
            <div className="px-6 pb-2 space-y-4 max-h-[320px] overflow-y-auto">
                {/* Today's Progress */}
                <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        <FileText className="h-3.5 w-3.5 text-primary" /> Today's Progress
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Describe your accomplishments today..."
                        value={todayProgress}
                        onChange={(e) => setTodayProgress(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                    />
                </div>

                {/* Submission Link */}
                <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        <Link2 className="h-3.5 w-3.5 text-primary" /> Submission Link
                    </label>
                    <input
                        type="url"
                        placeholder="https://example.com/submission"
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                {/* Additional Remarks */}
                <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" /> Additional Remarks
                    </label>
                    <textarea
                        rows={2}
                        placeholder="Any additional notes..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-white/10">
                <Button variant="outline" className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10" onClick={onClose}>
                    ✕ Cancel
                </Button>
                <Button
                    className="flex-1 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/30"
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </DialogContent>
    );
}

const priorityColors: Record<string, { dot: string; badge: string }> = {
    high: { dot: "bg-red-500", badge: "text-red-400 bg-red-500/10 border-red-500/20" },
    medium: { dot: "bg-yellow-500", badge: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    low: { dot: "bg-green-500", badge: "text-green-400 bg-green-500/10 border-green-500/20" },
};
const statusColors: Record<string, string> = {
    assigned: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    in_progress: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    completed: "text-green-400 bg-green-500/10 border-green-500/20",
};

export default function Tasks() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [filter, setFilter] = useState("All");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const { data: tasks = [], isLoading } = useQuery<Task[]>({
        queryKey: [`/api/tasks/${user.id}`],
    });

    const filterOptions = ["All", "Assigned", "In Progress", "Completed"];
    const filterMap: Record<string, string> = {
        "All": "all",
        "Assigned": "assigned",
        "In Progress": "in_progress",
        "Completed": "completed",
    };

    const filtered = tasks.filter((t) =>
        filter === "All" ? true : t.status === filterMap[filter]
    );

    const counts = {
        total: tasks.length,
        assigned: tasks.filter((t) => t.status === "assigned").length,
        in_progress: tasks.filter((t) => t.status === "in_progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
    };

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">My Tasks</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">Manage and track your assigned tasks.</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: "Total", value: counts.total, color: "text-foreground", border: "border-white/10" },
                            { label: "Assigned", value: counts.assigned, color: "text-blue-400", border: "border-blue-500/20" },
                            { label: "In Progress", value: counts.in_progress, color: "text-yellow-400", border: "border-yellow-500/20" },
                            { label: "Completed", value: counts.completed, color: "text-green-400", border: "border-green-500/20" },
                        ].map((stat) => (
                            <div key={stat.label} className={`glass rounded-2xl border ${stat.border} p-5 text-center`}>
                                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Filter</span>
                        {filterOptions.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f
                                    ? "bg-primary text-white shadow-md shadow-primary/30"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Task Cards */}
                    {isLoading ? (
                        <div className="text-center py-16 text-muted-foreground animate-pulse text-sm font-bold uppercase tracking-widest">Loading tasks...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 glass rounded-2xl border border-dashed border-white/10">
                            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-bold">All caught up!</p>
                            <p className="text-sm text-muted-foreground mt-1">No tasks match the selected filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map((task) => {
                                const p = task.priority ?? "medium";
                                const pc = priorityColors[p] || priorityColors.medium;
                                const sc = statusColors[task.status] || statusColors.assigned;
                                return (
                                    <div key={task.id} className="glass rounded-2xl border border-white/10 p-5 flex flex-col gap-4 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                                        {/* Top */}
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-base font-black text-foreground leading-tight group-hover:text-primary transition-colors">{task.title}</h3>
                                            <span className={`shrink-0 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${sc}`}>
                                                {STATUS_LABELS[task.status] || task.status}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {task.description && (
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>
                                        )}

                                        {/* Priority + Due Date */}
                                        <div className="flex items-center gap-3">
                                            <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${pc.badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                                                {p.charAt(0).toUpperCase() + p.slice(1)}
                                            </span>
                                            {task.dueDate && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(task.dueDate), "MMM dd, yyyy")}
                                                </span>
                                            )}
                                        </div>

                                        {/* Submission link if exists */}
                                        {task.submissionLink && (
                                            <a href={task.submissionLink} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium truncate">
                                                <Link2 className="h-3.5 w-3.5 shrink-0" />
                                                {task.submissionLink}
                                            </a>
                                        )}

                                        {/* Update Button */}
                                        <Button
                                            className="mt-auto w-full rounded-xl bg-primary hover:bg-primary/90 font-bold gap-2 shadow-md shadow-primary/20"
                                            onClick={() => setSelectedTask(task)}>
                                            <ChevronRight className="h-4 w-4" />
                                            Update Status
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination placeholder */}
                    <div className="flex justify-center items-center gap-4 pt-2">
                        <Button variant="outline" size="sm" className="rounded-xl px-5 border-white/10 bg-white/5" disabled>← Previous</Button>
                        <span className="text-xs font-black uppercase tracking-widest">Page 1 of {Math.max(1, Math.ceil(filtered.length / 9))}</span>
                        <Button variant="outline" size="sm" className="rounded-xl px-5 border-white/10 bg-white/5" disabled>Next →</Button>
                    </div>
                </div>
            </main>

            {/* Update Modal */}
            <Dialog open={!!selectedTask} onOpenChange={(v) => { if (!v) setSelectedTask(null); }}>
                {selectedTask && (
                    <UpdateModal task={selectedTask} onClose={() => setSelectedTask(null)} />
                )}
            </Dialog>
        </div>
    );
}
