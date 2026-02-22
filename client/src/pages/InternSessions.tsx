import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link as LinkIcon, Video, Calendar, Clock, ExternalLink, User } from "lucide-react";
import { format } from "date-fns";

export default function InternSessions() {
    const { data: items = [], isLoading } = useQuery({
        queryKey: ["/api/session-links"],
    });

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header>
                        <h1 className="text-3xl font-black tracking-tight">Class Sessions</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">Join live sessions and access class recordings.</p>
                    </header>

                    <div className="grid gap-6">
                        {isLoading ? (
                            <div className="text-center py-20 animate-pulse text-[10px] font-black uppercase tracking-widest text-muted-foreground">Connecting to session cloud...</div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 border-2 border-dashed rounded-3xl">
                                <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold">No sessions scheduled at the moment.</p>
                            </div>
                        ) : (
                            items.map((session: any) => (
                                <Card key={session.id} className="glass border-white/10 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                                    <div className="bg-primary/5 p-6 border-b border-white/10">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 transition-transform group-hover:rotate-0">
                                                    <Video className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{session.agenda}</h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                            <Calendar className="h-3 w-3" /> {session.sessionDate ? format(new Date(session.sessionDate), "MMMM dd, yyyy") : "TBD"}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                                                            <Clock className="h-3 w-3" /> {session.startTime || "TBD"} - {session.endTime || ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="lg" className="rounded-xl font-black h-12 px-8 shadow-xl shadow-primary/20 group-hover:scale-105 transition-all" asChild>
                                                <a href={session.sessionUrl} target="_blank" rel="noopener noreferrer">
                                                    Join Session <ExternalLink className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Speaker / Mentor</p>
                                                    <p className="text-base font-bold">{session.speaker || "Expert Instructor"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                                    <LinkIcon className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Direct Access</p>
                                                    <p className="text-sm font-medium truncate">{session.sessionUrl}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
