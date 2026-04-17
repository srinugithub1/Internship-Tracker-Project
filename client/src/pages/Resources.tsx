import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText, ExternalLink, Hash, Clock } from "lucide-react";

export default function Resources() {
    const { data: resources = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/resources"],
    });

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Standardized Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <BookOpen className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Assets</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Resource Hub</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Access helpful documentation, links, and learning materials.</p>
                    </div>
                </header>

                <div className="max-w-3xl space-y-4 pb-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse opacity-40">
                            <FileText className="h-10 w-10 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Hydrating index...</p>
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="text-center py-20 glass rounded-2xl border border-dashed border-white/10 opacity-30">
                            <BookOpen className="h-10 w-10 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Resources Indexed</p>
                        </div>
                    ) : (
                        resources.map((res: any) => (
                            <div key={res.id} className="glass rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/20 transition-all group relative overflow-hidden">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-black text-foreground lowercase first-letter:uppercase tracking-tight truncate pr-4">
                                            {res.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-primary/30">
                                            <span className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                                                <Hash className="h-2.5 w-2.5" />
                                                {res.type || res.category}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-white/10" />
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                                                Public Access
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="w-full sm:w-auto h-9 px-5 rounded-xl bg-white/5 hover:bg-primary hover:text-white border border-white/10 hover:border-primary text-foreground font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-black/5 active:scale-95" 
                                    asChild
                                >
                                    <a href={res.link || res.fileUrl} target="_blank" rel="noopener noreferrer">
                                        Launch <ExternalLink className="h-3 w-3 ml-2" />
                                    </a>
                                </Button>
                                
                                {/* Aesthetic Gradient Accent */}
                                <div className="absolute right-0 top-0 h-10 w-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
