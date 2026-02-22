import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { type User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminMentorship() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("All Types");
    const [filterStatus, setFilterStatus] = useState("All Status");
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data: requests = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/mentorship"] });
    const { data: interns = [] } = useQuery<User[]>({ queryKey: ["/api/interns"] });

    const replyMutation = useMutation({
        mutationFn: () => apiRequest("PATCH", `/api/mentorship/${selectedId}/reply`, { reply: replyText }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mentorship"] });
            toast({ title: "Reply sent", description: "Reply submitted successfully." });
            setReplyOpen(false); setReplyText(""); setSelectedId(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/mentorship/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mentorship"] });
            toast({ title: "Deleted", description: "Request removed." });
        },
    });

    const getInternName = (id: string) => interns.find(i => i.id === id)?.name || "Unknown";

    const filtered = requests.filter(req => {
        const nameMatch = getInternName(req.internId).toLowerCase().includes(filterName.toLowerCase());
        const typeMatch = filterType === "All Types" || req.type === filterType;
        const statusMatch = filterStatus === "All Status" || req.status === filterStatus;
        return nameMatch && typeMatch && statusMatch;
    });

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">
                    <header className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Mentorship Requests</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">Provide guidance and reply to intern queries</p>
                        </div>
                        <div className="bg-secondary/50 px-4 py-2 rounded-2xl border border-white/20 shadow-sm flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total:</span>
                            <span className="text-lg font-black text-primary">{filtered.length}</span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 glass rounded-2xl border-white/10 shadow-xl">
                        <Input placeholder="Filter by Intern Name" className="pl-4 h-11 bg-white/5 border-white/10 rounded-xl" value={filterName} onChange={e => setFilterName(e.target.value)} />
                        <select className="h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option className="bg-background">All Types</option>
                            <option className="bg-background">Technical</option>
                            <option className="bg-background">Professional</option>
                            <option className="bg-background">Project</option>
                        </select>
                        <select className="h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option className="bg-background">All Status</option>
                            <option className="bg-background">pending</option>
                            <option className="bg-background">replied</option>
                        </select>
                    </div>

                    <div className="glass rounded-2xl border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        {["Intern", "Type", "Status", "Description", "Actions"].map(h => (
                                            <th key={h} className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && <tr><td colSpan={5} className="p-20 text-center text-muted-foreground animate-pulse font-medium">Fetching requests...</td></tr>}
                                    {filtered.map(req => (
                                        <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <MessageSquare className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-bold text-sm">{getInternName(req.internId)}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 whitespace-nowrap">
                                                <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-secondary/50 border border-white/10">{req.type}</span>
                                            </td>
                                            <td className="p-5 whitespace-nowrap">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${req.status === "replied" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="p-5 max-w-md">
                                                <p className="text-sm text-muted-foreground truncate">{req.description}</p>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 gap-1.5"
                                                        onClick={() => { setSelectedId(req.id); setReplyText(req.reply ?? ""); setReplyOpen(true); }}>
                                                        <MessageSquare className="h-3.5 w-3.5" /> Reply
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                        onClick={() => { if (confirm("Delete this request?")) deleteMutation.mutate(req.id); }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && filtered.length === 0 && (
                                        <tr><td colSpan={5} className="p-20 text-center text-muted-foreground">No mentorship requests found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Records: {filtered.length}</p>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
                                <span className="text-xs font-black uppercase tracking-widest">Page 1 of 1</span>
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Dialog open={replyOpen} onOpenChange={v => { if (!v) { setReplyOpen(false); setReplyText(""); setSelectedId(null); } }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Reply to Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Reply</Label>
                            <Textarea placeholder="Type your response here..." className="bg-white/5 border-white/10 rounded-xl min-h-[120px]"
                                value={replyText} onChange={e => setReplyText(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => { setReplyOpen(false); setReplyText(""); }} className="rounded-xl">Cancel</Button>
                        <Button onClick={() => replyMutation.mutate()} disabled={replyMutation.isPending || !replyText} className="rounded-xl font-bold">
                            {replyMutation.isPending ? "Sending..." : "Send Reply"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
