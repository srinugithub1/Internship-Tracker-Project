import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Download, FileWarning, ScrollText, Printer, FileCheck } from "lucide-react";
import { type User, type EvaluationSheet } from "@shared/schema";
import { useState, useEffect } from "react";
import EvaluationMemo from "@/components/EvaluationMemo";

export default function EvaluationSheetPage() {
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const { data: sheet, isLoading } = useQuery<EvaluationSheet>({
        queryKey: [`/api/evaluation-sheets/${user?.id}`],
        enabled: !!user?.id,
        retry: false,
    });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-20 animate-pulse opacity-40">
                    <ScrollText className="h-10 w-10 mb-4 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Validating transcripts...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout hideSidebarOnPrint={true}>
            <div className="space-y-6 flex flex-col items-center">
                {/* ── DIGITAL HEADER (Hidden on Print) ── */}
                <header className="w-full no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700 mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <ScrollText className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Certification</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Marks Memo</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Download your performance evaluation results.</p>
                    </div>
                    {sheet && (
                        <Button 
                            onClick={handlePrint} 
                            size="sm"
                            className="rounded-xl h-10 px-5 font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 active:scale-95"
                        >
                            <Printer className="h-3.5 w-3.5" /> Record PDF
                        </Button>
                    )}
                </header>

                {/* ── CONTENT AREA ── */}
                <div className="w-full flex flex-col items-center">
                    {!sheet ? (
                        <div className="max-w-2xl w-full py-16 px-8 glass rounded-3xl border border-dashed border-white/10 flex flex-col items-center text-center no-print">
                            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                                <FileWarning className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Evaluation Pending</h2>
                            <p className="text-muted-foreground mt-3 text-xs font-medium max-w-sm leading-relaxed">
                                Your performance matrix has not been processed by the external moderator. Please synchronize with your department lead.
                            </p>
                            
                            <div className="mt-8 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Awaiting Signature</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl animate-in zoom-in-95 duration-500 origin-top">
                            {/* The EvaluationMemo component should handle its own print styling */}
                            <EvaluationMemo user={user!} sheet={sheet} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
