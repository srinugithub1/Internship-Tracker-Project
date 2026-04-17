import { type User, type EvaluationSheet } from "@shared/schema";
import { format } from "date-fns";
import { Download } from "lucide-react";

interface EvaluationMemoProps {
    user: User;
    sheet: EvaluationSheet;
}

export default function EvaluationMemo({ user, sheet }: EvaluationMemoProps) {
    return (
        <div className="bg-white text-black p-8 sm:p-12 shadow-2xl max-w-5xl w-full border border-gray-200 print:shadow-none print:border-none print:p-0">
            {/* Styles for Memo */}
            <style>{`
                .memo-font { font-family: 'Times New Roman', Times, serif; }
                .memo-table td, .memo-table th { border: 1px solid black !important; padding: 12px 8px; text-align: center; }
                .memo-table th { font-weight: bold; }
                .sig-separator { border-left: 1px solid black; height: 100px; margin-bottom: 20px; }
            `}</style>
            
            <div className="memo-font w-full space-y-6">
                <h2 className="text-center font-bold text-lg md:text-xl px-4 uppercase leading-tight mb-2">
                    VIII Semester: INDUSTRY INTERNSHIP, REVIEW 1 - EVALUATION SHEET (External Guide)
                </h2>
                
                <h3 className="text-center font-bold text-base md:text-lg mb-8">
                    MAXIMUM MARKS: 25
                </h3>

                <table className="w-full memo-table border-collapse text-[13px] md:text-sm mt-10">
                    <thead>
                        <tr>
                            <th className="w-[12%] py-4">USN</th>
                            <th className="w-[18%] py-4">Student Name</th>
                            <th className="w-[14%] py-4">Technical Knowledge<br/>(10 Marks)</th>
                            <th className="w-[12%] py-4">Work Ethics<br/>(5 Marks)</th>
                            <th className="w-[12%] py-4">Deliverables and Outcomes<br/>(5 Marks)</th>
                            <th className="w-[20%] py-4 text-xs font-bold leading-tight">Ability to learn independently, adapt to new and emerging technologies, and exhibit critical thinking (5 Marks)</th>
                            <th className="w-[12%] py-4">TOTAL MARKS<br/>(25 Marks)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="h-20">
                            <td>{user?.rollNumber || "N/A"}</td>
                            <td>{user?.name || "N/A"}</td>
                            <td className="font-bold text-base">{sheet.technicalKnowledge}</td>
                            <td className="font-bold text-base">{sheet.workEthics}</td>
                            <td className="font-bold text-base">{sheet.deliverablesOutcomes}</td>
                            <td className="font-bold text-base">{sheet.abilityToLearn}</td>
                            <td className="font-black text-xl text-blue-900">{sheet.totalMarks}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Remarks by External Guide */}
                <div className="mt-8">
                    <table className="w-full memo-table border-collapse text-[13px] md:text-sm">
                        <thead>
                            <tr>
                                <th className="text-center py-3 bg-gray-50/50">Remarks by the External Guide</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-left py-10 px-8 align-top italic font-medium min-h-[120px] leading-relaxed">
                                    {sheet.remarks || "No remarks provided."}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p className="text-[12px] md:text-[13px] font-bold text-center mt-12 px-12 leading-relaxed">
                    *** The Internal Guide is responsible for maintaining the email correspondence containing feedback from the External Guide, as well as recording the marks awarded by the External Guide based on the provided evaluation rubrics.
                </p>

                {/* Signatures Area with Vertical Separators */}
                <div className="flex justify-between items-end mt-32 px-4 h-40 relative">
                    {/* Signature 1: External Guide */}
                    <div className="text-center w-1/3 flex flex-col items-center justify-end relative h-full">
                        <div className="absolute top-[-20px] flex flex-col items-center">
                            <div className="relative">
                                <img src="/seal.png" alt="Company Seal" className="w-[120px] h-[120px] object-contain opacity-80" />
                            </div>
                        </div>
                        <div className="absolute top-[-5px] z-10 w-full text-center">
                            <div className="font-['Brush_Script_MT',cursive,serif] italic font-black text-[#1e3a8a] text-4xl opacity-95 rotate-[-3deg] drop-shadow-sm tracking-tight">
                                A. Harish Nath
                            </div>
                        </div>
                        <div className="absolute top-[35px] w-full text-center z-10">
                            <p className="text-[12px] font-black text-[#1e3a8a] font-sans">
                                {sheet.evaluationDate ? format(new Date(sheet.evaluationDate), "dd-MM-yyyy") : format(new Date(), "dd-MM-yyyy")}
                            </p>
                        </div>
                        <div className="font-bold text-[12px] mt-auto border-t border-black w-full pt-2">Signature of the External Guide with date</div>
                    </div>

                    {/* Separator 1 */}
                    <div className="h-32 border-l border-black mx-2 self-start mt-8" />

                    {/* Signature 2: Internal Guide */}
                    <div className="text-center w-1/3 flex flex-col items-center justify-end h-full">
                        <div className="font-bold text-[12px] border-t border-black w-full pt-2">Signature of the Internal Guide with date</div>
                    </div>

                    {/* Separator 2 */}
                    <div className="h-32 border-l border-black mx-2 self-start mt-8" />

                    {/* Signature 3: HoD */}
                    <div className="text-center w-1/3 flex flex-col items-center justify-end h-full">
                        <div className="font-bold text-[12px] border-t border-black w-full pt-2">Signature of the HoD with date</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
