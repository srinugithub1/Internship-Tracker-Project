import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, BookOpen, Layers, CheckCircle2, ChevronRight } from "lucide-react";

export default function InternSyllabus() {
    const { data: items = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/syllabus"],
    });

    const groupedSyllabus = items.reduce((acc: any, item: any) => {
        if (!acc[item.course]) acc[item.course] = {};
        if (!acc[item.course][item.module]) acc[item.course][item.module] = [];
        acc[item.course][item.module].push(item.topic);
        return acc;
    }, {});

    return (
        <AppLayout>
            <div className="space-y-8 pb-12">
                {/* Standardized Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Layers className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Curriculum</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Learning Path</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Explore your coursework and track your masteries.</p>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse opacity-40">
                        <BookOpen className="h-10 w-10 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Mapping curriculum...</p>
                    </div>
                ) : Object.keys(groupedSyllabus).length === 0 ? (
                    <div className="text-center py-20 glass rounded-2xl border border-dashed border-white/10 opacity-40">
                        <BookOpen className="h-10 w-10 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">E-curriculum pending</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(groupedSyllabus).map(([course, modules]: [any, any]) => (
                            <div key={course} className="space-y-6">
                                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-lg font-black tracking-tight text-foreground uppercase tracking-widest">{course}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Object.entries(modules).map(([module, topics]: [any, any], idx) => (
                                        <div key={module} className="glass rounded-2xl border border-white/10 overflow-hidden flex flex-col group hover:border-primary/30 transition-all duration-500">
                                            {/* Module Header */}
                                            <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
                                                <h3 className="text-sm font-black text-foreground uppercase tracking-wider line-clamp-1">{module}</h3>
                                                <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 tabular-nums">
                                                    M-{idx + 1}
                                                </span>
                                            </div>
                                            
                                            {/* Topics List */}
                                            <div className="p-5 space-y-2 flex-1">
                                                {topics.map((topic: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/10 transition-all group/topic">
                                                        <div className="mt-1 h-3.5 w-3.5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover/topic:bg-primary/20 group-hover/topic:border-primary transition-colors">
                                                            <div className="h-1 w-1 rounded-full bg-primary" />
                                                        </div>
                                                        <p className="text-[11px] font-bold text-muted-foreground group-hover/topic:text-foreground transition-colors leading-tight">
                                                            {topic}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
