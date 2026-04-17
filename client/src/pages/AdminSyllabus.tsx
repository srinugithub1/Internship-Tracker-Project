import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { insertSyllabusSchema, type Syllabus } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type FormState = { course: string; module: string; topic: string };
const blank: FormState = { course: "", module: "", topic: "" };

export default function AdminSyllabus() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(blank);

    const { data: syllabus = [], isLoading } = useQuery<Syllabus[]>({
        queryKey: ["/api/syllabus"],
    });

    const createMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("POST", "/api/syllabus", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/syllabus"] });
            toast({ title: "Added", description: "Syllabus item created" });
            close();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("PUT", `/api/syllabus/${editId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/syllabus"] });
            toast({ title: "Updated", description: "Syllabus item updated" });
            close();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/syllabus/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/syllabus"] });
            toast({ title: "Deleted", description: "Item removed" });
        },
    });

    const close = () => { setOpen(false); setEditId(null); setForm(blank); };
    const openCreate = () => { setForm(blank); setEditId(null); setOpen(true); };
    const openEdit = (s: Syllabus) => { setForm({ course: s.course, module: s.module, topic: s.topic }); setEditId(s.id); setOpen(true); };
    const submit = () => editId ? updateMutation.mutate(form) : createMutation.mutate(form);
    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <AppLayout>
            <div className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Course Syllabus</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Structure the learning curriculum for interns.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 h-9">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Items</span>
                            <span className="text-base font-black text-primary tabular-nums">{syllabus.length}</span>
                        </div>
                        <Button onClick={openCreate} size="sm" className="rounded-lg h-9 font-black text-[9px] uppercase tracking-widest gap-1.5 shadow-lg">
                            <Plus className="h-3.5 w-3.5" /> Add Topic
                        </Button>
                    </div>
                </header>

                <div className="glass rounded-xl border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {["Course", "Module", "Topic", "Action"].map(h => (
                                        <th key={h} className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] first:pl-6 last:pr-6">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading && <tr><td colSpan={4} className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading curriculum...</td></tr>}
                                {syllabus.map(item => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 first:pl-6 text-[11px] font-black">{item.course}</td>
                                        <td className="p-4 text-[10px] font-bold text-muted-foreground">{item.module}</td>
                                        <td className="p-4 text-[10px] font-medium text-primary/80">{item.topic}</td>
                                        <td className="p-4 last:pr-6">
                                            <div className="flex gap-1.5">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary" onClick={() => openEdit(item)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                                                    onClick={() => { if (confirm("Delete this syllabus item?")) deleteMutation.mutate(item.id); }}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && syllabus.length === 0 && (
                                    <tr><td colSpan={4} className="p-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">No curriculum items defined.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{syllabus.length} items</span>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black uppercase tracking-tight">{editId ? "Edit Syllabus Item" : "Add New Topic"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {[
                            { label: "Course Name", key: "course", placeholder: "e.g. Bharat Unnati AI Fellowship" },
                            { label: "Module", key: "module", placeholder: "e.g. Agentic AI Internship" },
                            { label: "Topic", key: "topic", placeholder: "e.g. Introduction to LLMs" },
                        ].map(({ label, key, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
                                <Input placeholder={placeholder} className="h-9 bg-white/5 border-white/10 rounded-xl text-xs"
                                    value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={close} className="rounded-xl text-xs font-black uppercase tracking-widest">Cancel</Button>
                        <Button onClick={submit} disabled={isPending || !form.course || !form.module} className="rounded-xl font-black text-xs uppercase tracking-widest">
                            {isPending ? "Saving..." : editId ? "Update Item" : "Save Item"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
