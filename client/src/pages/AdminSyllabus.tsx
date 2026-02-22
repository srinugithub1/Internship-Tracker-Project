import Sidebar from "@/components/Sidebar";
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
        staleTime: 0,
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
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">
                    <header className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground">Course Syllabus</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">Structure the learning curriculum</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-secondary/50 px-4 py-2 rounded-2xl border border-white/20 shadow-sm flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total:</span>
                                <span className="text-lg font-black text-primary">{syllabus.length}</span>
                            </div>
                            <Button onClick={openCreate} className="bg-[#1a4fcf] hover:bg-[#153fab] text-white rounded-xl px-6 h-11 font-bold shadow-lg shadow-blue-500/20">
                                <Plus className="h-4 w-4 mr-2" /> Add Topic
                            </Button>
                        </div>
                    </header>

                    <div className="glass rounded-2xl border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Course</th>
                                        <th className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Module</th>
                                        <th className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Topic</th>
                                        <th className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && <tr><td colSpan={4} className="p-20 text-center text-muted-foreground animate-pulse font-bold">Loading curriculum...</td></tr>}
                                    {syllabus.map(item => (
                                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-5 text-sm font-medium">{item.course}</td>
                                            <td className="p-5 text-sm font-medium">{item.module}</td>
                                            <td className="p-5 text-sm font-medium text-primary/80">{item.topic}</td>
                                            <td className="p-5 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/10 transition-all" onClick={() => openEdit(item)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                        onClick={() => { if (confirm("Delete this syllabus item?")) deleteMutation.mutate(item.id); }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && syllabus.length === 0 && (
                                        <tr><td colSpan={4} className="p-20 text-center text-muted-foreground italic">No curriculum items defined. Click "Add Topic" to start.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Records: {syllabus.length}</p>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
                                <span className="text-xs font-black uppercase tracking-widest">Page 1 of 1</span>
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">{editId ? "Edit Syllabus Item" : "Add New Topic"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {[
                            { label: "Course Name", key: "course", placeholder: "e.g. Bharat Unnati AI Fellowship" },
                            { label: "Module", key: "module", placeholder: "e.g. Agentic AI Internship" },
                            { label: "Topic", key: "topic", placeholder: "e.g. Introduction to LLMs" },
                        ].map(({ label, key, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>
                                <Input placeholder={placeholder} className="h-10 bg-white/5 border-white/10 rounded-xl"
                                    value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={close} className="rounded-xl">Cancel</Button>
                        <Button onClick={submit} disabled={isPending || !form.course || !form.module} className="rounded-xl font-bold">
                            {isPending ? "Saving..." : editId ? "Update Item" : "Save Item"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
