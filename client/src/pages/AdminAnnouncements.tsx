import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { type Announcement } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type FormState = { message: string; type: string };
const blank: FormState = { message: "", type: "info" };

export default function AdminAnnouncements() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(blank);

    const { data: items = [], isLoading } = useQuery<Announcement[]>({
        queryKey: ["/api/announcements"],
    });

    const createMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("POST", "/api/announcements", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
            toast({ title: "✅ Announcement Published", description: "Visible to all interns." });
            close();
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("PUT", `/api/announcements/${editId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
            toast({ title: "✅ Announcement Updated" });
            close();
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/announcements/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
            toast({ title: "Deleted", description: "Announcement removed." });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const close = () => { setOpen(false); setEditId(null); setForm(blank); };
    const openCreate = () => { setForm(blank); setEditId(null); setOpen(true); };
    const openEdit = (a: Announcement) => { setForm({ message: a.message, type: a.type ?? "info" }); setEditId(a.id); setOpen(true); };
    const submit = () => editId ? updateMutation.mutate(form) : createMutation.mutate(form);
    const isPending = createMutation.isPending || updateMutation.isPending;

    const typeBadge = (type: string | null) => {
        const styles: Record<string, string> = {
            info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            success: "bg-green-500/10 text-green-400 border-green-500/20",
            error: "bg-red-500/10 text-red-400 border-red-500/20",
        };
        return styles[type || "info"] || styles.info;
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Announcements</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Broadcast updates and news to interns.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 h-9">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                            <span className="text-base font-black text-primary tabular-nums">{items.length}</span>
                        </div>
                        <Button onClick={openCreate} size="sm" className="rounded-lg h-9 font-black text-[9px] uppercase tracking-widest gap-1.5 shadow-lg">
                            <Plus className="h-3.5 w-3.5" /> New
                        </Button>
                    </div>
                </header>

                <div className="glass rounded-xl border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {["Message", "Type", "Actions"].map(h => (
                                        <th key={h} className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] first:pl-6 last:pr-6">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading && <tr><td colSpan={3} className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading...</td></tr>}
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 first:pl-6 text-[11px] font-medium max-w-2xl">{item.message}</td>
                                        <td className="p-4">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${typeBadge(item.type)}`}>
                                                {item.type || "info"}
                                            </span>
                                        </td>
                                        <td className="p-4 last:pr-6">
                                            <div className="flex items-center gap-1.5">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary" onClick={() => openEdit(item)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-red-500" onClick={() => deleteMutation.mutate(item.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && items.length === 0 && <tr><td colSpan={3} className="p-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">No announcements yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{items.length} announcements</span>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black uppercase tracking-tight">{editId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Message</Label>
                            <Textarea placeholder="Enter announcement message..." className="bg-white/5 border-white/10 rounded-xl min-h-[100px] text-xs"
                                value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
                            <select className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-black uppercase tracking-tight focus:outline-none"
                                value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="info" className="bg-background">Info</option>
                                <option value="warning" className="bg-background">Warning</option>
                                <option value="success" className="bg-background">Success</option>
                                <option value="error" className="bg-background">Error</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={close} className="rounded-xl text-xs font-black uppercase tracking-widest">Cancel</Button>
                        <Button onClick={submit} disabled={isPending || !form.message} className="rounded-xl font-black text-xs uppercase tracking-widest">
                            {isPending ? "Saving..." : editId ? "Update" : "Publish"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
