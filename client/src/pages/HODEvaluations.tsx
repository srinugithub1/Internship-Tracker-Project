import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { type User, type EvaluationSheet } from "@shared/schema";
import { Search, RotateCcw, FileText, TrendingUp, Award, Target, BookOpen, ChevronLeft, ChevronRight, UserCircle, Printer, Download, GraduationCap, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type EvaluationWithUser = {
    intern: User;
    sheet: EvaluationSheet | null;
};

export default function HODEvaluations() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [user] = useState(storedUser);
    const [search, setSearch] = useState("");
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    // Modal State
    const [selectedEval, setSelectedEval] = useState<EvaluationWithUser | null>(null);

    const { data: evaluations = [], isLoading } = useQuery<EvaluationWithUser[]>({
        queryKey: ["/api/hod/evaluations", user.email],
        queryFn: async () => {
            const res = await fetch(`/api/hod/evaluations?hodEmail=${user.email}`);
            if (!res.ok) throw new Error("Failed to fetch evaluations");
            return res.json();
        },
        enabled: !!user.email
    });

    const filtered = useMemo(() => {
        return evaluations.filter(e => 
            e.intern.name.toLowerCase().includes(search.toLowerCase()) || 
            (e.intern.rollNumber || "").toLowerCase().includes(search.toLowerCase()) ||
            e.intern.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [evaluations, search]);

    // Pagination Logic
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="flex bg-secondary/30 min-h-screen font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1300px] mx-auto space-y-8">
                    <header className="flex justify-between items-end animate-in fade-in slide-in-from-left duration-700">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                Student Marks
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-medium">
                                Performance evaluation scores for interns in your department.
                            </p>
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 px-6 py-4 rounded-3xl flex items-center gap-4 shadow-xl shadow-indigo-500/5">
                            <GraduationCap className="h-6 w-6 text-indigo-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest leading-none">Total Interns</span>
                                <span className="text-2xl font-black text-foreground">{evaluations.length}</span>
                            </div>
                        </div>
                    </header>

                    {/* Search & Refresh */}
                    <div className="flex gap-4 items-center p-5 glass rounded-2xl border-white/10 shadow-xl">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, email or roll number..." 
                                className="pl-9 h-11 bg-white/5 border-white/10 rounded-xl font-medium"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white/10" onClick={() => { setSearch(""); setCurrentPage(1); }}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Enhanced Marks Table */}
                    <div className="glass rounded-[2rem] border-white/10 shadow-2xl overflow-hidden relative">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Intern Details</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center px-2">Technical<br/>(10)</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center px-2">Ethics<br/>(5)</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center px-2">Deliv.<br/>(5)</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center px-2">Learning<br/>(5)</th>
                                    <th className="p-6 text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center px-2">Total<br/>(25)</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right border-l border-white/5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-20">
                                            <td colSpan={7} className="p-6 bg-white/5" />
                                        </tr>
                                    ))
                                ) : paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center text-muted-foreground italic font-medium opacity-50">
                                            No evaluation records found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((evalItem) => (
                                        <tr key={evalItem.intern.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-6 min-w-[220px]">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                                                        {evalItem.intern.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-foreground truncate">{evalItem.intern.name}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter opacity-70">
                                                            {evalItem.intern.rollNumber || "ID: N/A"} • {evalItem.intern.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="font-black text-lg opacity-80">{evalItem.sheet?.technicalKnowledge || "--"}</span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="font-black text-lg opacity-80">{evalItem.sheet?.workEthics || "--"}</span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="font-black text-lg opacity-80">{evalItem.sheet?.deliverablesOutcomes || "--"}</span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="font-black text-lg opacity-80">{evalItem.sheet?.abilityToLearn || "--"}</span>
                                            </td>
                                            <td className="p-6 text-center bg-indigo-500/5">
                                                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 min-w-[50px]">
                                                    <span className="font-black text-xl text-indigo-500 leading-none">
                                                        {evalItem.sheet?.totalMarks || "--"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right border-l border-white/5">
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => setSelectedEval(evalItem)}
                                                    className="rounded-xl font-black gap-2 h-10 px-6 hover:bg-white hover:text-black transition-all border-white/10 shadow-sm"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    View Memo
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Footer */}
                        <div className="p-4 bg-white/5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-8 gap-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                    Showing {paginatedData.length} of {filtered.length} Marks Sheets
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-xl h-9 hover:bg-white/5 text-xs font-bold gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Prev
                                </Button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 3 + i + 1;
                                        if (pageNum > totalPages) return null;
                                        
                                        return (
                                            <button 
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`h-8 w-8 rounded-lg text-[10px] font-black transition-all border ${currentPage === pageNum ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-white/10 text-muted-foreground hover:bg-white/5'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="rounded-xl h-9 hover:bg-white/5 text-xs font-bold gap-2"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mark Memo Modal */}
            <Dialog open={!!selectedEval} onOpenChange={(open) => !open && setSelectedEval(null)}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <div className="bg-background rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden glass max-h-[92vh] flex flex-col">
                        {/* Certificate Header Decoration */}
                        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 shrink-0" />
                        
                        <div className="p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            {/* Document Header */}
                            <div className="flex justify-between items-start border-b border-indigo-500/10 pb-6">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Official Transcript</span>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight uppercase leading-tight">
                                        Performance Evaluation<br/>
                                        <span className="text-indigo-500 italic">Mark Memo</span>
                                    </h2>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Issue Date</p>
                                    <p className="font-bold text-xs tracking-tight">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    <div className="pt-2 flex gap-1.5 justify-end">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white/5 hover:bg-indigo-500 hover:text-white transition-all">
                                            <Printer className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white/5 hover:bg-indigo-500 hover:text-white transition-all">
                                            <Download className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Intern Profile */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-none">Full Name</p>
                                    <p className="font-black text-xs text-foreground truncate">{selectedEval?.intern.name}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-none">Roll Number</p>
                                    <p className="font-black text-xs text-indigo-400">{selectedEval?.intern.rollNumber || "N/A"}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-none">Department</p>
                                    <p className="font-black text-xs text-foreground">{selectedEval?.intern.department || "General"}</p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-none">Email Address</p>
                                    <p className="font-black text-[9px] text-foreground truncate">{selectedEval?.intern.email}</p>
                                </div>
                            </div>

                            {/* Marks Table */}
                            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20 shadow-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-indigo-500/5 border-b border-white/10">
                                            <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-6 w-16">S.No</th>
                                            <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Assessment Category</th>
                                            <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center w-28">Max</th>
                                            <th className="p-4 text-[9px] font-black text-indigo-500 uppercase tracking-widest text-right pr-6 w-28">Obtained</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { id: 1, label: "Technical Knowledge & Skills", max: 10, val: selectedEval?.sheet?.technicalKnowledge, icon: Award },
                                            { id: 2, label: "Work Ethics & Professionalism", max: 5, val: selectedEval?.sheet?.workEthics, icon: Target },
                                            { id: 3, label: "Deliverables & Implementation", max: 5, val: selectedEval?.sheet?.deliverablesOutcomes, icon: BookOpen },
                                            { id: 4, label: "Ability to Learn & Adapt", max: 5, val: selectedEval?.sheet?.abilityToLearn, icon: TrendingUp }
                                        ].map((row) => (
                                            <tr key={row.id} className="hover:bg-white/[0.02]">
                                                <td className="p-4 pl-6 text-xs font-black text-muted-foreground opacity-50">{row.id}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <row.icon className="h-3.5 w-3.5 text-indigo-500/40" />
                                                        <span className="font-bold text-xs tracking-tight">{row.label}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-bold text-xs opacity-60">{row.max}.00</td>
                                                <td className="p-4 text-right pr-6 font-black text-base text-foreground">
                                                    {row.val || "--"}.00
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-indigo-500/5 border-t border-white/10">
                                            <td colSpan={2} className="p-4 pl-6">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                                    <span className="font-black text-xs uppercase tracking-widest text-indigo-500">Aggregate Score</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-black text-sm opacity-60">25.00</td>
                                            <td className="p-4 text-right pr-6 font-black text-xl text-indigo-500 leading-none">
                                                {selectedEval?.sheet?.totalMarks || "--"}.00
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Evaluation Status & Policy */}
                            <div className="flex gap-3 items-stretch">
                                <div className={`flex-1 flex items-center justify-between p-5 rounded-2xl border ${selectedEval?.sheet ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                                    <div className="flex items-center gap-3">
                                        {selectedEval?.sheet ? (
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        ) : (
                                            <AlertCircle className="h-6 w-6 text-amber-500" />
                                        )}
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60 leading-none">Result Status</p>
                                            <p className={`text-base font-black mt-0.5 ${selectedEval?.sheet ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {selectedEval?.sheet ? 'Evaluated' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedEval?.sheet && (
                                        <Badge className="bg-emerald-500 text-white border-none rounded-lg px-3 py-1 font-black uppercase tracking-widest text-[9px] shadow-lg">Excellent</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-indigo-500/[0.03] border-t border-white/5 flex justify-end gap-3 shrink-0">
                            <Button variant="ghost" onClick={() => setSelectedEval(null)} className="rounded-xl px-6 font-black border-white/10 hover:bg-white/5 h-10 text-xs">
                                Dismiss
                            </Button>
                            <Button onClick={() => setSelectedEval(null)} className="rounded-xl px-10 font-black h-10 bg-indigo-500 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-500/40 active:scale-95 transition-all text-xs">
                                Close Memo
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
