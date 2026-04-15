import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, RotateCcw, FileText, Download } from "lucide-react";
import { useState } from "react";
import { type User, type EvaluationSheet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedIntern, setSelectedIntern] = useState<User | null>(null);
    const [formData, setFormData] = useState<MarksForm>(blankMarks);

    const { data: interns = [], isLoading: loadingInterns } = useQuery<User[]>({
        queryKey: ["/api/interns"],
    });

    const { data: allSheets = [], isLoading: loadingSheets } = useQuery<EvaluationSheet[]>({
        queryKey: ["/api/evaluation-sheets"],
    });

    const saveMutation = useMutation({
        mutationFn: (data: { userId: string } & MarksForm) => {
            const totalMarks = (
                (parseFloat(data.technicalKnowledge) || 0) +
                (parseFloat(data.workEthics) || 0) +
                (parseFloat(data.deliverablesOutcomes) || 0) +
                (parseFloat(data.abilityToLearn) || 0)
            ).toFixed(2);

            return apiRequest("POST", "/api/evaluation-sheets", {
                userId: data.userId,
                technicalKnowledge: data.technicalKnowledge,
                workEthics: data.workEthics,
                deliverablesOutcomes: data.deliverablesOutcomes,
                abilityToLearn: data.abilityToLearn,
                remarks: data.remarks,
                totalMarks
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/evaluation-sheets"] });
            setIsDialogOpen(false);
            setSelectedIntern(null);
            setFormData(blankMarks);
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
        </div>
    );
}
