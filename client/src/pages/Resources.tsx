import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText } from "lucide-react";

export default function Resources() {
    const { data: resources, isLoading } = useQuery({
        queryKey: ["/api/resources"],
    });

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
                        <p className="text-muted-foreground mt-1">Helpful links and documentation.</p>
                    </div>

                    <div className="max-w-2xl">
                        <Card className="glass border-white/20 shadow-xl">
                            <CardHeader className="border-b border-white/10 pb-6">
                                <CardTitle className="flex items-center gap-3 text-xl font-black">
                                    <div className="p-2 rounded-xl bg-primary/10">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    Documentation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {isLoading ? (
                                        <p className="text-sm text-muted-foreground animate-pulse">Loading resources...</p>
                                    ) : ((resources as any[]) || []).length === 0 ? (
                                        <p className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-2xl italic">No resources added yet.</p>
                                    ) : ((resources as any[]) || []).map((res: any) => (
                                        <div key={res.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-primary/5 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-secondary/50">
                                                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{res.title}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">{res.type || res.category}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="rounded-xl font-bold bg-white/5 border-white/10 hover:bg-primary hover:text-white transition-all h-9 px-4" asChild>
                                                <a href={res.link || res.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    Open
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
