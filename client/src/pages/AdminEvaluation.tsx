import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Search, Plus, RotateCcw, FileText, Download, Users, 
    ChevronLeft, ChevronRight, RefreshCw, GraduationCap, 
    Printer, Award, Target, BookOpen, TrendingUp, CheckCircle2, 
    AlertCircle, Eye
} from "lucide-react";
import { useState, useMemo } from "react";
import { type User, type EvaluationSheet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import EvaluationMemo from "@/components/EvaluationMemo";

type MarksForm = {
    technicalKnowledge: string;
    workEthics: string;
    deliverablesOutcomes: string;
    abilityToLearn: string;
    remarks: string;
};

const blankMarks: MarksForm = {
    technicalKnowledge: "",
    workEthics: "",
    deliverablesOutcomes: "",
    abilityToLearn: "",
    remarks: "",
};

export default function AdminEvaluation() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedIntern, setSelectedIntern] = useState<User | null>(null);
    const [formData, setFormData] = useState<MarksForm>(blankMarks);

    // Memo View State
    const [viewMemoItem, setViewMemoItem] = useState<{ intern: User, sheet: EvaluationSheet | null } | null>(null);

    // Bulk Evaluation State
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [bulkFormData, setBulkFormData] = useState<MarksForm>(blankMarks);
    const [bulkSearch, setBulkSearch] = useState("");
    const [selectedInternIds, setSelectedInternIds] = useState<Set<string>>(new Set());

    // Pagination State
    const [page, setPage] = useState(1);
    const perPage = 10;

    const { data: interns = [], isLoading: loadingInterns, refetch: refetchInterns } = useQuery<User[]>({
        queryKey: ["/api/interns"],
        refetchInterval: 30000,
    });

    const { data: allSheets = [], isLoading: loadingSheets, refetch: refetchSheets } = useQuery<EvaluationSheet[]>({
        queryKey: ["/api/evaluation-sheets"],
        refetchInterval: 30000,
    });

    const saveMutation = useMutation({
        mutationFn: async (data: { userId: string } & MarksForm) => {
            const totalMarks = (
                (parseFloat(data.technicalKnowledge) || 0) +
                (parseFloat(data.workEthics) || 0) +
                (parseFloat(data.deliverablesOutcomes) || 0) +
                (parseFloat(data.abilityToLearn) || 0)
            ).toFixed(2);

            const res = await apiRequest("POST", "/api/evaluation-sheets", {
                userId: data.userId,
                technicalKnowledge: data.technicalKnowledge || "0",
                workEthics: data.workEthics || "0",
                deliverablesOutcomes: data.deliverablesOutcomes || "0",
                abilityToLearn: data.abilityToLearn || "0",
                remarks: data.remarks || "",
                totalMarks
            });
            return res;
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Evaluation saved successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/evaluation-sheets"] });
            setIsDialogOpen(false);
            setSelectedIntern(null);
            setFormData(blankMarks);
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message || "Failed to save evaluation", variant: "destructive" });
        }
    });

    const bulkSaveMutation = useMutation({
        mutationFn: async (data: { userIds: string[] } & MarksForm) => {
            const totalMarks = (
                (parseFloat(data.technicalKnowledge) || 0) +
                (parseFloat(data.workEthics) || 0) +
                (parseFloat(data.deliverablesOutcomes) || 0) +
                (parseFloat(data.abilityToLearn) || 0)
            ).toFixed(2);

            const evaluations = data.userIds.map(userId => ({
                userId,
                technicalKnowledge: data.technicalKnowledge || "0",
                workEthics: data.workEthics || "0",
                deliverablesOutcomes: data.deliverablesOutcomes || "0",
                abilityToLearn: data.abilityToLearn || "0",
                remarks: data.remarks || "",
                totalMarks
            }));

            return apiRequest("POST", "/api/evaluation-sheets/bulk", { evaluations });
        },
        onSuccess: () => {
            toast({ title: "Success", description: `Updated marks for ${selectedInternIds.size} interns successfully!` });
            queryClient.invalidateQueries({ queryKey: ["/api/evaluation-sheets"] });
            setIsBulkDialogOpen(false);
            setSelectedInternIds(new Set());
            setBulkFormData(blankMarks);
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message || "Failed to save bulk evaluations", variant: "destructive" });
        }
    });

    const handleOpenEdit = (intern: User) => {
        setSelectedIntern(intern);
        const existing = allSheets.find(s => s.userId === intern.id);
        if (existing) {
            setFormData({
                technicalKnowledge: existing.technicalKnowledge as string,
                workEthics: existing.workEthics as string,
                deliverablesOutcomes: existing.deliverablesOutcomes as string,
                abilityToLearn: existing.abilityToLearn as string,
                remarks: existing.remarks || ""
            });
        } else {
            setFormData(blankMarks);
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!selectedIntern) return;
        saveMutation.mutate({
            userId: selectedIntern.id,
            ...formData
        });
    };

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

    const filteredInterns = useMemo(() => interns.filter(intern => 
        intern.name.toLowerCase().includes(search.toLowerCase()) || 
        (intern.rollNumber || "").toLowerCase().includes(search.toLowerCase()) || 
        intern.email.toLowerCase().includes(search.toLowerCase())
    ), [interns, search]);

    const totalPages = Math.max(1, Math.ceil(filteredInterns.length / perPage));
    const safePage = Math.min(page, totalPages);
    const paginatedInterns = filteredInterns.slice((safePage - 1) * perPage, safePage * perPage);

    // Auto-reset page when search changes
    const [lastSearch, setLastSearch] = useState(search);
    if (search !== lastSearch) {
        setPage(1);
        setLastSearch(search);
    }

    return (
        <AppLayout>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">
                        Evaluations & Marks
                    </h1>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                        Evaluate intern performance and generate marks memos.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl shadow-sm h-11">
                        <div className="flex flex-col items-center border-r border-white/10 pr-4">
                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest leading-none">Total</span>
                            <span className="text-lg font-black text-primary leading-none tabular-nums">{interns.length}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest leading-none">Done</span>
                            <span className="text-lg font-black text-emerald-500 leading-none tabular-nums">{allSheets.length}</span>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setIsBulkDialogOpen(true)}
                        className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 gap-2 font-bold text-xs uppercase tracking-widest"
                    >
                        <Users className="h-4 w-4" />
                        Bulk
                    </Button>
                </div>
            </header>

            <div className="flex flex-col sm:flex-row gap-4 items-center p-4 glass rounded-xl border-white/10 shadow-sm">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search interns..." 
                        className="pl-9 h-10 bg-white/5 border-white/10 rounded-xl text-xs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl" onClick={() => setSearch("")}>
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            <div className="glass rounded-xl border-white/10 shadow-sm overflow-hidden relative text-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Intern Details</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Roll Number</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Dept & HOD</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Tech</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Ethics</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Deliv.</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Ability</th>
                                <th className="p-4 text-[9px] font-black text-primary uppercase tracking-widest text-center border-l border-white/5 bg-primary/5">Total (25)</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right border-l border-white/5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loadingInterns || loadingSheets ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-16">
                                        <td colSpan={9} className="p-4" />
                                    </tr>
                                ))
                            ) : paginatedInterns.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-20 text-center text-muted-foreground font-bold italic opacity-40 uppercase text-xs tracking-widest">No interns found.</td>
                                </tr>
                            ) : (
                                paginatedInterns.map(intern => {
                                    const sheet = allSheets.find(s => s.userId === intern.id);
                                    return (
                                        <tr key={intern.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 min-w-[180px]">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-xs tracking-tight text-foreground">{intern.name}</span>
                                                    <span className="text-[9px] font-medium text-muted-foreground opacity-70 truncate max-w-[130px]">{intern.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-[10px] font-black text-primary/80 tabular-nums">{intern.rollNumber || "—"}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">{intern.department || "General"}</p>
                                                    <p className="text-[9px] font-bold text-indigo-500 truncate max-w-[100px]">{(intern as any).hodName || "—"}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-black text-sm opacity-70 tabular-nums">{sheet ? sheet.technicalKnowledge : "—"}</td>
                                            <td className="p-4 text-center font-black text-sm opacity-70 tabular-nums">{sheet ? sheet.workEthics : "—"}</td>
                                            <td className="p-4 text-center font-black text-sm opacity-70 tabular-nums">{sheet ? sheet.deliverablesOutcomes : "—"}</td>
                                            <td className="p-4 text-center font-black text-sm opacity-70 tabular-nums">{sheet ? sheet.abilityToLearn : "—"}</td>
                                            <td className="p-4 text-center border-l border-white/5 bg-primary/5">
                                                <span className="text-base font-black text-primary tabular-nums">{sheet ? sheet.totalMarks : "—"}</span>
                                            </td>
                                            <td className="p-4 text-right border-l border-white/5">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => setViewMemoItem({ intern, sheet: sheet || null })}
                                                        disabled={!sheet}
                                                        className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button 
                                                        variant={sheet ? "outline" : "default"} 
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(intern)}
                                                        className="rounded-lg h-8 gap-1.5 px-3 font-black text-[9px] uppercase tracking-widest"
                                                    >
                                                        {sheet ? <FileText className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                                        {sheet ? "Edit" : "Score"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-white/5 bg-white/5 gap-4">
                        <div className="flex items-center gap-3">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest tabular-nums">
                                {(safePage - 1) * perPage + 1} - {Math.min(safePage * perPage, filteredInterns.length)} of {filteredInterns.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="h-8 rounded-lg text-[10px] uppercase font-black">
                                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                            </Button>
                            <span className="text-[10px] font-black px-3 py-1 bg-black/20 rounded-lg border border-white/10 tabular-nums">
                                {safePage} / {totalPages}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="h-8 rounded-lg text-[10px] uppercase font-black">
                                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
                   {/* Evaluation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none w-[95vw] h-[95vh]">
                    <div className="bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass flex flex-col h-full">
                        <DialogHeader className="p-6 border-b border-white/5 bg-white/5 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black">Score Intern</DialogTitle>
                                    <DialogDescription className="font-medium text-muted-foreground text-[10px] uppercase tracking-widest">
                                        Performance scores for <span className="text-foreground font-bold">{selectedIntern?.name}</span>
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        
                        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Technical (Max 10)</Label>
                                    <Input 
                                        type="number" step="0.5" min="0" max="10"
                                        className="h-10 bg-white/5 border-white/10 rounded-xl font-bold text-base tabular-nums"
                                        value={formData.technicalKnowledge}
                                        onChange={(e) => setFormData({...formData, technicalKnowledge: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Ethics (Max 5)</Label>
                                    <Input 
                                        type="number" step="0.5" min="0" max="5"
                                        className="h-10 bg-white/5 border-white/10 rounded-xl font-bold text-base tabular-nums"
                                        value={formData.workEthics}
                                        onChange={(e) => setFormData({...formData, workEthics: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Deliv. (Max 5)</Label>
                                    <Input 
                                        type="number" step="0.5" min="0" max="5"
                                        className="h-10 bg-white/5 border-white/10 rounded-xl font-bold text-base tabular-nums"
                                        value={formData.deliverablesOutcomes}
                                        onChange={(e) => setFormData({...formData, deliverablesOutcomes: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Ability (Max 5)</Label>
                                    <Input 
                                        type="number" step="0.5" min="0" max="5"
                                        className="h-10 bg-white/5 border-white/10 rounded-xl font-bold text-base tabular-nums"
                                        value={formData.abilityToLearn}
                                        onChange={(e) => setFormData({...formData, abilityToLearn: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase text-primary tracking-widest">Total Computed</p>
                                    <p className="text-[10px] font-bold text-muted-foreground tracking-tight">Out of 25.00</p>
                                </div>
                                <span className="text-3xl font-black text-primary tabular-nums">
                                    {(
                                        (parseFloat(formData.technicalKnowledge) || 0) +
                                        (parseFloat(formData.workEthics) || 0) +
                                        (parseFloat(formData.deliverablesOutcomes) || 0) +
                                        (parseFloat(formData.abilityToLearn) || 0)
                                    ).toFixed(2)}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Remarks</Label>
                                <Textarea 
                                    placeholder="Enter feedback..."
                                    className="min-h-[100px] bg-white/5 border-white/10 rounded-xl p-3 text-xs font-medium resize-none shadow-inner"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                                />
                            </div>
                        </div>

                        <DialogFooter className="p-6 bg-white/5 border-t border-white/10 shrink-0 flex flex-row gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl px-6 h-10 font-black text-[10px] uppercase tracking-widest">Dismiss</Button>
                            <Button onClick={handleSave} disabled={saveMutation.isPending} className="rounded-xl px-10 h-10 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                {saveMutation.isPending ? "Saving..." : "Finalize"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Evaluation Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none w-[95vw] h-[95vh]">
                    <div className="bg-background rounded-2xl border border-white/10 h-full flex flex-col glass overflow-hidden shadow-2xl">
                        <DialogHeader className="p-6 border-b border-white/5 bg-white/5 shrink-0">
                            <div className="flex justify-between items-center gap-4">
                                <div>
                                    <DialogTitle className="text-xl font-black uppercase tracking-widest">Batch Tool</DialogTitle>
                                    <DialogDescription className="font-medium text-muted-foreground text-[10px] uppercase tracking-widest leading-none mt-1">Standardized marks for batch</DialogDescription>
                                </div>
                                <Badge className="bg-primary text-white border-none rounded-lg px-3 py-1 font-black uppercase text-[10px] tracking-widest">Batch Mode</Badge>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 sm:p-6 gap-6 min-h-0">
                            {/* Left Section: Selection */}
                            <div className="flex-1 flex flex-col bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-inner min-h-0">
                                <div className="p-4 border-b border-white/10 space-y-3 bg-white/5">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search pending..." 
                                                className="pl-9 h-9 bg-black/20 border-white/10 rounded-xl text-xs"
                                                value={bulkSearch}
                                                onChange={(e) => setBulkSearch(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl shrink-0 bg-white/5 border border-white/10"
                                            onClick={() => { refetchInterns(); refetchSheets(); }}
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 ${(loadingInterns || loadingSheets) ? "animate-spin" : ""}`} />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <Checkbox 
                                                id="select-all" 
                                                className="rounded-md h-4 w-4 border-white/20"
                                                checked={
                                                    interns.filter(i => !allSheets.find(s => s.userId === i.id)).length > 0 &&
                                                    interns.filter(i => !allSheets.find(s => s.userId === i.id)).every(i => selectedInternIds.has(i.id))
                                                }
                                                onCheckedChange={(checked) => {
                                                    const newInters = interns.filter(i => !allSheets.find(s => s.userId === i.id));
                                                    if (checked) {
                                                        setSelectedInternIds(new Set(newInters.map(i => i.id)));
                                                    } else {
                                                        setSelectedInternIds(new Set());
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="select-all" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer opacity-80">All Pending</Label>
                                        </div>
                                        <div className="bg-primary/20 px-3 py-1 rounded-lg">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest tabular-nums">
                                                Selected: {selectedInternIds.size}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 p-4 custom-scrollbar">
                                    <div className="space-y-2 pr-1">
                                        {interns
                                            .filter(i => !allSheets.find(s => s.userId === i.id))
                                            .filter(i => 
                                                i.name.toLowerCase().includes(bulkSearch.toLowerCase()) || 
                                                (i.rollNumber || "").toLowerCase().includes(bulkSearch.toLowerCase())
                                            )
                                            .map(intern => (
                                                <div 
                                                    key={intern.id} 
                                                    onClick={() => {
                                                        const newSet = new Set(selectedInternIds);
                                                        if (newSet.has(intern.id)) newSet.delete(intern.id);
                                                        else newSet.add(intern.id);
                                                        setSelectedInternIds(newSet);
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                                        selectedInternIds.has(intern.id) 
                                                            ? "bg-primary/20 border-primary/40 shadow-sm" 
                                                            : "bg-white/5 border-transparent hover:border-white/10 hover:bg-white/[0.08]"
                                                    }`}
                                                >
                                                    <Checkbox checked={selectedInternIds.has(intern.id)} className="h-3.5 w-3.5 rounded-md" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-black tracking-tight">{intern.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5 leading-none">
                                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60 tabular-nums">
                                                                {intern.rollNumber || "ID: N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Right Section: Marks Form */}
                            <div className="w-full lg:w-[320px] lg:shrink-0 overflow-y-auto custom-scrollbar pr-1">
                                <div className="space-y-5 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Award className="h-4 w-4 text-primary" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Score Batch</h4>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Tech (10)</Label>
                                            <Input 
                                                type="number" step="0.5" min="0" max="10" placeholder="0.0"
                                                className="h-10 bg-black/40 border-white/10 rounded-xl font-bold text-base tabular-nums"
                                                value={bulkFormData.technicalKnowledge}
                                                onChange={(e) => setBulkFormData({...bulkFormData, technicalKnowledge: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Ethics (5)</Label>
                                            <Input 
                                                type="number" step="0.5" min="0" max="5" placeholder="0.0"
                                                className="h-10 bg-black/40 border-white/10 rounded-xl font-bold text-base tabular-nums"
                                                value={bulkFormData.workEthics}
                                                onChange={(e) => setBulkFormData({...bulkFormData, workEthics: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Deliv (5)</Label>
                                            <Input 
                                                type="number" step="0.5" min="0" max="5" placeholder="0.0"
                                                className="h-10 bg-black/40 border-white/10 rounded-xl font-bold text-base tabular-nums"
                                                value={bulkFormData.deliverablesOutcomes}
                                                onChange={(e) => setBulkFormData({...bulkFormData, deliverablesOutcomes: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Learn (5)</Label>
                                            <Input 
                                                type="number" step="0.5" min="0" max="5" placeholder="0.0"
                                                className="h-10 bg-black/40 border-white/10 rounded-xl font-bold text-base tabular-nums"
                                                value={bulkFormData.abilityToLearn}
                                                onChange={(e) => setBulkFormData({...bulkFormData, abilityToLearn: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-primary/20 border border-primary/20 flex justify-between items-center shadow-lg shadow-primary/5">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Batch Score</span>
                                        <span className="text-xl font-black text-primary tabular-nums">
                                            {(
                                                (parseFloat(bulkFormData.technicalKnowledge) || 0) +
                                                (parseFloat(bulkFormData.workEthics) || 0) +
                                                (parseFloat(bulkFormData.deliverablesOutcomes) || 0) +
                                                (parseFloat(bulkFormData.abilityToLearn) || 0)
                                            ).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Feedback</Label>
                                        <Textarea 
                                            placeholder="Standard remarks..."
                                            className="min-h-[100px] bg-black/40 border-white/10 rounded-xl resize-none p-3 text-[11px] font-medium shadow-inner"
                                            value={bulkFormData.remarks}
                                            onChange={(e) => setBulkFormData({...bulkFormData, remarks: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 bg-white/5 border-t border-white/10 shrink-0 flex flex-row gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setIsBulkDialogOpen(false)} className="rounded-xl px-10 h-10 font-black text-[10px] uppercase tracking-widest">Dismiss</Button>
                            <Button 
                                disabled={selectedInternIds.size === 0 || bulkSaveMutation.isPending}
                                onClick={() => bulkSaveMutation.mutate({ 
                                    userIds: Array.from(selectedInternIds),
                                    ...bulkFormData
                                })}
                                className="rounded-xl h-10 px-10 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                {bulkSaveMutation.isPending ? "Applying..." : `Process ${selectedInternIds.size}`}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Formal Mark Memo Modal */}
            <Dialog open={!!viewMemoItem} onOpenChange={(open) => !open && setViewMemoItem(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-white shadow-none w-[95vw] h-[95vh]">
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-4 bg-muted/20 border-b flex justify-between items-center sticky top-0 z-50 shrink-0">
                            <div className="flex flex-col">
                                <h3 className="font-black text-base text-foreground uppercase tracking-widest">Marks Memo</h3>
                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-70 tracking-widest">Review & Export</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handlePrint} className="rounded-lg bg-primary text-white hover:bg-primary/90 gap-2 font-black text-[10px] uppercase tracking-widest px-6 h-9">
                                    <Download className="h-4 w-4" />
                                    PDF
                                </Button>
                                <Button variant="ghost" onClick={() => setViewMemoItem(null)} className="h-9 w-9 p-0 rounded-lg">
                                    <AlertCircle className="rotate-45 h-5 w-5 opacity-40 hover:opacity-100 transition-opacity" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white flex justify-center custom-scrollbar">
                            <div id="printable-memo" className="w-full flex justify-center">
                                {viewMemoItem && viewMemoItem.sheet && (
                                    <EvaluationMemo 
                                        user={viewMemoItem.intern} 
                                        sheet={viewMemoItem.sheet} 
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
