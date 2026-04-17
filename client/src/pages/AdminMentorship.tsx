import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Trash2, Search, Filter } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { type User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
        <AppLayout>
            <div className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Guidance Hub</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Mentorship Requests</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Provide guidance and reply to intern queries.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl h-11">
                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Total</span>
                        <span className="text-lg font-black text-primary tabular-nums">{filtered.length}</span>
                    </div>
                </header>

                <div className="glass rounded-xl border-white/10 shadow-xl overflow-hidden">
                    {/* Filter Bar */}
                    <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:max-w-xs group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input placeholder="Search by intern name..." className="pl-9 h-9 bg-white/5 border-white/10 rounded-lg text-[10px] font-medium" value={filterName} onChange={e => setFilterName(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Filter className="h-3.5 w-3.5 text-primary shrink-0" />
                            <select className="h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-[10px] font-black uppercase tracking-tight focus:outline-none flex-1 sm:w-[120px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option className="bg-background">All Types</option>
                                <option className="bg-background">Technical</option>
                                <option className="bg-background">Professional</option>
                                <option className="bg-background">Project</option>
                            </select>
                            <select className="h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-[10px] font-black uppercase tracking-tight focus:outline-none flex-1 sm:w-[120px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option className="bg-background">All Status</option>
                                <option className="bg-background">pending</option>
                                <option className="bg-background">replied</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {["Intern", "Type", "Status", "Description", "Actions"].map(h => (
                                        <th key={h} className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] first:pl-6 last:pr-6">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading && (
                                    <tr><td colSpan={5} className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading guidance requests...</td></tr>
                                )}
                                {filtered.map(req => (
                                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 first:pl-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                                                    {getInternName(req.internId).charAt(0)}
                                                </div>
                                                <span className="font-black text-[11px] text-foreground">{getInternName(req.internId)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="text-[9px] font-black uppercase px-2 py-1 rounded-md bg-white/5 border border-white/10 tracking-widest">{req.type}</span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border tracking-widest ${req.status === "replied" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4 max-w-[260px]">
                                            <p className="text-[10px] text-muted-foreground truncate font-medium">{req.description}</p>
                                        </td>
                                        <td className="p-4 last:pr-6">
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 gap-1.5"
                                                    onClick={() => { setSelectedId(req.id); setReplyText(req.reply ?? ""); setReplyOpen(true); }}>
                                                    <MessageSquare className="h-3 w-3" /> Reply
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => { if (confirm("Delete this request?")) deleteMutation.mutate(req.id); }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && filtered.length === 0 && (
                                    <tr><td colSpan={5} className="p-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">No mentorship requests matched current filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{filtered.length} requests loaded</span>
                    </div>
                </div>
            </div>

            <Dialog open={replyOpen} onOpenChange={v => { if (!v) { setReplyOpen(false); setReplyText(""); setSelectedId(null); } }}>
                <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-none w-[95vw]">
                    <div className="bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass">
                        <DialogHeader className="p-6 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-black uppercase tracking-tight">Reply to Request</DialogTitle>
                                    <DialogDescription className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">Mentorship guidance response</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Guidance Response</Label>
                                <Textarea
                                    placeholder="Type your mentorship response here..."
                                    className="bg-white/5 border-white/10 rounded-xl min-h-[120px] text-xs font-medium focus:bg-white/10 transition-all resize-none"
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-6 pt-0 gap-3">
                            <Button variant="ghost" onClick={() => { setReplyOpen(false); setReplyText(""); }} className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                                Abort
                            </Button>
                            <Button
                                onClick={() => replyMutation.mutate()}
                                disabled={replyMutation.isPending || !replyText}
                                className="h-10 px-8 rounded-xl bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest flex-1 shadow-lg shadow-primary/20"
                            >
                                {replyMutation.isPending ? "Transmitting..." : "Send Reply"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
