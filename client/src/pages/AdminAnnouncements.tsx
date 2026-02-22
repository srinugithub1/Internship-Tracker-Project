import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
        staleTime: 0,
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
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Announcements</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">Broadcast updates and news to <span className="text-primary">interns</span></p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-secondary/50 px-4 py-2 rounded-2xl border border-white/20 shadow-sm flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total:</span>
                                <span className="text-lg font-black text-primary">{items.length}</span>
                            </div>
                            <Button onClick={openCreate} className="rounded-xl h-10 font-bold gap-2 shadow-lg">
                                <Plus className="h-4 w-4" /> New Announcement
                            </Button>
                        </div>
                    </header>

                    <div className="glass rounded-2xl border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        {["Message", "Type", "Actions"].map(h => (
                                            <th key={h} className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && <tr><td colSpan={3} className="p-20 text-center text-muted-foreground animate-pulse text-xs font-bold uppercase tracking-widest">Loading...</td></tr>}
                                    {items.map(item => (
                                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-5 font-medium text-sm max-w-2xl">{item.message}</td>
                                            <td className="p-5">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${typeBadge(item.type)}`}>
                                                    {item.type || "info"}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary" onClick={() => openEdit(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-red-500" onClick={() => deleteMutation.mutate(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && items.length === 0 && <tr><td colSpan={3} className="p-20 text-center text-muted-foreground italic">No announcements yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center px-8">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Records: {items.length}</p>
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
                        <DialogTitle className="text-xl font-black">{editId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message</Label>
                            <Textarea placeholder="Enter announcement message..." className="bg-white/5 border-white/10 rounded-xl min-h-[100px]"
                                value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</Label>
                            <select className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="info" className="bg-background">Info</option>
                                <option value="warning" className="bg-background">Warning</option>
                                <option value="success" className="bg-background">Success</option>
                                <option value="error" className="bg-background">Error</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={close} className="rounded-xl">Cancel</Button>
                        <Button onClick={submit} disabled={isPending || !form.message} className="rounded-xl font-bold">
                            {isPending ? "Saving..." : editId ? "Update" : "Publish"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
