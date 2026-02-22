import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { type User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type FormState = { name: string; email: string; phone: string; rollNumber: string; collegeName: string; address: string };
const blank: FormState = { name: "", email: "", phone: "", rollNumber: "", collegeName: "", address: "" };

export default function AdminInterns() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [filterName, setFilterName] = useState("");
    const [filterEmail, setFilterEmail] = useState("");
    const [filterRoll, setFilterRoll] = useState("");
    const [filterCollege, setFilterCollege] = useState("");
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(blank);

    const { data: interns = [], isLoading } = useQuery<User[]>({ queryKey: ["/api/interns"] });

    const updateMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("PUT", `/api/interns/${editId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/interns"] });
            toast({ title: "Updated", description: "Intern profile updated" });
            close();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/interns/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/interns"] });
            toast({ title: "Deleted", description: "Intern removed successfully" });
        },
    });

    const close = () => { setOpen(false); setEditId(null); setForm(blank); };
    const openEdit = (u: User) => {
        setForm({ name: u.name, email: u.email, phone: u.phone ?? "", rollNumber: (u as any).rollNumber ?? "", collegeName: (u as any).collegeName ?? "", address: (u as any).address ?? "" });
        setEditId(u.id); setOpen(true);
    };

    const filtered = interns.filter(u =>
        u.name.toLowerCase().includes(filterName.toLowerCase()) &&
        u.email.toLowerCase().includes(filterEmail.toLowerCase()) &&
        ((u as any).rollNumber ?? "").toLowerCase().includes(filterRoll.toLowerCase()) &&
        ((u as any).collegeName ?? "").toLowerCase().includes(filterCollege.toLowerCase())
    );

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">
                    <header className="flex justify-between items-start">
                        <div className="animate-in fade-in slide-in-from-left duration-700">
                            <h1 className="text-3xl font-black tracking-tight text-foreground">Intern Management</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">View and manage registered interns</p>
                        </div>
                        <div className="bg-secondary/50 px-4 py-2 rounded-2xl border border-white/20 shadow-sm flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total:</span>
                            <span className="text-lg font-black text-primary">{interns.length}</span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 glass rounded-2xl border-white/10 shadow-xl">
                        <Input placeholder="Filter by Name" className="pl-4 h-11 bg-white/5 border-white/10 rounded-xl" value={filterName} onChange={e => setFilterName(e.target.value)} />
                        <Input placeholder="Filter by Email" className="pl-4 h-11 bg-white/5 border-white/10 rounded-xl" value={filterEmail} onChange={e => setFilterEmail(e.target.value)} />
                        <Input placeholder="Roll Number" className="pl-4 h-11 bg-white/5 border-white/10 rounded-xl" value={filterRoll} onChange={e => setFilterRoll(e.target.value)} />
                        <Input placeholder="College Name" className="pl-4 h-11 bg-white/5 border-white/10 rounded-xl" value={filterCollege} onChange={e => setFilterCollege(e.target.value)} />
                    </div>

                    <div className="glass rounded-2xl border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        {["Name", "Email", "Phone", "Roll Number", "College Name", "Address", "Actions"].map(h => (
                                            <th key={h} className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && <tr><td colSpan={7} className="p-20 text-center text-muted-foreground font-bold animate-pulse">Loading interns...</td></tr>}
                                    {filtered.map(intern => (
                                        <tr key={intern.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-[10px]">
                                                        {intern.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-sm">{intern.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-sm text-blue-500 font-medium">{intern.email}</td>
                                            <td className="p-5 text-sm font-medium">{(intern as any).phone || "N/A"}</td>
                                            <td className="p-5 text-sm font-bold text-primary/80">{(intern as any).rollNumber || "N/A"}</td>
                                            <td className="p-5 text-sm font-medium">{(intern as any).collegeName || "N/A"}</td>
                                            <td className="p-5 text-sm font-medium">{(intern as any).address || "N/A"}</td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/10 transition-all" onClick={() => openEdit(intern)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                        onClick={() => { if (confirm("Remove this intern permanently?")) deleteMutation.mutate(intern.id); }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && filtered.length === 0 && (
                                        <tr><td colSpan={7} className="p-20 text-center italic text-muted-foreground">No interns found matching your filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
                <DialogContent className="glass border-white/10 rounded-2xl max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Edit Intern Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {[
                            { label: "Full Name", key: "name", placeholder: "e.g. Harish Nath" },
                            { label: "Email", key: "email", placeholder: "e.g. harish@example.com" },
                            { label: "Phone", key: "phone", placeholder: "e.g. +91 9876543210" },
                            { label: "Roll Number", key: "rollNumber", placeholder: "e.g. 23CS001" },
                            { label: "College Name", key: "collegeName", placeholder: "e.g. IIT Madras" },
                            { label: "Address", key: "address", placeholder: "e.g. Chennai, Tamil Nadu" },
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
                        <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending || !form.name} className="rounded-xl font-bold">
                            {updateMutation.isPending ? "Saving..." : "Update Intern"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
