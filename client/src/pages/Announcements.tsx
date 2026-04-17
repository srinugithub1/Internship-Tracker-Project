import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, ExternalLink, Info, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Announcements() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "sadmin";

    const { data: announcements = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/announcements"],
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'error': return <AlertCircle className="h-4 w-4" />;
            case 'success': return <CheckCircle2 className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Standardized Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Megaphone className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hub</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Notice Board</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Get the latest news and updates from management.</p>
                    </div>
                    {isAdmin && (
                        <Link href="/admin/announcements">
                            <Button size="sm" className="rounded-xl h-9 font-black text-[10px] uppercase tracking-widest gap-2">
                                <ExternalLink className="h-3.5 w-3.5" /> Manage Portal
                            </Button>
                        </Link>
                    )}
                </header>

                <div className="max-w-4xl mx-auto space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse opacity-40">
                            <Megaphone className="h-10 w-10 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Hydrating feed...</p>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-20 glass rounded-2xl border border-dashed border-white/10 opacity-40">
                            <Megaphone className="h-10 w-10 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Active Notices</p>
                        </div>
                    ) : (
                        announcements.map((ann: any) => (
                            <div key={ann.id} className="glass rounded-2xl border border-white/10 p-5 hover:border-primary/20 transition-all group relative overflow-hidden">
                                {/* Type Label */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`p-2 rounded-lg border ${getColor(ann.type)}`}>
                                            {getIcon(ann.type)}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${ann.type === 'error' ? 'text-red-400' : 'text-muted-foreground opacity-70'}`}>
                                            {ann.type || "info"} Update
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black text-muted-foreground opacity-40 uppercase tabular-nums">
                                        {format(new Date(ann.createdAt), "MMM dd, yyyy")}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <p className="text-sm font-medium leading-relaxed text-foreground/90">{ann.message}</p>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Verified Bulletin</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-muted-foreground/40 tabular-nums uppercase">
                                            {format(new Date(ann.createdAt), "hh:mm aa")}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Aesthetic Glow */}
                                <div className="absolute -right-4 -top-4 h-16 w-16 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
