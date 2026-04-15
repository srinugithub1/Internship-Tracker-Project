import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, RotateCcw, FileText, Download, Users, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { type User, type EvaluationSheet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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

    // Bulk Evaluation State
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [bulkFormData, setBulkFormData] = useState<MarksForm>(blankMarks);
    const [bulkSearch, setBulkSearch] = useState("");
    const [selectedInternIds, setSelectedInternIds] = useState<Set<string>>(new Set());


    const { data: interns = [], isLoading: loadingInterns } = useQuery<User[]>({
        queryKey: ["/api/interns"],
    });

    const { data: allSheets = [], isLoading: loadingSheets } = useQuery<EvaluationSheet[]>({
        queryKey: ["/api/evaluation-sheets"],
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

    const filteredInterns = interns.filter(intern => 
        intern.name.toLowerCase().includes(search.toLowerCase()) || 
        (intern.rollNumber || "").toLowerCase().includes(search.toLowerCase()) || 
        intern.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1200px] mx-auto space-y-6">
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Evaluations & Marks</h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">Evaluate intern performance and generate marks memos</p>
                        </div>
                        <Button 
                            onClick={() => setIsBulkDialogOpen(true)}
                            className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 gap-2 font-bold"
                        >
                            <Users className="h-5 w-5" />
                            Bulk Evaluation
                        </Button>
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

                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Intern details</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Roll Number</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-center">Tech (10)</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-center">Ethics (5)</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-center">Deliverables (5)</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-center">Learn (5)</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-center">Total (25)</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loadingInterns || loadingSheets ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-muted-foreground">Loading data...</td>
                                    </tr>
                                ) : filteredInterns.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-muted-foreground">No interns found.</td>
                                    </tr>
                                ) : (
                                    filteredInterns.map(intern => {
                                        const sheet = allSheets.find(s => s.userId === intern.id);
                                        return (
                                            <tr key={intern.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{intern.name}</span>
                                                        <span className="text-xs text-muted-foreground">{intern.email}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-medium">{intern.rollNumber || "—"}</td>
                                                <td className="p-4 text-center font-medium">{sheet ? sheet.technicalKnowledge : "—"}</td>
                                                <td className="p-4 text-center font-medium">{sheet ? sheet.workEthics : "—"}</td>
                                                <td className="p-4 text-center font-medium">{sheet ? sheet.deliverablesOutcomes : "—"}</td>
                                                <td className="p-4 text-center font-medium">{sheet ? sheet.abilityToLearn : "—"}</td>
                                                <td className="p-4 text-center font-bold text-primary">{sheet ? sheet.totalMarks : "—"}</td>
                                                <td className="p-4 text-right">
                                                    <Button 
                                                        variant={sheet ? "outline" : "default"} 
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(intern)}
                                                        className="rounded-lg h-8 gap-2"
                                                    >
                                                        {sheet ? <FileText className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                                        {sheet ? "Edit Marks" : "Evaluate"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl rounded-2xl glass">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Evaluate Intern</DialogTitle>
                        <DialogDescription>
                            Enter marks for {selectedIntern?.name} ({selectedIntern?.rollNumber || "No Roll Number"}). Maximum total is 25.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Technical Knowledge (Max 10)</Label>
                            <Input 
                                type="number" step="0.5" min="0" max="10"
                                value={formData.technicalKnowledge}
                                onChange={(e) => setFormData({...formData, technicalKnowledge: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Work Ethics (Max 5)</Label>
                            <Input 
                                type="number" step="0.5" min="0" max="5"
                                value={formData.workEthics}
                                onChange={(e) => setFormData({...formData, workEthics: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Deliverables & Outcomes (Max 5)</Label>
                            <Input 
                                type="number" step="0.5" min="0" max="5"
                                value={formData.deliverablesOutcomes}
                                onChange={(e) => setFormData({...formData, deliverablesOutcomes: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Ability to Learn (Max 5)</Label>
                            <Input 
                                type="number" step="0.5" min="0" max="5"
                                value={formData.abilityToLearn}
                                onChange={(e) => setFormData({...formData, abilityToLearn: e.target.value})}
                            />
                        </div>
                        
                        <div className="col-span-2 space-y-2 pt-2">
                            <div className="flex justify-between items-center bg-primary/10 p-3 rounded-lg border border-primary/20">
                                <span className="font-semibold text-primary">Total Marks Calculated:</span>
                                <span className="text-xl font-black text-primary">
                                    {(
                                        (parseFloat(formData.technicalKnowledge) || 0) +
                                        (parseFloat(formData.workEthics) || 0) +
                                        (parseFloat(formData.deliverablesOutcomes) || 0) +
                                        (parseFloat(formData.abilityToLearn) || 0)
                                    ).toFixed(2)} / 25
                                </span>
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Remarks by External Guide</Label>
                            <Textarea 
                                placeholder="Enter feedback regarding the student's internship performance..."
                                value={formData.remarks}
                                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSave} disabled={saveMutation.isPending} className="rounded-xl font-bold">
                            {saveMutation.isPending ? "Saving..." : "Save Evaluation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Evaluation Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 rounded-2xl glass overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-black">Bulk Evaluation Tool</DialogTitle>
                        <DialogDescription>
                            Apply the same marks and remarks to multiple interns who haven't been evaluated yet.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 flex overflow-hidden p-6 gap-6">
                        {/* Left Section: Selection */}
                        <div className="flex-1 flex flex-col bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <div className="p-4 border-b border-white/10 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search new interns..." 
                                        className="pl-9 h-10 bg-black/20 border-white/10 rounded-xl"
                                        value={bulkSearch}
                                        onChange={(e) => setBulkSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            id="select-all" 
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
                                        <Label htmlFor="select-all" className="text-sm font-bold cursor-pointer">Select All New Interns</Label>
                                    </div>
                                    <span className="text-xs font-black text-primary px-3 py-1 bg-primary/20 rounded-full border border-primary/20">
                                        Selected: {selectedInternIds.size}
                                    </span>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-2">
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
                                                className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${
                                                    selectedInternIds.has(intern.id) 
                                                        ? "bg-primary/10 border-primary/30" 
                                                        : "bg-white/5 border-transparent hover:border-white/10"
                                                }`}
                                            >
                                                <Checkbox checked={selectedInternIds.has(intern.id)} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold truncate">{intern.name}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                                                        {intern.rollNumber || "No Roll Number"} • {intern.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Right Section: Marks Form */}
                        <div className="w-[400px] flex flex-col gap-6">
                            <div className="space-y-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tech (Max 10)</Label>
                                        <Input 
                                            type="number" step="0.5" min="0" max="10" placeholder="0.0"
                                            className="bg-black/20 border-white/10 h-10"
                                            value={bulkFormData.technicalKnowledge}
                                            onChange={(e) => setBulkFormData({...bulkFormData, technicalKnowledge: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Ethics (Max 5)</Label>
                                        <Input 
                                            type="number" step="0.5" min="0" max="5" placeholder="0.0"
                                            className="bg-black/20 border-white/10 h-10"
                                            value={bulkFormData.workEthics}
                                            onChange={(e) => setBulkFormData({...bulkFormData, workEthics: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Deliverables (Max 5)</Label>
                                        <Input 
                                            type="number" step="0.5" min="0" max="5" placeholder="0.0"
                                            className="bg-black/20 border-white/10 h-10"
                                            value={bulkFormData.deliverablesOutcomes}
                                            onChange={(e) => setBulkFormData({...bulkFormData, deliverablesOutcomes: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Learning (Max 5)</Label>
                                        <Input 
                                            type="number" step="0.5" min="0" max="5" placeholder="0.0"
                                            className="bg-black/20 border-white/10 h-10"
                                            value={bulkFormData.abilityToLearn}
                                            onChange={(e) => setBulkFormData({...bulkFormData, abilityToLearn: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-2 border-t border-primary/20 mt-2">
                                    <span className="text-xs font-bold text-primary">Calculation:</span>
                                    <span className="text-lg font-black text-primary">
                                        {(
                                            (parseFloat(bulkFormData.technicalKnowledge) || 0) +
                                            (parseFloat(bulkFormData.workEthics) || 0) +
                                            (parseFloat(bulkFormData.deliverablesOutcomes) || 0) +
                                            (parseFloat(bulkFormData.abilityToLearn) || 0)
                                        ).toFixed(2)} / 25
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Remarks For All Selected</Label>
                                <Textarea 
                                    placeholder="Enter common feedback for this batch..."
                                    className="flex-1 bg-white/5 border-white/10 resize-none min-h-[120px]"
                                    value={bulkFormData.remarks}
                                    onChange={(e) => setBulkFormData({...bulkFormData, remarks: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-black/20 border-t border-white/10">
                        <Button variant="ghost" onClick={() => setIsBulkDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button 
                            disabled={selectedInternIds.size === 0 || bulkSaveMutation.isPending}
                            onClick={() => bulkSaveMutation.mutate({ 
                                userIds: Array.from(selectedInternIds),
                                ...bulkFormData
                            })}
                            className="rounded-xl px-10 font-bold shadow-lg shadow-primary/20"
                        >
                            {bulkSaveMutation.isPending ? "Processing..." : `Update ${selectedInternIds.size} Interns`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

