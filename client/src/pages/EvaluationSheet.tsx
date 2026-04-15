import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Download, FileWarning } from "lucide-react";
import { type User, type EvaluationSheet } from "@shared/schema";
import { format } from "date-fns";
import { useState, useEffect } from "react";

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
                    <div className="bg-white text-black p-8 sm:p-12 shadow-2xl max-w-5xl w-full border border-gray-200 print:shadow-none print:border-none print:p-0">
                        {/* Printable Area */}
                        <style>{`
                            @media print {
                                @page { size: portrait; margin: 15mm; }
                                body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                .no-print { display: none !important; }
                            }
                            .memo-font { font-family: 'Times New Roman', Times, serif; }
                            .memo-table td, .memo-table th { border: 1px solid black; padding: 12px 8px; text-align: center; }
                            .memo-table th { font-weight: bold; }
                        `}</style>
                        
                        <div className="memo-font w-full space-y-6">
                            
                            <h2 className="text-center font-bold text-lg md:text-xl px-4 uppercase leading-tight">
                                VIII Semester: INDUSTRY INTERNSHIP, REVIEW 1 - EVALUATION SHEET (External Guide)
                            </h2>
                            
                            <h3 className="text-center font-bold text-base md:text-lg">
                                MAXIMUM MARKS: 25
                            </h3>

                            <table className="w-full memo-table border-collapse text-[13px] md:text-sm mt-8">
                                <thead>
                                    <tr>
                                        <th className="w-[12%]">USN</th>
                                        <th className="w-[18%]">Student Name</th>
                                        <th className="w-[14%]">Technical<br/>Knowledge<br/>(10 Marks)</th>
                                        <th className="w-[12%]">Work<br/>Ethics<br/>(5 Marks)</th>
                                        <th className="w-[12%]">Deliverables<br/>and Outcomes<br/>(5 Marks)</th>
                                        <th className="w-[20%]">Ability to learn independently, adapt<br/>to new and emerging technologies,<br/>and exhibit critical thinking<br/>(5 Marks)</th>
                                        <th className="w-[12%]">TOTAL<br/>MARKS<br/>(25 Marks)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{user?.rollNumber || "N/A"}</td>
                                        <td>{user?.name || "N/A"}</td>
                                        <td>{sheet.technicalKnowledge}</td>
                                        <td>{sheet.workEthics}</td>
                                        <td>{sheet.deliverablesOutcomes}</td>
                                        <td>{sheet.abilityToLearn}</td>
                                        <td>{sheet.totalMarks}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <table className="w-full memo-table border-collapse text-[13px] md:text-sm mt-4">
                                <thead>
                                    <tr>
                                        <th className="text-center py-2 bg-gray-50/50">Remarks by the External Guide</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-left py-12 px-6 align-top min-h-[120px]">
                                            {sheet.remarks || "No remarks provided."}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <p className="text-[12px] md:text-[13px] font-bold text-center mt-2 px-12 leading-relaxed">
                                *** The Internal Guide is responsible for maintaining the email correspondence containing feedback from the External Guide, as well as recording the marks awarded by the External Guide based on the provided evaluation rubrics.
                            </p>

                            <div className="flex justify-between items-end mt-24 px-4 h-32 relative">
                                
                                {/* Signature 1 */}
                                <div className="text-center w-1/3 flex flex-col items-center justify-end relative">
                                    <div className="absolute bottom-[40px] flex flex-col items-center">
                                        {/* Try to load the seal image, otherwise display a fallback */}
                                        <div className="relative">
                                            <img src="/seal.png" alt="Company Seal" className="w-[120px] h-[120px] object-contain opacity-90 block" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                            <div className="hidden absolute inset-0 w-[120px] h-[120px] border-2 border-slate-700/80 rounded-full flex items-center justify-center -mb-8 -ml-8 pointer-events-none rotate-[-15deg]">
                                                <div className="text-[9px] text-center font-bold text-slate-700/80 tracking-widest break-words p-4 leading-tight uppercase">
                                                    Mahaprabha Tech Career Hub LLP
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-[55px] -ml-8">
                                        <div className="font-['Brush_Script_MT',cursive,serif] italic font-semibold text-blue-800 text-3xl opacity-90 rotate-[-5deg]">A. Harish Nath</div>
                                    </div>
                                    <div className="absolute bottom-[45px] -ml-12 text-xs font-bold font-sans">
                                        {sheet.evaluationDate ? format(new Date(sheet.evaluationDate), "dd-MM-yyyy") : format(new Date(), "dd-MM-yyyy")}
                                    </div>
                                    <div className="font-bold text-[13px] mt-auto">Signature of the External Guide with date</div>
                                </div>

                                {/* Signature 2 */}
                                <div className="text-center w-1/3 flex flex-col items-center justify-end">
                                    <div className="font-bold text-[13px]">Signature of the Internal Guide with date</div>
                                </div>

                                {/* Signature 3 */}
                                <div className="text-center w-1/3 flex flex-col items-center justify-end">
                                    <div className="font-bold text-[13px]">Signature of the HoD with date</div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
