import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, RotateCcw, Eye, ExternalLink, FileText, Link2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { type Task, type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

type FormState = { internId: string; title: string; description: string; dueDate: string; priority: string; status: string };
const blank: FormState = { internId: "", title: "", description: "", dueDate: "", priority: "medium", status: "assigned" };

const priorityStyle: Record<string, string> = {
    high: "bg-red-500/10 text-red-400 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-green-500/10 text-green-400 border-green-500/20",
};
const statusStyle: Record<string, string> = {
    assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function AdminTasks() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(blank);
    const [filterTask, setFilterTask] = useState("");
    const [filterIntern, setFilterIntern] = useState("");
    const [filterStatus, setFilterStatus] = useState("All Status");
    const [filterDate, setFilterDate] = useState("");
    const [viewingTask, setViewingTask] = useState<(Task & { todayProgress?: string | null; submissionLink?: string | null; remarks?: string | null }) | null>(null);

    const { data: tasks = [], isLoading } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
    const { data: interns = [] } = useQuery<User[]>({ queryKey: ["/api/interns"] });

    const createMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("POST", "/api/tasks", data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }); close(); },
    });

    const updateMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("PUT", `/api/tasks/${editId}`, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }); close(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
    });

    const close = () => { setOpen(false); setEditId(null); setForm(blank); };
    const openCreate = () => { setForm(blank); setEditId(null); setOpen(true); };
    const openEdit = (t: Task) => {
        setForm({ internId: t.internId, title: t.title, description: t.description ?? "", dueDate: t.dueDate ?? "", priority: t.priority ?? "medium", status: t.status });
        setEditId(t.id); setOpen(true);
    };
    const submit = () => editId ? updateMutation.mutate(form) : createMutation.mutate(form);
    const isPending = createMutation.isPending || updateMutation.isPending;

    const getInternName = (id: string) => interns.find(i => i.id === id)?.name || "Unknown";
    const reset = () => { setFilterTask(""); setFilterIntern(""); setFilterStatus("All Status"); setFilterDate(""); };
    const filtered = tasks.filter(t => {
        const n = t.title.toLowerCase().includes(filterTask.toLowerCase());
        const i = getInternName(t.internId).toLowerCase().includes(filterIntern.toLowerCase());
        const s = filterStatus === "All Status" || t.status === filterStatus;
        const d = !filterDate || t.dueDate === filterDate;
        return n && i && s && d;
    });

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Task Management</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">Manage and <span className="text-primary">track</span> intern assignments</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-secondary/50 px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total:</span>
                                <span className="text-lg font-black text-primary">{filtered.length}</span>
                            </div>
                            <Button onClick={openCreate} className="rounded-xl h-10 font-bold gap-2 shadow-lg">
                                <Plus className="h-4 w-4" /> Assign New Task
                            </Button>
                        </div>
                    </header>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center p-5 glass rounded-2xl border-white/10 shadow-xl">
                        <Input placeholder="Filter by Task Name" className="h-10 bg-white/5 border-white/10 rounded-xl flex-1 min-w-[160px]" value={filterTask} onChange={e => setFilterTask(e.target.value)} />
                        <Input placeholder="Filter by Intern Name" className="h-10 bg-white/5 border-white/10 rounded-xl flex-1 min-w-[160px]" value={filterIntern} onChange={e => setFilterIntern(e.target.value)} />
                        <select className="h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none text-muted-foreground min-w-[130px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="All Status" className="bg-background">All Status</option>
                            <option value="assigned" className="bg-background">Assigned</option>
                            <option value="in_progress" className="bg-background">In Progress</option>
                            <option value="completed" className="bg-background">Completed</option>
                        </select>
                        <Input type="date" className="h-10 bg-white/5 border-white/10 rounded-xl text-muted-foreground min-w-[150px]" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-primary" onClick={reset}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="glass rounded-2xl border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        {["Task Name", "Assigned To", "Priority", "Due Date", "Status", "Progress", "Actions"].map(h => (
                                            <th key={h} className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && <tr><td colSpan={7} className="p-20 text-center text-muted-foreground animate-pulse text-xs font-bold uppercase tracking-widest">Loading tasks...</td></tr>}
                                    {filtered.map(task => (
                                        <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-5 font-bold text-sm">{task.title}</td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-[9px]">
                                                        {getInternName(task.internId).charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium">{getInternName(task.internId)}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${priorityStyle[task.priority ?? "medium"] || priorityStyle.medium}`}>
                                                    {task.priority || "medium"}
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm font-medium opacity-80">
                                                {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "—"}
                                            </td>
                                            <td className="p-5">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${statusStyle[task.status] || statusStyle.assigned}`}>
                                                    {task.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                {(task as any).todayProgress || (task as any).submissionLink || (task as any).remarks ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
                                                        <FileText className="h-3 w-3" /> Submitted
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground font-medium">—</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary" onClick={() => setViewingTask(task as any)} title="View intern progress">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary" onClick={() => openEdit(task)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-red-500" onClick={() => deleteMutation.mutate(task.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && filtered.length === 0 && <tr><td colSpan={7} className="p-20 text-center text-muted-foreground italic">No tasks found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center px-8">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Records: {filtered.length}</p>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
                                <span className="text-xs font-black uppercase tracking-widest">Page 1 of {Math.max(1, Math.ceil(filtered.length / 10))}</span>
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">{editId ? "Edit Task" : "Assign New Task"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assign To (Intern)</Label>
                            <select className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={form.internId} onChange={e => setForm(f => ({ ...f, internId: e.target.value }))}>
                                <option value="" className="bg-background">Select an intern...</option>
                                {interns.map(i => <option key={i.id} value={i.id} className="bg-background">{i.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Task Title</Label>
                            <Input placeholder="e.g. Build REST API" className="h-10 bg-white/5 border-white/10 rounded-xl" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                            <Textarea placeholder="Task details..." className="bg-white/5 border-white/10 rounded-xl" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Due Date</Label>
                                <Input type="date" className="h-10 bg-white/5 border-white/10 rounded-xl" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Priority</Label>
                                <select className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                    <option value="high" className="bg-background">High</option>
                                    <option value="medium" className="bg-background">Medium</option>
                                    <option value="low" className="bg-background">Low</option>
                                </select>
                            </div>
                        </div>
                        {editId && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                                <select className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                    <option value="assigned" className="bg-background">Assigned</option>
                                    <option value="in_progress" className="bg-background">In Progress</option>
                                    <option value="completed" className="bg-background">Completed</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={close} className="rounded-xl">Cancel</Button>
                        <Button onClick={submit} disabled={isPending || !form.title || !form.internId} className="rounded-xl font-bold">
                            {isPending ? "Saving..." : editId ? "Update Task" : "Assign Task"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Progress Dialog */}
            <Dialog open={!!viewingTask} onOpenChange={(v) => { if (!v) setViewingTask(null); }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">{viewingTask?.title} — Progress</DialogTitle>
                        <p className="text-sm text-muted-foreground">{getInternName(viewingTask?.internId ?? "")}</p>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Status:
                            <span className={`ml-1 px-2.5 py-1 rounded-full border text-[10px] ${viewingTask?.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                viewingTask?.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>{viewingTask?.status?.replace('_', ' ')}</span>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                                <FileText className="h-3.5 w-3.5 text-primary" /> Today's Progress
                            </label>
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-[80px] text-muted-foreground">
                                {viewingTask?.todayProgress || <span className="italic opacity-50">Not provided</span>}
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                                <Link2 className="h-3.5 w-3.5 text-primary" /> Submission Link
                            </label>
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm">
                                {viewingTask?.submissionLink ? (
                                    <a href={viewingTask?.submissionLink ?? "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1.5">
                                        {viewingTask?.submissionLink} <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                ) : <span className="text-muted-foreground italic opacity-50">Not provided</span>}
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-primary" /> Remarks
                            </label>
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-[60px] text-muted-foreground">
                                {viewingTask?.remarks || <span className="italic opacity-50">No remarks</span>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setViewingTask(null)} className="rounded-xl">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
