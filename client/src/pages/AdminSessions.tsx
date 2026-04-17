import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ExternalLink, Video } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { type SessionLink } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type FormState = { agenda: string; sessionDate: string; startTime: string; endTime: string; speaker: string; sessionUrl: string };
const blank: FormState = { agenda: "", sessionDate: "", startTime: "", endTime: "", speaker: "", sessionUrl: "" };

export default function AdminSessions() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(blank);

    const { data: sessions = [], isLoading } = useQuery<SessionLink[]>({
        queryKey: ["/api/session-links"],
    });

    const createMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("POST", "/api/session-links", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/session-links"] });
            toast({ title: "✅ Session Added", description: "Session link saved." });
            close();
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("PUT", `/api/session-links/${editId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/session-links"] });
            toast({ title: "✅ Session Updated" });
            close();
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/session-links/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/session-links"] });
            toast({ title: "Deleted", description: "Session removed." });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const close = () => { setOpen(false); setEditId(null); setForm(blank); };
    const openCreate = () => { setForm(blank); setEditId(null); setOpen(true); };
    const openEdit = (s: SessionLink) => {
        setForm({ agenda: s.agenda ?? "", sessionDate: s.sessionDate ?? "", startTime: s.startTime ?? "", endTime: s.endTime ?? "", speaker: s.speaker ?? "", sessionUrl: s.sessionUrl ?? "" });
        setEditId(s.id);
        setOpen(true);
    };
    const submit = () => editId ? updateMutation.mutate(form) : createMutation.mutate(form);
    const isPending = createMutation.isPending || updateMutation.isPending;

    const fields = [
        { label: "Agenda", key: "agenda", type: "text", placeholder: "e.g. GenAI Workshop" },
        { label: "Date", key: "sessionDate", type: "date", placeholder: "" },
        { label: "Start Time", key: "startTime", type: "time", placeholder: "" },
        { label: "End Time", key: "endTime", type: "time", placeholder: "" },
        { label: "Speaker Name", key: "speaker", type: "text", placeholder: "e.g. Harish Nath" },
        { label: "Session URL", key: "sessionUrl", type: "url", placeholder: "https://meet.google.com/..." },
    ];

    return (
        <AppLayout>
            <div className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Video className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Live Classes</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Class Session Links</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Manage online class session links and schedules.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 h-9">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                            <span className="text-base font-black text-primary tabular-nums">{sessions.length}</span>
                        </div>
                        <Button onClick={openCreate} size="sm" className="rounded-lg h-9 font-black text-[9px] uppercase tracking-widest gap-1.5 shadow-lg">
                            <Plus className="h-3.5 w-3.5" /> New Session
                        </Button>
                    </div>
                </header>

                <div className="glass rounded-xl border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {["Agenda", "Date", "Start", "End", "Speaker", "Session URL", "Actions"].map(h => (
                                        <th key={h} className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] first:pl-6 last:pr-6">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading && <tr><td colSpan={7} className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading sessions...</td></tr>}
                                {sessions.map(s => (
                                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 first:pl-6 font-black text-[11px]">{s.agenda}</td>
                                        <td className="p-4 text-[10px] font-black text-primary/80 whitespace-nowrap tabular-nums">
                                            {s.sessionDate ? format(new Date(s.sessionDate), "MMM dd, yyyy") : "—"}
                                        </td>
                                        <td className="p-4 text-[10px] font-bold text-primary/70 tabular-nums">{s.startTime || "—"}</td>
                                        <td className="p-4 text-[10px] font-medium opacity-60 tabular-nums">{s.endTime || "—"}</td>
                                        <td className="p-4 text-[10px] font-bold">{s.speaker}</td>
                                        <td className="p-4">
                                            <a href={s.sessionUrl ?? "#"} target="_blank" rel="noreferrer"
                                                className="text-primary text-[9px] font-black flex items-center gap-1.5 hover:underline uppercase tracking-widest">
                                                <ExternalLink className="h-3 w-3" /> Join
                                            </a>
                                        </td>
                                        <td className="p-4 last:pr-6">
                                            <div className="flex items-center gap-1.5">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary" onClick={() => openEdit(s)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-red-500" onClick={() => deleteMutation.mutate(s.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && sessions.length === 0 && (
                                    <tr><td colSpan={7} className="p-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">No session links added yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{sessions.length} sessions</span>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black uppercase tracking-tight">{editId ? "Edit Session Link" : "New Session Link"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-2">
                        {fields.map(({ label, key, type, placeholder }) => (
                            <div key={key} className={`space-y-1.5 ${key === "agenda" || key === "sessionUrl" ? "col-span-2" : ""}`}>
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
                                <Input type={type} placeholder={placeholder} className="h-9 bg-white/5 border-white/10 rounded-xl text-xs"
                                    value={(form as any)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={close} className="rounded-xl text-xs font-black uppercase tracking-widest">Cancel</Button>
                        <Button onClick={submit} disabled={isPending} className="rounded-xl font-black text-xs uppercase tracking-widest">
                            {isPending ? "Saving..." : editId ? "Update Session" : "Add Session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
