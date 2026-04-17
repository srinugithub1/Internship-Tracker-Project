import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { Search, ChevronRight, Mail, Phone, Hash, Users, Eye, GraduationCap, Building2, MapPin, UserCheck, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function HODStudents() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [user] = useState(storedUser);
    const [search, setSearch] = useState("");
    const [selectedIntern, setSelectedIntern] = useState<User | null>(null);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const perPage = 10;

    const { data: interns = [], isLoading } = useQuery<User[]>({
        queryKey: ["/api/hod/students", user.email],
        queryFn: async () => {
            const res = await fetch(`/api/hod/students?hodEmail=${user.email}`);
            if (!res.ok) throw new Error("Failed to fetch supervised students");
            return res.json();
        },
        enabled: !!user.email
    });

    const filtered = interns.filter(i => 
        i.name.toLowerCase().includes(search.toLowerCase()) || 
        i.email.toLowerCase().includes(search.toLowerCase()) ||
        (i.rollNumber || "").toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginatedInterns = filtered.slice((page - 1) * perPage, page * perPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <AppLayout>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">
                        My Students
                    </h1>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                        Managing {interns.length} interns from {user.collegeName || "your department"}.
                    </p>
                </div>
                <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3 w-fit">
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest">Total Supervised</span>
                    <span className="text-lg font-black text-primary tabular-nums">{interns.length}</span>
                </div>
            </header>

            <div className="flex gap-4 items-center p-4 glass rounded-xl border-white/10 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, email or roll number..." 
                        className="pl-9 h-10 bg-white/5 border-white/10 rounded-xl text-xs"
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className="glass rounded-xl border-white/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student Info</th>
                                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Roll Number</th>
                                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Progress</th>
                                <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-8 w-40 bg-white/5 rounded-lg" /></td>
                                        <td className="p-4"><div className="h-5 w-20 bg-white/5 rounded-lg" /></td>
                                        <td className="p-4"><div className="h-1.5 w-full bg-white/5 rounded-full" /></td>
                                        <td className="p-4 text-right"><div className="h-8 w-16 bg-white/5 rounded-lg float-right" /></td>
                                    </tr>
                                ))
                            ) : paginatedInterns.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-muted-foreground text-xs italic">
                                        No students found.
                                    </td>
                                </tr>
                            ) : paginatedInterns.map((intern, i) => (
                                <tr key={intern.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all text-xs">
                                                {intern.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs text-foreground truncate">{intern.name}</p>
                                                <p className="text-[9px] font-medium text-muted-foreground truncate opacity-70">
                                                    {intern.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="rounded-lg font-black tracking-widest bg-white/5 border-white/10 px-2 py-0.5 text-[9px]">
                                            {intern.rollNumber || "N/A"}
                                        </Badge>
                                    </td>
                                    <td className="p-4 w-[200px]">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-muted-foreground leading-none">
                                                <span>Performance</span>
                                                <span className="text-primary">{(intern as any).completedTasks || 0} / {(intern as any).totalTasks || 0}</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${
                                                        ((intern as any).progress || 0) > 70 ? 'bg-green-500' :
                                                        ((intern as any).progress || 0) > 30 ? 'bg-blue-500' :
                                                        'bg-muted'
                                                    }`}
                                                    style={{ width: `${(intern as any).progress || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => setSelectedIntern(intern)}
                                            className="rounded-xl font-black uppercase text-[9px] gap-2 h-8 px-4 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-white/5 bg-white/5 gap-4">
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} students
                        </span>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <div className="h-8 px-3 flex items-center justify-center font-black text-xs bg-black/20 rounded-lg border border-white/10 tabular-nums">
                                {page} / {totalPages}
                            </div>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Student Details Modal */}
            <Dialog open={!!selectedIntern} onOpenChange={(open) => !open && setSelectedIntern(null)}>
                <DialogContent className="max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-none w-[95vw]">
                    <div className="bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass">
                        {/* Modal Header */}
                        <div className="p-5 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-white/5">
                            <div className="flex items-start gap-4">
                                <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-black shadow-lg border-2 border-white/10 shrink-0">
                                    {selectedIntern?.name?.charAt(0)}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <DialogTitle className="text-xl font-black tracking-tight">{selectedIntern?.name}</DialogTitle>
                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px] h-4 rounded-md">Active</Badge>
                                    </div>
                                    <p className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                                        <Mail className="h-3 w-3 text-primary" />{selectedIntern?.email}
                                    </p>
                                    <p className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                                        <Phone className="h-3 w-3 text-primary" />{selectedIntern?.phone || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-primary">Academic</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-muted-foreground leading-none mb-1">University</p>
                                                <p className="font-bold text-xs">{selectedIntern?.university || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-muted-foreground leading-none mb-1">College</p>
                                                <p className="font-bold text-xs">{selectedIntern?.college || selectedIntern?.collegeName || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-primary">Identification</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-muted-foreground leading-none mb-1">Roll Number</p>
                                                <p className="font-black text-xs text-primary">{selectedIntern?.rollNumber || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-muted-foreground leading-none mb-1">Guide (HOD)</p>
                                                <p className="font-bold text-xs">{(selectedIntern as any)?.hodName || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-black text-sm uppercase tracking-widest">Progress Analytics</h4>
                                    <span className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                        {((selectedIntern as any)?.progress || 0)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-4">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000"
                                        style={{ width: `${(selectedIntern as any)?.progress || 0}%` }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-black/10 rounded-xl">
                                        <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none mb-1 text-center">Completed</p>
                                        <p className="text-xl font-black text-center">{(selectedIntern as any)?.completedTasks || 0}</p>
                                    </div>
                                    <div className="p-3 bg-black/10 rounded-xl">
                                        <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none mb-1 text-center">Total</p>
                                        <p className="text-xl font-black text-center">{(selectedIntern as any)?.totalTasks || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 flex justify-end">
                            <Button onClick={() => setSelectedIntern(null)} variant="outline" className="rounded-xl px-8 font-black uppercase text-[10px] h-10 border-white/10">
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
