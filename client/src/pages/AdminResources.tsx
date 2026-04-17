import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { type Resource } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type FormState = { title: string; description: string; link: string; type: string };
const blank: FormState = { title: "", description: "", link: "", type: "Link" };

export default function AdminResources() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(blank);

    const { data: items = [], isLoading } = useQuery<Resource[]>({
        queryKey: ["/api/resources"],
        staleTime: 0,
    });

    const createMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("POST", "/api/resources", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
            toast({ title: "✅ Resource Added", description: "The resource was saved successfully." });
            close();
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("PUT", `/api/resources/${editId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
            toast({ title: "✅ Resource Updated", description: "Changes saved." });
            close();
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/resources/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
            toast({ title: "Deleted", description: "Resource removed." });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const close = () => { setOpen(false); setEditId(null); setForm(blank); };
    const openCreate = () => { setForm(blank); setEditId(null); setOpen(true); };
    const openEdit = (r: Resource) => {
        setForm({ title: r.title, description: r.description ?? "", link: r.link ?? "", type: r.type ?? "Link" });
        setEditId(r.id);
        setOpen(true);
    };
    const submit = () => editId ? updateMutation.mutate(form) : createMutation.mutate(form);
    const isPending = createMutation.isPending || updateMutation.isPending;

    const typeBadge: Record<string, string> = {
        Link: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        Video: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        Document: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        PDF: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Learning Resources</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Manage educational materials and links for interns.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 h-9">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                            <span className="text-base font-black text-primary tabular-nums">{items.length}</span>
                        </div>
                        <Button onClick={openCreate} size="sm" className="rounded-lg h-9 font-black text-[9px] uppercase tracking-widest gap-1.5 shadow-lg">
                            <Plus className="h-3.5 w-3.5" /> New Resource
                        </Button>
                    </div>
                </header>

                <div className="glass rounded-xl border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[550px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {["Title", "Link", "Type", "Actions"].map(h => (
                                        <th key={h} className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] first:pl-6 last:pr-6">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading && <tr><td colSpan={4} className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading resources...</td></tr>}
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 first:pl-6 font-black text-[11px]">{item.title}</td>
                                        <td className="p-4">
                                            {item.link
                                                ? <a href={item.link} target="_blank" rel="noreferrer" className="text-primary text-[10px] font-black flex items-center gap-1.5 hover:underline uppercase tracking-widest">
                                                    <ExternalLink className="h-3 w-3" /> Open Link
                                                  </a>
                                                : <span className="text-muted-foreground text-[10px] opacity-40">—</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${typeBadge[item.type || "Link"] || typeBadge.Link}`}>
                                                {item.type || "Link"}
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
                                {!isLoading && items.length === 0 && (
                                    <tr><td colSpan={4} className="p-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">No resources added yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{items.length} resources</span>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black uppercase tracking-tight">{editId ? "Edit Resource" : "New Resource"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Title</Label>
                            <Input placeholder="e.g. Generative AI Document" className="h-9 bg-white/5 border-white/10 rounded-xl text-xs"
                                value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Link (URL)</Label>
                            <Input type="url" placeholder="https://..." className="h-9 bg-white/5 border-white/10 rounded-xl text-xs"
                                value={form.link} onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
                            <select className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-black uppercase tracking-tight focus:outline-none"
                                value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="Link" className="bg-background">Link</option>
                                <option value="Video" className="bg-background">Video</option>
                                <option value="Document" className="bg-background">Document</option>
                                <option value="PDF" className="bg-background">PDF</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Description (optional)</Label>
                            <Textarea placeholder="Brief description..." className="bg-white/5 border-white/10 rounded-xl text-xs resize-none"
                                value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={close} className="rounded-xl text-xs font-black uppercase tracking-widest">Cancel</Button>
                        <Button onClick={submit} disabled={isPending || !form.title} className="rounded-xl font-black text-xs uppercase tracking-widest">
                            {isPending ? "Saving..." : editId ? "Update Resource" : "Add Resource"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
