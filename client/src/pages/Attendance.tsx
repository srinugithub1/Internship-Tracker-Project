import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, Clock, CalendarDays, Zap, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Attendance() {
    const { toast } = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "sadmin";

    const { data: attendance = [], isLoading } = useQuery<any[]>({
        queryKey: [`/api/attendance/${user.id}`],
    });

    const activeSession = attendance.find((a: any) => !a.logoutTime);

    const clockInMutation = useMutation({
        mutationFn: () => apiRequest("POST", "/api/attendance/login", {
            userId: user.id,
            clientTime: Date.now().toString()
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/attendance/${user.id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
            toast({ title: "Clocked In ✅", description: "Successfully started session." });
        },
    });

    const clockOutMutation = useMutation({
        mutationFn: (attendanceId: string) => apiRequest("POST", "/api/attendance/logout", {
            attendanceId,
            clientTime: Date.now().toString()
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/attendance/${user.id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
            toast({ title: "Clocked Out 👋", description: "Shift ended successfully." });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message || "Failed to end shift.", variant: "destructive" });
        }
    });

    const parseTime = (timeStr: string) => {
        if (!timeStr) return new Date();
        const num = Number(timeStr);
        return isNaN(num) ? new Date(timeStr) : new Date(num);
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Standardized Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Timesheet</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Attendance</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Manage your daily shifts and working hours.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ── LEFT: Clock In/Out ── */}
                    {!isAdmin && (
                        <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden relative group transition-all hover:border-primary/20 p-8 flex flex-col items-center justify-center gap-8 text-center min-h-[400px]">
                            {activeSession && (
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary animate-pulse" />
                            )}
                            
                            <div className={`h-28 w-28 rounded-3xl flex items-center justify-center transition-all duration-500 overflow-hidden relative ${activeSession ? 'bg-primary/20 text-primary shadow-lg shadow-primary/20 scale-105' : 'bg-white/5 text-muted-foreground border border-white/10'}`}>
                                <Clock className={`h-12 w-12 ${activeSession ? 'animate-spin-slow' : 'opacity-40'}`} />
                                {activeSession && <div className="absolute inset-0 bg-primary/5 animate-ping" />}
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
                                    {activeSession ? "Shift in Progress" : "Available to Clock-In"}
                                </h2>
                                {activeSession ? (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Session Started At</p>
                                        <p className="text-3xl font-black text-primary tabular-nums">
                                            {format(parseTime(activeSession.loginTime), "hh:mm aa")}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-muted-foreground max-w-[280px]">
                                        Please clock in to begin tracking your productivity for today.
                                    </p>
                                )}
                            </div>

                            <Button
                                size="lg"
                                className={`w-full max-w-[280px] h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 border-none ${activeSession
                                        ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                                        : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                                    }`}
                                onClick={() => activeSession ? clockOutMutation.mutate(activeSession.id) : clockInMutation.mutate()}
                                disabled={clockInMutation.isPending || clockOutMutation.isPending}
                            >
                                {activeSession ? (
                                    <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Finish Shift</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Start Session</span>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* ── RIGHT: History ── */}
                    <div className={`glass rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-[500px] ${isAdmin ? 'col-span-full' : ''}`}>
                        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 rounded-xl p-2">
                                    <Timer className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Recent Logs</h2>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Verified time entries</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                            {isLoading ? (
                                <p className="text-center py-12 text-muted-foreground text-[10px] animate-pulse uppercase font-black tracking-widest">
                                    Loading history...
                                </p>
                            ) : attendance.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                                    <CalendarDays className="h-10 w-10 text-muted-foreground" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No entries found</p>
                                </div>
                            ) : (
                                attendance.map((session: any) => (
                                    <div key={session.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-2 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-black text-xs uppercase tracking-tight">
                                                    {format(session.loginTime && !isNaN(Number(session.loginTime))
                                                        ? new Date(Number(session.loginTime))
                                                        : new Date(session.loginTime || session.createdAt), "MMMM dd, yyyy")}
                                                </p>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60 tabular-nums">
                                                    {format(parseTime(session.loginTime), "hh:mm aa")} – {session.logoutTime ? format(parseTime(session.logoutTime), "hh:mm aa") : "Active"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-primary tabular-nums tracking-tighter leading-none">
                                                {session.workingHours || "0.00"}<span className="text-[10px] ml-0.5">h</span>
                                            </p>
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-40">Duration</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </AppLayout>
    );
}
