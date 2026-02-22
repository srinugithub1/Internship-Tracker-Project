import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, BookOpen, Layers, CheckCircle2 } from "lucide-react";

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
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto space-y-10">
                    <header>
                        <h1 className="text-4xl font-black tracking-tight tracking-tighter">Learning Path</h1>
                        <p className="text-muted-foreground mt-2 text-lg font-medium">Explore your curriculum and track your progress through the modules.</p>
                    </header>

                    {isLoading ? (
                        <div className="text-center py-20 animate-pulse text-muted-foreground uppercase font-black tracking-widest text-xs">Architecting curriculum...</div>
                    ) : Object.keys(groupedSyllabus).length === 0 ? (
                        <div className="text-center py-20 bg-white/5 border-2 border-dashed rounded-3xl">
                            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-bold">Curriculum not published yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(groupedSyllabus).map(([course, modules]: [any, any]) => (
                                <div key={course} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                            <GraduationCap className="h-6 w-6 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight">{course}</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Object.entries(modules).map(([module, topics]: [any, any], idx) => (
                                            <Card key={module} className="glass border-white/20 shadow-xl hover:scale-[1.02] transition-all duration-300">
                                                <CardHeader className="border-b border-white/10 pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-lg font-black">{module}</CardTitle>
                                                        <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md">Module {idx + 1}</span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-6">
                                                    <div className="space-y-3">
                                                        {topics.map((topic: string, i: number) => (
                                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                                                                <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                                <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{topic}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
