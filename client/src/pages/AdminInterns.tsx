import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil, ChevronLeft, ChevronRight, Users, UserPlus, Filter, Search } from "lucide-react";
import { useState } from "react";
import { type User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type FormState = { name: string; email: string; phone: string; rollNumber: string; university: string; college: string; department: string; hodName: string; hodEmail: string };
const blank: FormState = { name: "", email: "", phone: "", rollNumber: "", university: "", college: "", department: "", hodName: "", hodEmail: "" };

export default function AdminInterns() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [filterName, setFilterName] = useState("");
    const [filterEmail, setFilterEmail] = useState("");
    const [filterRoll, setFilterRoll] = useState("");
    const [filterUniversity, setFilterUniversity] = useState("");
    const [filterCollege, setFilterCollege] = useState("");
    const [filterDept, setFilterDept] = useState("");
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(blank);

    const [page, setPage] = useState(1);
    const perPage = 10;

    const { data: interns = [], isLoading } = useQuery<User[]>({ queryKey: ["/api/interns"] });

    const updateMutation = useMutation({
        mutationFn: (data: FormState) => apiRequest("PUT", `/api/interns/${editId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/interns"] });
            toast({ title: "Updated", description: "Intern profile successfully synchronized." });
            close();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/interns/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/interns"] });
            toast({ title: "Deleted", description: "Intern record permanently removed." });
        },
    });

    const close = () => { setOpen(false); setEditId(null); setForm(blank); };
    const openEdit = (u: User) => {
        setForm({
            name: u.name,
            email: u.email,
            phone: u.phone ?? "",
            rollNumber: (u as any).rollNumber ?? "",
            university: (u as any).university ?? "",
            college: (u as any).college ?? "",
            department: (u as any).department ?? "",
            hodName: (u as any).hodName ?? "",
            hodEmail: (u as any).hodEmail ?? ""
        });
        setEditId(u.id); setOpen(true);
    };

    const filtered = interns.filter(u =>
        u.name.toLowerCase().includes(filterName.toLowerCase()) &&
        u.email.toLowerCase().includes(filterEmail.toLowerCase()) &&
        ((u as any).rollNumber ?? "").toLowerCase().includes(filterRoll.toLowerCase()) &&
        ((u as any).university ?? "").toLowerCase().includes(filterUniversity.toLowerCase()) &&
        ((u as any).college ?? "").toLowerCase().includes(filterCollege.toLowerCase()) &&
        ((u as any).department ?? "").toLowerCase().includes(filterDept.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

    // Auto-reset page when filter changes
    const prevFilter = JSON.stringify({ filterName, filterEmail, filterUniversity, filterCollege, filterDept });
    const [lastFilter, setLastFilter] = useState(prevFilter);
    if (prevFilter !== lastFilter) {
        setPage(1);
        setLastFilter(prevFilter);
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">
                            Intern Registry
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs font-medium">
                            Manage records, profile credentials, and institutional affiliations.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl shadow-sm h-11">
                        <Users className="h-4 w-4 text-primary opacity-60" />
                        <div className="flex flex-col items-start pr-2">
                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest leading-none">Total Records</span>
                            <span className="text-lg font-black text-primary leading-none tabular-nums">{interns.length}</span>
                        </div>
                    </div>
                </header>

                <div className="glass rounded-xl border-white/10 shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-3.5 w-3.5 text-primary" />
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground">Advanced Filtering</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                            {[
                                { placeholder: "Search Name", value: filterName, setter: setFilterName },
                                { placeholder: "Search Email", value: filterEmail, setter: setFilterEmail },
                                { placeholder: "Roll Number", value: filterRoll, setter: setFilterRoll },
                                { placeholder: "University", value: filterUniversity, setter: setFilterUniversity },
                                { placeholder: "College", value: filterCollege, setter: setFilterCollege },
                                { placeholder: "Department", value: filterDept, setter: setFilterDept },
                            ].map((f, i) => (
                                <div key={i} className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Search className="h-3.5 w-3.5" />
                                    </div>
                                    <Input 
                                        placeholder={f.placeholder} 
                                        className="pl-9 h-9 bg-white/5 border-white/10 rounded-lg text-[10px] font-medium uppercase tracking-tight focus:bg-white/10 transition-all" 
                                        value={f.value} 
                                        onChange={e => f.setter(e.target.value)} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    {["Intern Profile", "Institutional Details", "Roll No.", "HOD Contact", "Actions"].map(h => (
                                        <th key={h} className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] first:pl-6 last:pr-6 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-40">
                                                <div className="h-2 w-32 bg-primary/20 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Querying database...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center opacity-30">
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">No matches found for current criteria.</span>
                                        </td>
                                    </tr>
                                ) : paginated.map(intern => (
                                    <tr key={intern.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 first:pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-inner">
                                                    {intern.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[11px] text-foreground uppercase tracking-tight leading-none mb-1">{intern.name}</span>
                                                    <span className="text-[10px] text-primary font-bold lowercase opacity-80 leading-none">{intern.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-black text-foreground uppercase truncate max-w-[200px]">{(intern as any).college || "N/A"}</p>
                                                <p className="text-[9px] font-medium text-muted-foreground uppercase opacity-60">{(intern as any).university || "N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[10px] font-black text-primary tabular-nums tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md">
                                                {(intern as any).rollNumber || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1">{(intern as any).hodName || "N/A"}</span>
                                                <span className="text-[8px] font-medium text-muted-foreground lowercase opacity-60 leading-none">{(intern as any).hodEmail || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 last:pr-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20" 
                                                    onClick={() => openEdit(intern)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
                                                    onClick={() => { if (confirm("Permanently archive this intern record?")) deleteMutation.mutate(intern.id); }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/5">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest tabular-nums leading-none">
                            Entry {(safePage - 1) * perPage + 1} – {Math.min(safePage * perPage, filtered.length)} / {filtered.length} total
                        </span>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPage(p => Math.max(1, p - 1))} 
                                disabled={safePage === 1} 
                                className="h-8 px-3 rounded-lg text-[10px] font-black uppercase gap-1 border-white/10"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-[10px] font-black tabular-nums border border-white/10 px-3 h-8 flex items-center rounded-lg bg-black/20 text-foreground">
                                {safePage} / {totalPages}
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                disabled={safePage === totalPages} 
                                className="h-8 px-3 rounded-lg text-[10px] font-black uppercase gap-1 border-white/10"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
                <DialogContent className="max-w-xl border-none bg-transparent p-0 shadow-none w-[95vw] h-[90vh]">
                    <div className="bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass flex flex-col h-full">
                        <DialogHeader className="p-6 border-b border-white/5 bg-white/5 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Profile</DialogTitle>
                                    <DialogDescription className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Database Record Management</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <ScrollArea className="flex-1 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                                {[
                                    { label: "Full Name", key: "name", placeholder: "e.g. Harish Nath" },
                                    { label: "Email Address", key: "email", placeholder: "e.g. harish@example.com" },
                                    { label: "Phone Connection", key: "phone", placeholder: "e.g. +91 9876543210" },
                                    { label: "Academic Roll No.", key: "rollNumber", placeholder: "e.g. 21CS001" },
                                    { label: "University Name", key: "university", placeholder: "e.g. University Name" },
                                    { label: "Affiliated College", key: "college", placeholder: "e.g. Engineering College" },
                                    { label: "Department", key: "department", placeholder: "e.g. Computer Science" },
                                    { label: "HOD Full Name", key: "hodName", placeholder: "e.g. Dr. Ramesh Babu" },
                                    { label: "HOD Official Email", key: "hodEmail", placeholder: "e.g. hod.cs@college.edu" },
                                ].map((field) => (
                                    <div key={field.key} className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">{field.label}</Label>
                                        <Input 
                                            placeholder={field.placeholder} 
                                            className="h-10 bg-white/5 border-white/10 rounded-xl text-xs font-bold uppercase tracking-tight focus:bg-white/10"
                                            value={(form as any)[field.key]} 
                                            onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} 
                                        />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <DialogFooter className="p-6 border-t border-white/5 bg-white/5 shrink-0">
                            <div className="flex items-center justify-end gap-3 w-full">
                                <Button variant="ghost" onClick={close} className="rounded-xl font-black text-[10px] uppercase tracking-widest h-11 px-6">Cancel</Button>
                                <Button 
                                    onClick={() => updateMutation.mutate(form)} 
                                    disabled={updateMutation.isPending || !form.name} 
                                    className="rounded-xl font-black text-[10px] uppercase tracking-widest h-11 px-8 shadow-lg shadow-primary/20"
                                >
                                    {updateMutation.isPending ? "Syncing..." : "Commit Changes"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
