import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { type User, type EvaluationSheet } from "@shared/schema";
import { Search, RotateCcw, FileText, TrendingUp, Award, Target, BookOpen, ChevronLeft, ChevronRight, GraduationCap, Printer, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import EvaluationMemo from "@/components/EvaluationMemo";

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
    const printRef = useRef<HTMLDivElement>(null);

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

    const handlePrint = () => {
        const printContent = document.getElementById("printable-memo");
        if (!printContent) return;

        const originalContent = document.body.innerHTML;
        const printArea = printContent.outerHTML;

        // Create a temporary hidden iframe or just swap body content
        // Swapping body content is simpler for window.print()
        document.body.innerHTML = `
            <style>
                @page { size: portrait; margin: 0; }
                body { background: white !important; color: black !important; font-family: sans-serif; }
                .memo-container { padding: 40px; margin: 0; width: 100%; box-sizing: border-box; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid black; padding: 12px; font-size: 11px; text-align: center; }
                .text-left { text-align: left; }
                .font-bold { font-weight: bold; }
                .text-center { text-align: center; }
                .grid { display: grid; }
                .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
                .gap-4 { gap: 1rem; }
                .relative { position: relative; }
                .absolute { position: absolute; }
                .inset-0 { top: 0; left: 0; right: 0; bottom: 0; }
                .flex { display: flex; }
                .flex-col { flex-direction: column; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .mt-16 { margin-top: 4rem; }
                .mt-8 { margin-top: 2rem; }
                .mb-8 { margin-bottom: 2rem; }
                .border-t { border-top: 1px solid black; }
                .w-full { width: 100%; }
                .pt-2 { padding-top: 0.5rem; }
                .h-28 { height: 7rem; }
                .text-2xl { font-size: 1.5rem; }
                .text-indigo-900 { color: #1e3a8a; }
                .italic { font-style: italic; }
            </style>
            <div class="memo-container">
                ${printArea}
            </div>
        `;

        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Reload to restore React state and event listeners
    };

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
                                    <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center w-28 whitespace-normal leading-tight">Ability to learn<br/>independently (5)</th>
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

            {/* Formal Mark Memo Modal */}
            <Dialog open={!!selectedEval} onOpenChange={(open) => !open && setSelectedEval(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-white shadow-none">
                    <div className="flex flex-col h-[92vh]">
                        {/* Control Bar (Hidden on Print) */}
                        <div className="p-4 bg-muted/20 border-b flex justify-between items-center sticky top-0 z-50">
                            <div className="flex flex-col">
                                <h3 className="font-black text-lg text-foreground">Marks Memo</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Download your evaluation sheet</p>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handlePrint} className="rounded-xl bg-primary text-white hover:bg-primary/90 gap-2 font-bold px-6 h-10">
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                                <Button variant="ghost" onClick={() => setSelectedEval(null)} className="h-10 w-10 p-0 rounded-xl">
                                    <AlertCircle className="rotate-45 h-6 w-6" />
                                </Button>
                            </div>
                        </div>

                        {/* Printable Document Area */}
                        <div className="flex-1 overflow-y-auto p-12 bg-white flex justify-center custom-scrollbar">
                            <div id="printable-memo" className="w-full flex justify-center">
                                {selectedEval?.sheet && (
                                    <EvaluationMemo 
                                        user={selectedEval.intern} 
                                        sheet={selectedEval.sheet} 
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
