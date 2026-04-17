import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link2, Video, Calendar, Clock, ExternalLink, User, PlayCircle } from "lucide-react";
import { format } from "date-fns";

export default function InternSessions() {
    const { data: items = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/session-links"],
    });

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Standardized Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Video className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Virtual Class</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Available Sessions</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Join upcoming live lectures or access recordings.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse opacity-40">
                            <Video className="h-10 w-10 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Fetching uplink...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 glass rounded-2xl border border-dashed border-white/10 opacity-40">
                            <Video className="h-10 w-10 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Scheduled Broadcasts</p>
                        </div>
                    ) : (
                        items.map((session: any) => (
                            <div key={session.id} className="glass rounded-2xl border border-white/10 overflow-hidden group hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                                {/* Header Section */}
                                <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg">
                                                <PlayCircle className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-primary leading-tight lowercase first-letter:uppercase">
                                                    {session.agenda}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                        <Calendar className="h-3 w-3 text-primary/60" /> 
                                                        {session.sessionDate ? format(new Date(session.sessionDate), "MMM dd, yyyy") : "TBD"}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 tabular-nums">
                                                        <Clock className="h-3 w-3" /> 
                                                        {session.startTime || "TBD"} {session.endTime ? `— ${session.endTime}` : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="w-full sm:w-auto rounded-xl font-black h-10 px-5 shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px] gap-2 active:scale-95" 
                                            asChild
                                        >
                                            <a href={session.sessionUrl} target="_blank" rel="noopener noreferrer">
                                                Participate <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-primary/10 transition-colors">
                                        <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center text-primary/60">
                                            <User className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1 opacity-60">Lead Instructor</p>
                                            <p className="text-xs font-bold text-foreground truncate">{session.speaker || "Expert Mentor"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-primary/10 transition-colors">
                                        <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center text-primary/60">
                                            <Link2 className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1 opacity-60">Resource Link</p>
                                            <p className="text-[10px] font-medium text-primary truncate hover:underline cursor-pointer">{session.sessionUrl}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Bottom Accent */}
                                <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
