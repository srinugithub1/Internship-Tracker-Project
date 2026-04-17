import Sidebar from "@/components/Sidebar";
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
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1300px] mx-auto space-y-6">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Evaluations & Marks</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">Evaluate intern performance and generate marks memos</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-sm">
                                <div className="flex flex-col items-center border-r border-white/10 pr-4">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total</span>
                                    <span className="text-lg font-black text-primary leading-none">{interns.length}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Evaluated</span>
                                    <span className="text-lg font-black text-green-500 leading-none">{allSheets.length}</span>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setIsBulkDialogOpen(true)}
                                className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 gap-2 font-bold"
                            >
                                <Users className="h-5 w-5" />
                                Bulk Evaluation
                            </Button>
                        </div>
                    </header>

                    <div className="flex gap-4 items-center p-5 glass rounded-2xl border-white/10 shadow-xl">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search interns by name, email or roll number..." 
                                className="pl-9 h-10 bg-white/5 border-white/10 rounded-xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl" onClick={() => setSearch("")}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden overflow-x-auto relative">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Intern Details</th>
                                    <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Roll Number</th>
                                    <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dept & HOD</th>
                                    <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center px-2">Tech<br/>(10)</th>
                                    <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center px-2">Ethics<br/>(5)</th>
                                    <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center px-2">Deliv.<br/>(5)</th>
                                    <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center w-28 whitespace-normal leading-tight">Ability to learn<br/>independently (5)</th>
                                    <th className="p-4 text-[10px] font-black text-primary uppercase tracking-widest text-center px-6 border-l border-white/5 bg-primary/5">Total (25)</th>
                                    <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right border-l border-white/5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y border-t border-white/5">
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
                                            <tr key={intern.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight">{intern.name}</span>
                                                        <span className="text-[10px] font-medium text-muted-foreground opacity-70 truncate max-w-[150px]">{intern.email}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs font-black text-primary/80">{intern.rollNumber || "—"}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 leading-none mb-1">{intern.department || "General"}</p>
                                                        <p className="text-[10px] font-bold text-indigo-500 whitespace-nowrap">{(intern as any).hodName || "—"}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-black text-base opacity-70">{sheet ? sheet.technicalKnowledge : "—"}</td>
                                                <td className="p-4 text-center font-black text-base opacity-70">{sheet ? sheet.workEthics : "—"}</td>
                                                <td className="p-4 text-center font-black text-base opacity-70">{sheet ? sheet.deliverablesOutcomes : "—"}</td>
                                                <td className="p-4 text-center font-black text-base opacity-70">{sheet ? sheet.abilityToLearn : "—"}</td>
                                                <td className="p-4 text-center border-l border-white/5 bg-primary/5">
                                                    <span className="text-lg font-black text-primary">{sheet ? sheet.totalMarks : "—"}</span>
                                                </td>
                                                <td className="p-4 text-right border-l border-white/5">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => setViewMemoItem({ intern, sheet: sheet || null })}
                                                            disabled={!sheet}
                                                            className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all shadow-sm border border-transparent hover:border-primary/20"
                                                            title="View Mark Memo"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant={sheet ? "outline" : "default"} 
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(intern)}
                                                            className="rounded-xl h-9 gap-2 px-4 shadow-sm font-bold"
                                                        >
                                                            {sheet ? <FileText className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                            {sheet ? "Edit" : "Evaluate"}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                                <div className="flex items-center gap-3">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest tabular-nums">
                                        Showing {(safePage - 1) * perPage + 1} to {Math.min(safePage * perPage, filteredInterns.length)} of {filteredInterns.length} Students
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="h-9 gap-2 rounded-xl text-xs font-bold hover:bg-white/5">
                                        <ChevronLeft className="h-4 w-4" /> Prev
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        <span className="h-8 min-w-[32px] flex items-center justify-center font-black text-[10px] border border-primary/20 px-3 rounded-lg bg-primary/10 text-primary">
                                            {safePage} / {totalPages}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="h-9 gap-2 rounded-xl text-xs font-bold hover:bg-white/5">
                                        Next <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Evaluation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none">
                    <div className="bg-background rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden glass max-h-[92vh] flex flex-col">
                        <DialogHeader className="p-8 border-b border-white/5 bg-white/5 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black">Evaluate Intern</DialogTitle>
                                    <DialogDescription className="font-medium text-muted-foreground text-sm">
                                        Set performance scores for <span className="text-foreground font-bold">{selectedIntern?.name}</span>
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        
                        <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Technical Knowledge (Max 10)</Label>
                                    <Input 
                                        type="number" step="0.5" min="0" max="10"
                                        className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-lg"
                                        value={formData.technicalKnowledge}
                                        onChange={(e) => setFormData({...formData, technicalKnowledge: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Work Ethics (Max 5)</Label>
                                    <Input 
                                        type="number" step="0.5" min="0" max="5"
                                        className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-lg"
                                        value={formData.workEthics}
                                        onChange={(e) => setFormData({...formData, workEthics: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Deliverables & Outcomes (Max 5)</Label>
                                    <Input 
                                        type="number" step="0.5" min="0" max="5"
                                        className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-lg"
                                        value={formData.deliverablesOutcomes}
                                        onChange={(e) => setFormData({...formData, deliverablesOutcomes: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Ability to Learn (Max 5)</Label>
                                    <Input 
                                        type="number" step="0.5" min="0" max="5"
                                        className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-lg"
                                        value={formData.abilityToLearn}
                                        onChange={(e) => setFormData({...formData, abilityToLearn: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 shadow-inner flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Total Computed Marks</p>
                                    <p className="text-sm font-bold text-muted-foreground tracking-tight">Out of a maximum 25.00</p>
                                </div>
                                <span className="text-4xl font-black text-primary drop-shadow-lg leading-none">
                                    {(
                                        (parseFloat(formData.technicalKnowledge) || 0) +
                                        (parseFloat(formData.workEthics) || 0) +
                                        (parseFloat(formData.deliverablesOutcomes) || 0) +
                                        (parseFloat(formData.abilityToLearn) || 0)
                                    ).toFixed(2)}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Remarks & Observations</Label>
                                <Textarea 
                                    placeholder="Enter detailed feedback for the intern..."
                                    className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl p-4 font-medium resize-none shadow-inner"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                                />
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-white/5 border-t border-white/10 shrink-0">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl px-8 h-12 font-black border-white/10 hover:bg-white/5 text-xs">Dismiss</Button>
                            <Button onClick={handleSave} disabled={saveMutation.isPending} className="rounded-2xl px-12 h-12 font-black shadow-2xl shadow-primary/40 text-xs">
                                {saveMutation.isPending ? "Validating..." : "Finalize Evaluation"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Evaluation Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
                    <div className="bg-background rounded-[2.5rem] border border-white/10 h-[92vh] flex flex-col glass overflow-hidden shadow-2xl">
                        <DialogHeader className="p-8 border-b border-white/5 bg-white/5 shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <DialogTitle className="text-2xl font-black">Bulk Evaluation Suite</DialogTitle>
                                    <DialogDescription className="font-medium text-muted-foreground text-sm">Apply standardized marks to multiple new interns simultaneously</DialogDescription>
                                </div>
                                <Badge className="bg-primary text-white border-none rounded-xl px-4 py-1.5 font-black uppercase tracking-widest shadow-xl">Batch Mode</Badge>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 flex overflow-hidden p-8 gap-8 min-h-0">
                            {/* Left Section: Selection */}
                            <div className="flex-1 flex flex-col bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-inner">
                                <div className="p-5 border-b border-white/10 space-y-4 bg-white/5">
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search un-evaluated interns..." 
                                                className="pl-9 h-11 bg-black/20 border-white/10 rounded-xl font-medium"
                                                value={bulkSearch}
                                                onChange={(e) => setBulkSearch(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-11 w-11 text-muted-foreground hover:text-primary rounded-xl shrink-0 bg-white/5 hover:bg-white/10 border border-white/10"
                                            onClick={() => { refetchInterns(); refetchSheets(); }}
                                        >
                                            <RefreshCw className={`h-4 w-4 ${(loadingInterns || loadingSheets) ? "animate-spin" : ""}`} />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <Checkbox 
                                                id="select-all" 
                                                className="rounded-lg h-5 w-5 border-white/20"
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
                                            <Label htmlFor="select-all" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer opacity-80">Select All Pending</Label>
                                        </div>
                                        <div className="bg-primary/20 border border-primary/20 px-4 py-1.5 rounded-xl">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                Selected: {selectedInternIds.size}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 p-6 custom-scrollbar">
                                    <div className="space-y-3 pr-2">
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
                                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                                                        selectedInternIds.has(intern.id) 
                                                            ? "bg-primary/20 border-primary/40 shadow-lg shadow-primary/5" 
                                                            : "bg-white/5 border-transparent hover:border-white/10 hover:bg-white/[0.08]"
                                                    }`}
                                                >
                                                    <Checkbox checked={selectedInternIds.has(intern.id)} className="h-4 w-4 rounded-md" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black tracking-tight">{intern.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                                                {intern.rollNumber || "ID: N/A"}
                                                            </p>
                                                            <span className="h-1 w-1 rounded-full bg-white/20" />
                                                            <p className="text-[9px] font-medium text-muted-foreground opacity-60 truncate">
                                                                {intern.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Right Section: Marks Form */}
                            <div className="w-[380px] flex flex-col gap-6 shrink-0">
                                <div className="space-y-6 p-8 bg-white/5 rounded-[2rem] border border-white/10 shadow-inner flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Score Batch</h4>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Tech Skill (10)</Label>
                                            <Input 
                                                type="number" step="0.5" min="0" max="10" placeholder="0.0"
                                                className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-lg focus:bg-black/60 transition-all shadow-inner"
                                                value={bulkFormData.technicalKnowledge}
                                                onChange={(e) => setBulkFormData({...bulkFormData, technicalKnowledge: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Ethics (5)</Label>
                                            <Input 
                                                type="number" step="0.5" min="0" max="5" placeholder="0.0"
                                                className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-lg focus:bg-black/60 transition-all shadow-inner"
                                                value={bulkFormData.workEthics}
                                                onChange={(e) => setBulkFormData({...bulkFormData, workEthics: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Deliv (5)</Label>
                                            <Input 
                                                type="number" step="0.5" min="0" max="5" placeholder="0.0"
                                                className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-lg focus:bg-black/60 transition-all shadow-inner"
                                                value={bulkFormData.deliverablesOutcomes}
                                                onChange={(e) => setBulkFormData({...bulkFormData, deliverablesOutcomes: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Learn (5)</Label>
                                            <Input 
                                                type="number" step="0.5" min="0" max="5" placeholder="0.0"
                                                className="h-12 bg-black/40 border-white/10 rounded-xl font-bold text-lg focus:bg-black/60 transition-all shadow-inner"
                                                value={bulkFormData.abilityToLearn}
                                                onChange={(e) => setBulkFormData({...bulkFormData, abilityToLearn: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-primary/20 border border-primary/20 flex justify-between items-center shadow-lg shadow-primary/5 mt-auto">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Total Mark</span>
                                        <span className="text-2xl font-black text-primary leading-none">
                                            {(
                                                (parseFloat(bulkFormData.technicalKnowledge) || 0) +
                                                (parseFloat(bulkFormData.workEthics) || 0) +
                                                (parseFloat(bulkFormData.deliverablesOutcomes) || 0) +
                                                (parseFloat(bulkFormData.abilityToLearn) || 0)
                                            ).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Batch Feedback</Label>
                                        <Textarea 
                                            placeholder="Standardized remarks for batch..."
                                            className="min-h-[140px] bg-black/40 border-white/10 rounded-2xl resize-none p-4 font-medium shadow-inner text-xs"
                                            value={bulkFormData.remarks}
                                            onChange={(e) => setBulkFormData({...bulkFormData, remarks: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-white/5 border-t border-white/10 shrink-0">
                            <Button variant="ghost" onClick={() => setIsBulkDialogOpen(false)} className="rounded-2xl px-10 h-12 font-black border-white/10 hover:bg-white/5 text-xs">Dismiss</Button>
                            <Button 
                                disabled={selectedInternIds.size === 0 || bulkSaveMutation.isPending}
                                onClick={() => bulkSaveMutation.mutate({ 
                                    userIds: Array.from(selectedInternIds),
                                    ...bulkFormData
                                })}
                                className="rounded-2xl h-12 px-12 font-black shadow-2xl shadow-primary/40 text-xs"
                            >
                                {bulkSaveMutation.isPending ? "Applying Suite..." : `Process ${selectedInternIds.size} Interns`}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Formal Mark Memo Modal (Common for HOD & Admin) */}
            <Dialog open={!!viewMemoItem} onOpenChange={(open) => !open && setViewMemoItem(null)}>
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
                                <Button variant="ghost" onClick={() => setViewMemoItem(null)} className="h-10 w-10 p-0 rounded-xl">
                                    <AlertCircle className="rotate-45 h-6 w-6" />
                                </Button>
                            </div>
                        </div>

                        {/* Printable Document Area */}
                        <div className="flex-1 overflow-y-auto p-12 bg-white flex justify-center custom-scrollbar">
                            <div id="printable-memo" className="w-full max-w-[800px] bg-white text-black p-4">
                                {/* Institutional Headers */}
                                <div className="flex justify-center mb-8">
                                    <img src="/learners byte expertpedia.jpg" alt="Institutional Header" className="max-w-full h-auto" />
                                </div>

                                <div className="text-center space-y-4 mb-8">
                                    <h2 className="text-xl font-bold underline leading-tight">
                                        VIII SEMESTER: INDUSTRY INTERNSHIP, REVIEW 1 - EVALUATION SHEET (EXTERNAL GUIDE)
                                    </h2>
                                    <p className="font-bold text-lg">MAXIMUM MARKS: 25</p>
                                </div>

                                {/* Main Evaluation Table */}
                                <div className="border border-black overflow-hidden mb-8">
                                    <table className="w-full text-center border-collapse">
                                        <thead>
                                            <tr className="border-b border-black">
                                                <th className="border-r border-black p-4 text-xs font-bold leading-tight align-middle w-24">USN</th>
                                                <th className="border-r border-black p-4 text-xs font-bold leading-tight align-middle">Student Name</th>
                                                <th className="border-r border-black p-4 text-xs font-bold leading-tight align-middle w-24">Technical Knowledge<br/>(10 Marks)</th>
                                                <th className="border-r border-black p-4 text-xs font-bold leading-tight align-middle w-24">Work Ethics<br/>(5 Marks)</th>
                                                <th className="border-r border-black p-4 text-xs font-bold leading-tight align-middle w-24">Deliverables and Outcomes<br/>(5 Marks)</th>
                                                <th className="border-r border-black p-4 text-xs font-bold leading-tight align-middle w-32">Ability to learn independently, adapt to new and emerging technologies, and exhibit critical thinking<br/>(5 Marks)</th>
                                                <th className="p-4 text-xs font-bold leading-tight align-middle w-24">TOTAL MARKS<br/>(25 Marks)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-black h-20">
                                                <td className="border-r border-black p-4 text-sm font-bold align-middle">{viewMemoItem?.intern.rollNumber || "--"}</td>
                                                <td className="border-r border-black p-4 text-sm font-bold align-middle">{viewMemoItem?.intern.name}</td>
                                                <td className="border-r border-black p-4 text-sm font-bold align-middle">{viewMemoItem?.sheet?.technicalKnowledge || "0.00"}</td>
                                                <td className="border-r border-black p-4 text-sm font-bold align-middle">{viewMemoItem?.sheet?.workEthics || "0.00"}</td>
                                                <td className="border-r border-black p-4 text-sm font-bold align-middle">{viewMemoItem?.sheet?.deliverablesOutcomes || "0.00"}</td>
                                                <td className="border-r border-black p-4 text-sm font-bold align-middle">{viewMemoItem?.sheet?.abilityToLearn || "0.00"}</td>
                                                <td className="p-4 text-sm font-black align-middle text-indigo-700">{viewMemoItem?.sheet?.totalMarks || "0.00"}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Remarks Section */}
                                <div className="border border-black mb-8 overflow-hidden">
                                    <div className="bg-gray-50 border-b border-black p-3 text-center">
                                        <h4 className="font-bold text-sm">Remarks by the External Guide</h4>
                                    </div>
                                    <div className="p-6 text-center italic font-bold text-sm min-h-[100px] flex items-center justify-center">
                                        {viewMemoItem?.sheet?.remarks || "Good performance, keep up the consistent work across all domains."}
                                    </div>
                                </div>

                                {/* Footnote */}
                                <p className="text-[10px] font-bold leading-relaxed mb-12 text-center">
                                    *** The Internal Guide is responsible for maintaining the email correspondence containing feedback from the External Guide, as well as recording the marks awarded by the External Guide based on the provided evaluation rubrics.
                                </p>

                                {/* Signature Section */}
                                <div className="grid grid-cols-3 gap-4 items-end mt-16 pb-8">
                                    <div className="flex flex-col items-center relative">
                                        <div className="h-28 flex items-center justify-center mb-2 relative">
                                            <img src="/seal.png" alt="Signature Seal" className="max-h-full w-auto opacity-70" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
                                                <p className="text-[#1e3a8a] font-black text-2xl rotate-[-5deg] tracking-tight" style={{ fontFamily: "'Dancing Script', cursive" }}>
                                                    A. Harish Nath
                                                </p>
                                                <p className="text-[#1e3a8a] font-black text-[10px] mt-0.5">15-04-2026</p>
                                            </div>
                                        </div>
                                        <p className="border-t border-black pt-2 w-full text-center font-bold text-[10px]">Signature of the External Guide with date</p>
                                    </div>
                                    <div className="flex flex-col items-center pb-[2px]">
                                        <div className="h-28 mb-2" />
                                        <p className="border-t border-black pt-2 w-full text-center font-bold text-[10px]">Signature of the Internal Guide with date</p>
                                    </div>
                                    <div className="flex flex-col items-center pb-[2px]">
                                        <div className="h-28 mb-2" />
                                        <p className="border-t border-black pt-2 w-full text-center font-bold text-[10px]">Signature of the HoD with date</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
