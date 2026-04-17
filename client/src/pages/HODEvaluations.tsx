import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { type User, type EvaluationSheet } from "@shared/schema";
import { Search, RotateCcw, FileText, TrendingUp, ChevronLeft, ChevronRight, GraduationCap, Download, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
    const pageSize = 10;

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
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handlePrint = () => {
        const printContent = document.getElementById("printable-memo");
        if (!printContent) return;

        const originalContent = document.body.innerHTML;
        const printArea = printContent.outerHTML;

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
        window.location.reload(); 
    };

    return (
        <AppLayout>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">
                        Student Marks
                    </h1>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                        Performance evaluation scores for interns in your department.
                    </p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-3 w-fit">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest leading-none">Total Records</span>
                        <span className="text-lg font-black text-foreground tabular-nums">{evaluations.length}</span>
                    </div>
                </div>
            </header>

            <div className="flex gap-4 items-center p-4 glass rounded-xl border-white/10 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, email or roll number..." 
                        className="pl-9 h-10 bg-white/5 border-white/10 rounded-xl text-xs"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10" onClick={() => { setSearch(""); setCurrentPage(1); }}>
                    <RotateCcw className="h-3.5 w-3.5" />
                </Button>
            </div>

            <div className="glass rounded-xl border-white/10 shadow-sm overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Intern Details</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Technical<br/>(10)</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Ethics<br/>(5)</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Deliv.<br/>(5)</th>
                                <th className="p-4 text-[8px] font-black text-muted-foreground uppercase tracking-widest text-center leading-tight">Learning<br/>(5)</th>
                                <th className="p-4 text-[9px] font-black text-indigo-500 uppercase tracking-widest text-center">Total<br/>(25)</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-16">
                                        <td colSpan={7} className="p-4 bg-white/5" />
                                    </tr>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-muted-foreground text-xs italic opacity-50">
                                        No evaluation records found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((evalItem) => (
                                    <tr key={evalItem.intern.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all text-xs">
                                                    {evalItem.intern.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-foreground truncate">{evalItem.intern.name}</p>
                                                    <p className="text-[9px] font-medium text-muted-foreground truncate opacity-70 uppercase tracking-tighter">
                                                        {evalItem.intern.rollNumber || "N/A"} • {evalItem.intern.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-sm opacity-80 tabular-nums">{evalItem.sheet?.technicalKnowledge ?? "--"}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-sm opacity-80 tabular-nums">{evalItem.sheet?.workEthics ?? "--"}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-sm opacity-80 tabular-nums">{evalItem.sheet?.deliverablesOutcomes ?? "--"}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-sm opacity-80 tabular-nums">{evalItem.sheet?.abilityToLearn ?? "--"}</span>
                                        </td>
                                        <td className="p-4 text-center bg-indigo-500/5">
                                            <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 min-w-[35px]">
                                                <span className="font-black text-sm text-indigo-500 leading-none tabular-nums">
                                                    {evalItem.sheet?.totalMarks ?? "--"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button 
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedEval(evalItem)}
                                                className="rounded-xl font-black uppercase text-[9px] gap-2 h-8 px-4 border-indigo-500/20 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                            >
                                                <FileText className="h-3 w-3" />
                                                Memo
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                            Showing {paginatedData.length} of {filtered.length} Marks Sheets
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 rounded-lg text-[10px] uppercase font-black"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                        </Button>
                        
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-black px-3 py-1 bg-black/20 rounded-lg border border-white/10 tabular-nums">
                                {currentPage} / {totalPages}
                            </span>
                        </div>

                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-8 rounded-lg text-[10px] uppercase font-black"
                        >
                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedEval} onOpenChange={(open) => !open && setSelectedEval(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-white shadow-none w-[95vw] h-[95vh]">
                    <div className="flex flex-col h-full">
                        <div className="p-4 bg-muted/20 border-b flex justify-between items-center sticky top-0 z-50 shrink-0">
                            <div className="flex flex-col">
                                <h3 className="font-black text-sm text-foreground uppercase tracking-wider">Marks Memo</h3>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">Official Internal Evaluation</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handlePrint} className="rounded-xl px-4 h-9 text-[10px] font-black uppercase tracking-widest gap-2">
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                </Button>
                                <Button variant="ghost" onClick={() => setSelectedEval(null)} className="h-9 w-9 p-0 rounded-xl hover:bg-black/5">
                                    <AlertCircle className="h-5 w-5 rotate-45" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white flex justify-center custom-scrollbar">
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
        </AppLayout>
    );
}
