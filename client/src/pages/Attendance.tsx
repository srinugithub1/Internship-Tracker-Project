import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Attendance() {
    const { toast } = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const { data: attendance, isLoading } = useQuery<any[]>({
        queryKey: [`/api/attendance/${user.id}`],
    });

    const activeSession = (attendance || []).find((a: any) => !a.logoutTime);
    if (activeSession) {
        console.log(`[FRONTEND] Active Session: ${activeSession.id}, loginTime: ${activeSession.loginTime}`);
    }

    const clockInMutation = useMutation({
        mutationFn: async () => {
            const time = Date.now().toString();
            console.log(`[FRONTEND] Clocking In at ${time}`);
            return await apiRequest("POST", "/api/attendance/login", {
                userId: user.id,
                clientTime: time
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/attendance/${user.id}`] });
            // Invalidate admin attendance as well to keep everything synced
            queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
            toast({ title: "Clocked In", description: "Your attendance has been recorded." });
        },
    });

    const clockOutMutation = useMutation({
        mutationFn: async (attendanceId: string) => {
            const time = Date.now().toString();
            console.log(`[FRONTEND] Clocking Out session ${attendanceId} at ${time}`);
            return await apiRequest("POST", "/api/attendance/logout", {
                attendanceId,
                clientTime: time
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/attendance/${user.id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
            toast({ title: "Clocked Out", description: "Session ended successfully." });
        },
        onError: (error: any) => {
            console.error("[FRONTEND] Clock Out Error:", error);
            toast({
                title: "Action Failed",
                description: error.message || "Could not finish shift. Please try again.",
                variant: "destructive"
            });
        }
    });

    // Helper to parse numerical or ISO timestamps
    const parseTime = (timeStr: string) => {
        if (!timeStr) return new Date();
        const num = Number(timeStr);
        return isNaN(num) ? new Date(timeStr) : new Date(num);
    };

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                        <p className="text-muted-foreground mt-1">Clock in/out to track your working hours.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="flex flex-col items-center justify-center p-8 space-y-8 glass border-white/20 shadow-xl overflow-hidden relative">
                            {activeSession && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse" />
                            )}
                            <div className={`h-32 w-32 rounded-3xl flex items-center justify-center rotate-3 ${activeSession ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/20 text-primary'} shadow-inner border border-white/10`}>
                                <Clock className={`h-16 w-16 ${activeSession ? 'text-emerald-500' : 'text-primary'}`} />
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black tracking-tight">{activeSession ? "Shift Active" : "Sign In"}</h2>
                                {activeSession ? (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Started At</p>
                                        <p className="text-xl font-black text-emerald-500">
                                            {format(parseTime(activeSession.loginTime), "hh:mm:ss a")}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Ready to start your day? Clock in to track your progress.
                                    </p>
                                )}
                            </div>
                            <Button
                                size="lg"
                                className={`w-full max-w-xs font-black h-14 rounded-2xl text-lg shadow-lg transition-all active:scale-95 ${activeSession ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                                    }`}
                                onClick={() => activeSession ? clockOutMutation.mutate(activeSession.id) : clockInMutation.mutate()}
                                disabled={clockInMutation.isPending || clockOutMutation.isPending}
                            >
                                {activeSession ? "Finish Shift" : "Start Session"}
                            </Button>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isLoading ? (
                                        <p>Loading history...</p>
                                    ) : (attendance as any[])?.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">No attendance records found.</p>
                                    ) : (
                                        (attendance as any[]).map((session: any) => (
                                            <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm">{format(session.loginTime && !isNaN(Number(session.loginTime)) ? new Date(Number(session.loginTime)) : new Date(session.loginTime || session.createdAt), "MMMM dd, yyyy")}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                                            {format(parseTime(session.loginTime), "hh:mm a")} - {session.logoutTime ? format(parseTime(session.logoutTime), "hh:mm a") : "Currently Active"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-primary">{session.workingHours || "0.0"}h</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Duration</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
