import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { type User, type EvaluationSheet } from "@shared/schema";
import { Search, RotateCcw, FileText, TrendingUp, Award, Target, BookOpen } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type EvaluationWithUser = {
    intern: User;
    sheet: EvaluationSheet | null;
};

export default function HODEvaluations() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [user] = useState(storedUser);
    const [search, setSearch] = useState("");

    const { data: evaluations = [], isLoading } = useQuery<EvaluationWithUser[]>({
        queryKey: ["/api/hod/evaluations", user.email],
        queryFn: async () => {
            const res = await fetch(`/api/hod/evaluations?hodEmail=${user.email}`);
            if (!res.ok) throw new Error("Failed to fetch evaluations");
            return res.json();
        },
        enabled: !!user.email
    });

    const filtered = evaluations.filter(e => 
        e.intern.name.toLowerCase().includes(search.toLowerCase()) || 
        (e.intern.rollNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        e.intern.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1200px] mx-auto space-y-8">
                    <header className="flex justify-between items-end animate-in fade-in slide-in-from-left duration-700">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                Student Marks
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-medium">
                                Performance evaluation scores for interns in your department.
                            </p>
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-indigo-500/5">
                            <TrendingUp className="h-5 w-5 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Performance View</span>
                        </div>
                    </header>

                    <div className="flex gap-4 items-center p-5 glass rounded-2xl border-white/10 shadow-xl">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, email or roll number..." 
                                className="pl-9 h-11 bg-white/5 border-white/10 rounded-xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl" onClick={() => setSearch("")}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="glass rounded-3xl border-white/10 shadow-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Intern Details</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Technical (10)</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Ethics (5)</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Deliverables (5)</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Learning (5)</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Total (25)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-muted-foreground font-bold">Fetching marks...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground font-bold italic">
                                            No evaluation records found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((evalItem, i) => (
                                        <tr key={evalItem.intern.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
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
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-black text-lg">{evalItem.sheet?.technicalKnowledge || "--"}</span>
                                                    <Award className="h-3 w-3 text-indigo-500/50" />
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-black text-lg">{evalItem.sheet?.workEthics || "--"}</span>
                                                    <Target className="h-3 w-3 text-emerald-500/50" />
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-black text-lg">{evalItem.sheet?.deliverablesOutcomes || "--"}</span>
                                                    <BookOpen className="h-3 w-3 text-amber-500/50" />
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-black text-lg">{evalItem.sheet?.abilityToLearn || "--"}</span>
                                                    <TrendingUp className="h-3 w-3 text-rose-500/50" />
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="relative inline-flex items-center justify-center">
                                                    <div className="h-14 w-14 rounded-full border-4 border-indigo-500/10 flex items-center justify-center group-hover:border-indigo-500/30 transition-all">
                                                        <span className="font-black text-xl text-indigo-500">
                                                            {evalItem.sheet?.totalMarks || "--"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Remarks/Feedback Section Note */}
                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex items-start gap-4">
                        <div className="p-3 bg-primary/20 rounded-2xl">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg">Evaluation Policy</h4>
                            <p className="text-muted-foreground text-sm font-medium mt-1 leading-relaxed">
                                These marks are assigned by the institutional external guide during mid-term and final evaluations. 
                                Total marks are calculated out of 25. If you see "--", the evaluation for that student is still pending.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
