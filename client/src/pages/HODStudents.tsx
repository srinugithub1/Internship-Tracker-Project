import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { Search, ChevronRight, Activity, Mail, Phone, Hash, Users, Eye, GraduationCap, Building2, MapPin, UserCheck, ChevronLeft } from "lucide-react";
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

    // Reset to page 1 on search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1200px] mx-auto space-y-8">
                    <header className="flex justify-between items-end animate-in fade-in slide-in-from-left duration-700">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                My Students
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-medium">
                                Managing {interns.length} interns from {user.collegeName || "your department"}.
                            </p>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/5">
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Total Supervised</span>
                            <span className="text-2xl font-black text-primary">{interns.length}</span>
                        </div>
                    </header>

                    <div className="flex gap-4 items-center p-5 glass rounded-2xl border-white/10 shadow-xl">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, email or roll number..." 
                                className="pl-9 h-11 bg-white/5 border-white/10 rounded-xl"
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    <div className="glass rounded-3xl border-white/10 shadow-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Student Information</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Roll Number</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Work Progress</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-6"><div className="h-10 w-48 bg-white/5 rounded-lg" /></td>
                                            <td className="p-6"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                                            <td className="p-6"><div className="h-2 w-full bg-white/5 rounded-full" /></td>
                                            <td className="p-6 text-right"><div className="h-10 w-20 bg-white/5 rounded-lg float-right" /></td>
                                        </tr>
                                    ))
                                ) : paginatedInterns.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-40">
                                                <Users className="h-12 w-12 mb-4" />
                                                <p className="font-bold">No students found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedInterns.map((intern, i) => (
                                    <tr key={intern.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                    {intern.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-foreground truncate">{intern.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter opacity-70 truncate max-w-[200px]">
                                                        {intern.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant="outline" className="rounded-lg font-black tracking-widest bg-white/5 border-white/10 px-3 py-1">
                                                {intern.rollNumber || "N/A"}
                                            </Badge>
                                        </td>
                                        <td className="p-6 w-[250px]">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    <span>Performance</span>
                                                    <span className="text-primary">{(intern as any).completedTasks || 0} / {(intern as any).totalTasks || 0} Tasks</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${
                                                            ((intern as any).progress || 0) > 70 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                                                            ((intern as any).progress || 0) > 30 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
                                                            'bg-muted'
                                                        }`}
                                                        style={{ width: `${(intern as any).progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setSelectedIntern(intern)}
                                                className="rounded-xl font-bold gap-2 px-5 hover:bg-primary hover:text-primary-foreground transition-all h-10"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-6 border-t border-white/5 bg-white/5">
                                <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">
                                    Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} students
                                </span>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-10 w-10 rounded-xl"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="h-10 px-4 flex items-center justify-center font-black text-sm bg-black/20 rounded-xl border border-white/10 tabular-nums">
                                        {page} / {totalPages}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-10 w-10 rounded-xl"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Student Details Modal */}
            <Dialog open={!!selectedIntern} onOpenChange={(open) => !open && setSelectedIntern(null)}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <div className="bg-background rounded-3xl border border-white/10 shadow-2xl overflow-hidden glass">
                        {/* Modal Header */}
                        <div className="p-8 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-white/5 relative">
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex gap-6">
                                    <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-black shadow-2xl shadow-primary/40 border-4 border-white/10">
                                        {selectedIntern?.name.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-3xl font-black tracking-tight">{selectedIntern?.name}</h2>
                                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 rounded-lg">
                                                Active Intern
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground font-medium flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-primary" />
                                            {selectedIntern?.email}
                                        </p>
                                        <p className="text-muted-foreground font-medium flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary" />
                                            {selectedIntern?.phone || "No phone added"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Institutional Profile</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">University</p>
                                                <p className="font-bold text-sm">{selectedIntern?.universityName || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">College</p>
                                                <p className="font-bold text-sm">{selectedIntern?.collegeName || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Department / Branch</p>
                                                <p className="font-bold text-sm">{(selectedIntern as any)?.department || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Identification</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                <Hash className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Student Id / Roll No</p>
                                                <p className="font-bold text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                                    {selectedIntern?.rollNumber || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                <UserCheck className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Academic Guide (HOD)</p>
                                                <p className="font-bold text-sm">{(selectedIntern as any)?.hodName || "Assigned by faculty"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Progress Section in Modal */}
                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-black tracking-tight text-lg">Work Progress Analytics</h4>
                                    <span className="font-black text-primary bg-primary/10 px-4 py-1.5 rounded-2xl border border-primary/20 text-sm">
                                        {((selectedIntern as any)?.progress || 0)}% Completed
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden border border-white/10 p-1 mb-4">
                                    <div 
                                        className={`h-full transition-all duration-1000 rounded-full shadow-lg ${
                                            ((selectedIntern as any).progress || 0) > 70 ? 'bg-gradient-to-r from-green-600 to-green-400 shadow-green-500/20' :
                                            ((selectedIntern as any).progress || 0) > 30 ? 'bg-gradient-to-r from-primary to-blue-400 shadow-primary/20' :
                                            'bg-muted shadow-none'
                                        }`}
                                        style={{ width: `${(selectedIntern as any).progress || 0}%` }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Tasks Completed</p>
                                        <p className="text-2xl font-black">{(selectedIntern as any)?.completedTasks || 0}</p>
                                    </div>
                                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Total Allocated</p>
                                        <p className="text-2xl font-black">{(selectedIntern as any)?.totalTasks || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white/5 border-t border-white/5 flex justify-end">
                            <Button onClick={() => setSelectedIntern(null)} variant="outline" className="rounded-2xl px-10 font-bold h-12 shadow-xl shadow-black/20 transition-all hover:scale-105 active:scale-95">
                                Close Profile
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
