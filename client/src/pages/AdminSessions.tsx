import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
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
        staleTime: 0,
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
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Class Session Links</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">Manage <span className="text-primary">online class session</span> links and schedules</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-secondary/50 px-4 py-2 rounded-2xl border border-white/20 shadow-sm flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total:</span>
                                <span className="text-lg font-black text-primary">{sessions.length}</span>
                            </div>
                            <Button onClick={openCreate} className="rounded-xl h-10 font-bold gap-2 shadow-lg">
                                <Plus className="h-4 w-4" /> New Session Link
                            </Button>
                        </div>
                    </header>

                    <div className="glass rounded-2xl border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        {["Agenda", "Date", "Start Time", "End Time", "Speaker", "Session URL", "Actions"].map(h => (
                                            <th key={h} className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && <tr><td colSpan={7} className="p-20 text-center text-muted-foreground animate-pulse text-xs font-bold uppercase tracking-widest">Loading sessions...</td></tr>}
                                    {sessions.map(s => (
                                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-5 font-bold text-sm">{s.agenda}</td>
                                            <td className="p-5 text-sm font-medium text-primary">{s.sessionDate ? format(new Date(s.sessionDate), "MMM dd, yyyy") : "—"}</td>
                                            <td className="p-5 text-sm font-bold text-primary/80">{s.startTime || "—"}</td>
                                            <td className="p-5 text-sm font-medium">{s.endTime || "—"}</td>
                                            <td className="p-5 text-sm font-medium">{s.speaker}</td>
                                            <td className="p-5">
                                                <a href={s.sessionUrl ?? "#"} target="_blank" rel="noreferrer" className="text-primary text-sm font-bold flex items-center gap-1.5 hover:underline">
                                                    <ExternalLink className="h-3.5 w-3.5" /> Open Link
                                                </a>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary" onClick={() => openEdit(s)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-red-500" onClick={() => deleteMutation.mutate(s.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && sessions.length === 0 && <tr><td colSpan={7} className="p-20 text-center text-muted-foreground italic">No session links added yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center px-8">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Records: {sessions.length}</p>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
                                <span className="text-xs font-black uppercase tracking-widest">Page 1 of 1</span>
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">{editId ? "Edit Session Link" : "New Session Link"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {fields.map(({ label, key, type, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>
                                <Input type={type} placeholder={placeholder} className="h-10 bg-white/5 border-white/10 rounded-xl"
                                    value={(form as any)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={close} className="rounded-xl">Cancel</Button>
                        <Button onClick={submit} disabled={isPending} className="rounded-xl font-bold">
                            {isPending ? "Saving..." : editId ? "Update Session" : "Add Session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
