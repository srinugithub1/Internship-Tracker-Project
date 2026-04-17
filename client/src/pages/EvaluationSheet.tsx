import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Download, FileWarning } from "lucide-react";
import { type User, type EvaluationSheet } from "@shared/schema";
import { useState, useEffect } from "react";
import EvaluationMemo from "@/components/EvaluationMemo";

export default function EvaluationSheetPage() {
    const [user, setUser] = useState<User | null>(null);
    
    // Retrieve user from localStorage
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
            <div className="flex bg-secondary/30 min-h-screen">
                <Sidebar />
                <main className="flex-1 ml-64 p-8 flex items-center justify-center">
                    <p className="animate-pulse font-medium text-muted-foreground">Loading Evaluation Sheet...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex bg-secondary/30 min-h-screen print:bg-white print:min-h-0">
            <div className="no-print">
                <Sidebar />
            </div>
            
            <main className="flex-1 ml-64 p-8 print:p-0 print:ml-0 print:m-0 flex flex-col items-center">
                
                <div className="w-full max-w-4xl flex justify-between items-center mb-6 no-print">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Marks Memo</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">Download your evaluation sheet</p>
                    </div>
                    {sheet && (
                        <Button onClick={handlePrint} className="rounded-xl h-10 font-bold gap-2 shadow-lg">
                            <Download className="h-4 w-4" /> Download PDF
                        </Button>
                    )}
                </div>

                {!sheet ? (
                    <div className="max-w-4xl w-full p-12 glass rounded-2xl border-white/10 shadow-xl flex flex-col items-center text-center no-print">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <FileWarning className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black">Not Evaluated Yet</h2>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            Your performance evaluation has not been completed by the external guide yet. Please check back later.
                        </p>
                    </div>
                ) : (
                    <EvaluationMemo user={user!} sheet={sheet} />
                )}
            </main>
        </div>
    );
}
