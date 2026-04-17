import AppLayout from "@/components/AppLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import {
    Clock, CheckSquare, Zap, Flame, Video,
    Megaphone, CalendarDays, ArrowUpRight, User, X, Eye,
    ChevronLeft, ChevronRight, BookOpen, Link as LinkIcon,
    Library, FileText, ExternalLink, UserCog, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InstructionModal } from "@/components/InstructionModal";

// ─── Live clock ────────────────────────────────────────────────────────────────
function useLiveClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return now;
}

// ─── Parse attendance time strings ─────────────────────────────────────────────
function parseAttTime(val: string | null | undefined): Date | null {
    if (!val) return null;
    if (/^\d{10,}$/.test(val.trim())) return new Date(parseInt(val, 10));
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
}
function fmtTime12(val: string | null | undefined): string {
    const d = parseAttTime(val);
    return d ? format(d, "hh:mm aa") : "Pending";
}

// ─── Group attendance by date ──────────────────────────────────────────────────
function groupByDate(records: any[]) {
    const map = new Map<string, any[]>();
    for (const r of records) {
        const key = r.date || "unknown";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(r);
    }
    const result: { date: string; sessions: any[]; totalHours: number; hasOpen: boolean; status: string }[] = [];
    map.forEach((sessions, date) => {
        let totalMs = 0;
        let hasOpen = false;
        for (const s of sessions) {
            const login = parseAttTime(s.loginTime);
            const logout = parseAttTime(s.logoutTime);
            if (login && logout) totalMs += Math.max(0, logout.getTime() - login.getTime());
            if (!s.logoutTime) hasOpen = true;
        }
        const totalHours = totalMs / 3_600_000;
        let status = "present";
        if (hasOpen) status = "active";
        else if (totalHours > 0 && totalHours < 4) status = "half-day";
        else if (totalHours === 0) status = "absent";
        result.push({ date, sessions, totalHours, hasOpen, status });
    });
    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
}

// ─── Pagination hook ───────────────────────────────────────────────────────────
function usePagination<T>(items: T[], perPage = 10) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    const safeP = Math.min(page, totalPages);
    const slice = items.slice((safeP - 1) * perPage, safeP * perPage);
    return {
        slice, page: safeP, totalPages,
        prev: () => setPage(p => Math.max(1, p - 1)),
        next: () => setPage(p => Math.min(totalPages, p + 1)),
        reset: () => setPage(1),
    };
}

// ─── Pagination Controls ───────────────────────────────────────────────────────
function Pagination({ page, totalPages, prev, next }: {
    page: number; totalPages: number;
    prev: () => void; next: () => void;
}) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/5">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest tabular-nums leading-none">
                Page {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prev} disabled={page === 1}
                    className="h-7 px-3 rounded-lg text-[10px] uppercase font-black gap-1 disabled:opacity-30 border-white/10">
                    <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={next} disabled={page === totalPages}
                    className="h-7 px-3 rounded-lg text-[10px] uppercase font-black gap-1 disabled:opacity-30 border-white/10">
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}

// ─── Announcement Ticker ───────────────────────────────────────────────────────
function AnnouncementTicker({ announcements }: { announcements: any[] }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [paused, setPaused] = useState(false);
    const list = [...announcements]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    if (list.length === 0) {
        return (
            <div className="w-full rounded-xl bg-primary/10 border border-primary/20 px-5 py-2 flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary shrink-0 opacity-80">Latest</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 italic">System monitoring clear...</span>
            </div>
        );
    }

    const items = [...list, ...list]; // double for seamless loop

    return (
        <div
            className="w-full rounded-xl bg-primary/10 border border-primary/20 flex items-center overflow-hidden h-9"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="shrink-0 px-4 h-full bg-primary flex items-center gap-2">
                <Megaphone className="h-3 w-3 text-white" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">Notice</span>
            </div>
            <div className="flex-1 overflow-hidden">
                <div
                    ref={trackRef}
                    className="flex gap-12 whitespace-nowrap px-6 items-center h-full"
                    style={{
                        animation: paused ? "none" : "ticker 35s linear infinite",
                        display: "flex",
                    }}
                >
                    {items.map((ann, i) => (
                        <span key={i} className="text-[10px] text-foreground font-black tracking-tight shrink-0 uppercase">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md mr-3 border leading-none inline-block ${ann.type === "urgent" ? "bg-red-500/20 text-red-500 border-red-500/20" : "bg-primary/20 text-primary border-primary/20"}`}>
                                {ann.type || "memo"}
                            </span>
                            {ann.message}
                        </span>
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes ticker {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}


// ─── View History Modal ────────────────────────────────────────────────────────
function HistoryModal({ day, onClose }: { day: { date: string; sessions: any[] } | null; onClose: () => void }) {
    if (!day) return null;
    const sorted = [...day.sessions].sort((a, b) => {
        const ta = parseAttTime(a.loginTime)?.getTime() ?? 0;
        const tb = parseAttTime(b.loginTime)?.getTime() ?? 0;
        return ta - tb;
    });
    const total = sorted.reduce((acc, s) => {
        const login = parseAttTime(s.loginTime);
        const logout = parseAttTime(s.logoutTime);
        if (login && logout) acc += (logout.getTime() - login.getTime()) / 3_600_000;
        return acc;
    }, 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadein .2s ease" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="relative w-full max-w-lg bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass"
                style={{ animation: "zoomin .2s ease" }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                    <div>
                        <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-0.5">Logs Detail</p>
                        <h2 className="text-foreground font-black text-base uppercase tracking-wider">
                            {format(new Date(day.date + "T00:00:00"), "MMM dd, yyyy")}
                        </h2>
                    </div>
                    <button onClick={onClose}
                        className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10">
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 shadow-inner">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    {["IN", "OUT", "WORKED"].map(h => (
                                        <th key={h} className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-muted-foreground text-center first:text-left last:text-right">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sorted.map((s, i) => {
                                    const login = parseAttTime(s.loginTime);
                                    const logout = parseAttTime(s.logoutTime);
                                    const dur = login && logout ? ((logout.getTime() - login.getTime()) / 3_600_000).toFixed(2) : null;
                                    return (
                                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-[10px] font-black text-foreground tabular-nums">{fmtTime12(s.loginTime)}</td>
                                            <td className="px-4 py-3 text-center">
                                                {s.logoutTime
                                                    ? <span className="text-[10px] font-black text-foreground tabular-nums">{fmtTime12(s.logoutTime)}</span>
                                                    : <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/20 inline-flex items-center gap-1">
                                                        <span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />Active
                                                    </span>}
                                            </td>
                                            <td className="px-4 py-3 text-[10px] font-black text-primary tabular-nums text-right">{dur ? `${dur}h` : "—"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-5 flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-80">Total Duration</span>
                        <span className="text-xl font-black text-primary tabular-nums">{total.toFixed(2)} <span className="text-xs uppercase ml-0.5">hrs</span></span>
                    </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                    <Button onClick={onClose} variant="outline" className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest h-10 border-white/10 bg-white/5 hover:bg-white/10 shadow-sm">Dismiss</Button>
                </div>
            </div>
            <style>{`
                @keyframes fadein { from { opacity:0 } to { opacity:1 } }
                @keyframes zoomin { from { transform:scale(.95);opacity:0 } to { transform:scale(1);opacity:1 } }
            `}</style>
        </div>
    );
}

// ─── Status badges ─────────────────────────────────────────────────────────────
function statusColor(s: string) {
    if (s === "completed") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    if (s === "in_progress") return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    return "bg-orange-500/15 text-orange-400 border-orange-500/20";
}
function statusLabel(s: string) {
    if (s === "in_progress") return "In Progress";
    if (s === "completed") return "Completed";
    return "Assigned";
}
function priorityColor(p: string) {
    if (p === "high") return "bg-red-500/15 text-red-400 border-red-500/20";
    if (p === "medium") return "bg-orange-500/15 text-orange-400 border-orange-500/20";
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
}
function leaveStatusColor(s: string) {
    if (s === "approved") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    if (s === "rejected") return "bg-red-500/15 text-red-400 border-red-500/20";
    return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
    const now = useLiveClock();
    const { toast } = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "sadmin";
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const [historyDay, setHistoryDay] = useState<{ date: string; sessions: any[] } | null>(null);
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [currentUser, setCurrentUser] = useState(storedUser);
    const [showInstructions, setShowInstructions] = useState(() => {
        // Only show to interns who haven't opted out
        return !isAdmin && user.showInstructionsPopup !== false;
    });

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: attendance = [] } = useQuery<any[]>({ queryKey: [`/api/attendance/${user.id}`], enabled: !isAdmin, refetchInterval: 30_000 });
    const { data: tasks = [] } = useQuery<any[]>({ queryKey: [`/api/tasks/${user.id}`], enabled: !isAdmin });
    const { data: announcements = [] } = useQuery<any[]>({ queryKey: ["/api/announcements"] });
    const { data: sessions = [] } = useQuery<any[]>({ queryKey: ["/api/session-links"] });
    const { data: leaves = [] } = useQuery<any[]>({ queryKey: ["/api/leaves"], enabled: !isAdmin });
    const { data: syllabus = [] } = useQuery<any[]>({ queryKey: ["/api/syllabus"] });
    const { data: resources = [] } = useQuery<any[]>({ queryKey: ["/api/resources"] });
    const { data: adminMetrics } = useQuery<any>({ queryKey: ["/api/admin/metrics"], enabled: isAdmin });

    // Filter leaves for current intern
    const myLeaves = (leaves as any[]).filter((l: any) => l.userId === user.id || l.internId === user.id);

    // ── Today open session ────────────────────────────────────────────────────
    const todayOpenSession = attendance.find(a => a.date === todayStr && !a.logoutTime) || null;
    const isClockedIn = !!todayOpenSession;

    // ── Clock IN / Out mutations ──────────────────────────────────────────────
    const clockInMutation = useMutation({
        mutationFn: () => apiRequest("POST", "/api/attendance/login", { userId: user.id, clientTime: Date.now().toString() }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/attendance/${user.id}`] }); toast({ title: "✅ Clocked IN!", description: `Recorded at ${format(new Date(), "hh:mm:ss aa")}` }); },
        onError: (e: any) => toast({ title: "Error", description: e?.message, variant: "destructive" }),
    });
    const clockOutMutation = useMutation({
        mutationFn: () => apiRequest("POST", "/api/attendance/logout", { attendanceId: todayOpenSession?.id, clientTime: Date.now().toString() }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/attendance/${user.id}`] }); toast({ title: "👋 Clocked Out!", description: `Recorded at ${format(new Date(), "hh:mm:ss aa")}` }); },
        onError: (e: any) => toast({ title: "Error", description: e?.message, variant: "destructive" }),
    });

    // ── Grouped attendance ────────────────────────────────────────────────────
    const groupedDays = groupByDate(attendance);
    const attPag = usePagination(groupedDays, 10);
    const taskPag = usePagination(tasks, 10);
    const sessPag = usePagination(sessions, 10);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const weeklyHours = attendance.filter(a => {
        const diff = new Date().getTime() - new Date(a.date + "T00:00:00").getTime();
        return diff < 7 * 24 * 3600 * 1000;
    }).reduce((s, a) => s + (parseFloat(a.workingHours) || 0), 0);
    const tasksDone = tasks.filter((t: any) => t.status === "completed").length;
    const milestones = tasks.length;
    const attended = new Set(attendance.map(a => a.date));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        if (attended.has(format(d, "yyyy-MM-dd"))) streak++; else break;
    }
    const internStats = [
        { label: "Weekly Hours", value: weeklyHours.toFixed(1), unit: "hrs", icon: Clock, color: "text-primary", bar: "bg-primary", barW: Math.min(100, (weeklyHours / 40) * 100), sub: `${Math.min(100, Math.round((weeklyHours / 40) * 100))}% of 40h` },
        { label: "Tasks Done", value: tasksDone.toString(), unit: "", icon: CheckSquare, color: "text-green-400", bar: "bg-green-400", barW: milestones > 0 ? (tasksDone / milestones) * 100 : 0, sub: `${milestones} total` },
        { label: "Milestones", value: milestones.toString(), unit: "", icon: Zap, color: "text-cyan-400", bar: "bg-cyan-400", barW: 0, sub: "All tasks" },
        { label: "Day Streak", value: streak.toString(), unit: "", icon: Flame, color: "text-yellow-400", bar: "bg-yellow-400", barW: Math.min(100, streak * 10), sub: "Keep going!" },
    ];
    const adminStats = [
        { label: "Total Interns", value: adminMetrics?.totalInterns?.toString() || "0", unit: "", icon: User, color: "text-primary", bar: "bg-primary", barW: 80, sub: "Active" },
        { label: "Tasks Done", value: adminMetrics?.taskStats?.completed?.toString() || "0", unit: "", icon: CheckSquare, color: "text-green-400", bar: "bg-green-400", barW: 60, sub: "Completed" },
        { label: "Pending", value: (parseInt(adminMetrics?.taskStats?.assigned || 0) + parseInt(adminMetrics?.taskStats?.["in_progress"] || 0)).toString(), unit: "", icon: Zap, color: "text-orange-400", bar: "bg-orange-400", barW: 40, sub: "In Progress" },
        { label: "Entries Today", value: adminMetrics?.totalInterns?.toString() || "0", unit: "", icon: Flame, color: "text-yellow-400", bar: "bg-yellow-400", barW: 70, sub: "All Interns" },
    ];
    const stats = isAdmin ? adminStats : internStats;

    // ─── Section header helper ────────────────────────────────────────────────
    const SectionHeader = ({ icon: Icon, title, count, href }: { icon: any; title: string; count?: number; href?: string }) => (
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
            <Icon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex-1">{title}</h2>
            {count !== undefined && <span className="text-[10px] text-muted-foreground font-bold bg-muted/30 px-2 py-0.5 rounded-full">{count} records</span>}
            {href && <a href={href} className="text-[10px] font-black text-primary hover:underline flex items-center gap-0.5">View All <ArrowUpRight className="h-3 w-3" /></a>}
        </div>
    );

    return (
        <AppLayout>
            {/* Modals */}
            <HistoryModal day={historyDay} onClose={() => setHistoryDay(null)} />
            <InstructionModal
                open={showInstructions}
                onOpenChange={setShowInstructions}
                userId={user.id}
            />

            {/* 1. Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-xl shadow-primary/20 relative overflow-hidden gap-6 animate-in fade-in slide-in-from-top duration-700">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none -mr-32 -mt-32" />
                <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none -ml-24 -mb-24" />
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-2xl ring-4 ring-white/10 group hover:scale-105 transition-transform">
                        {user.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Status: Active Hub</p>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">{currentUser.name || "User"}</h1>
                        </div>
                        <p className="text-white/60 text-[10px] font-bold mt-1 lowercase opacity-80">{currentUser.email}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                    <div className="text-left md:text-right">
                        <div className="flex items-center gap-3 md:justify-end mb-1">
                            <Clock className="h-5 w-5 text-white/40" />
                            <span className="text-white font-black text-xl tracking-wider tabular-nums uppercase">{format(now, "hh:mm:ss aa")}</span>
                        </div>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none opacity-80">{format(now, "EEEE, MMMM dd, yyyy")}</p>
                    </div>
                    {!isAdmin && (
                        <div className="flex flex-col items-start md:items-center gap-2">
                            {!isClockedIn ? (
                                <Button 
                                    className="bg-white text-indigo-700 font-black rounded-xl hover:bg-white/95 shadow-2xl px-8 h-12 text-[11px] uppercase tracking-widest min-w-[140px] border-none" 
                                    onClick={() => clockInMutation.mutate()} 
                                    disabled={clockInMutation.isPending}
                                >
                                    {clockInMutation.isPending ? "Syncing..." : "Clock IN"}
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button 
                                        className="bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 shadow-2xl px-8 h-12 text-[11px] uppercase tracking-widest min-w-[140px] border-none" 
                                        onClick={() => clockOutMutation.mutate()} 
                                        disabled={clockOutMutation.isPending}
                                    >
                                        {clockOutMutation.isPending ? "Finalizing..." : "Clock OUT"}
                                    </Button>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[9px] font-black text-white/80 uppercase tracking-widest tabular-nums">Logged: {fmtTime12(todayOpenSession?.loginTime)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Announcement Ticker */}
            <AnnouncementTicker announcements={announcements} />

            {/* 3. Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-150">
                {stats.map((s, i) => (
                    <div key={i} className="glass rounded-2xl border-white/10 shadow-sm p-5 group hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 rounded-xl ${s.bar.replace('bg-', 'bg-')}/10 border ${s.bar.replace('bg-', 'border-')}/20 group-hover:scale-110 transition-transform`}>
                                <s.icon className={`h-4 w-4 ${s.color}`} />
                            </div>
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-40 tabular-nums">Metric #{i+1}</span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-2xl font-black text-foreground tabular-nums tracking-tight">{s.value}</span>
                            {s.unit && <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">{s.unit}</span>}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground opacity-70 mb-4">{s.label}</p>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full ${s.bar} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${s.barW}%` }} />
                            </div>
                            <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform">
                                <span className="text-[9px] text-muted-foreground font-bold uppercase opacity-60">{s.sub}</span>
                                <ArrowUpRight className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-40 transition-opacity" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                {/* 4. Attendance History */}
                {!isAdmin && (
                    <div className="glass rounded-2xl border-white/10 shadow-sm overflow-hidden flex flex-col h-[500px]">
                        <SectionHeader icon={CalendarDays} title="Attendance Logs" count={groupedDays.length} />
                        <div className="flex-1 overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
                                        {["Date", "Hours", "Logs", "Status", "View"].map(h => (
                                            <th key={h} className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground first:pl-6 last:pr-6 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {attPag.slice.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center text-[10px] text-muted-foreground font-black uppercase opacity-40 italic tracking-widest">No audit data found.</td></tr>
                                    ) : attPag.slice.map(day => (
                                        <tr key={day.date} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-5 py-3.5 first:pl-6">
                                                <p className="text-[10px] font-black text-foreground uppercase tracking-tight tabular-nums">
                                                    {format(new Date(day.date + "T00:00:00"), "MMM dd, yyyy")}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-[11px] font-black tabular-nums">
                                                    {day.totalHours > 0 ? <span className="text-primary">{day.totalHours.toFixed(2)}h</span>
                                                        : day.hasOpen ? <span className="text-blue-400 text-[8px] font-black uppercase tracking-widest animate-pulse">Running</span>
                                                            : <span className="opacity-30">0.00h</span>}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-[8px] font-black text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                                    {day.sessions.length} Log{day.sessions.length !== 1 ? "s" : ""}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {day.status === "active" && <span className="text-[7px] font-black uppercase px-2 py-1 rounded-lg border flex items-center gap-1.5 w-fit bg-blue-500/10 text-blue-400 border-blue-500/20"><span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" /> Live</span>}
                                                {day.status === "half-day" && <span className="text-[7px] font-black uppercase px-2 py-1 rounded-lg border flex items-center gap-1.5 w-fit bg-orange-500/10 text-orange-400 border-orange-500/20"><span className="h-1 w-1 rounded-full bg-orange-400" /> Partial</span>}
                                                {day.status === "present" && <span className="text-[7px] font-black uppercase px-2 py-1 rounded-lg border flex items-center gap-1.5 w-fit bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><span className="h-1 w-1 rounded-full bg-emerald-400" /> Full</span>}
                                                {day.status === "absent" && <span className="text-[7px] font-black uppercase px-2 py-1 rounded-lg border flex items-center gap-1.5 w-fit bg-red-500/10 text-red-100 border-red-500/20"><span className="h-1 w-1 rounded-full bg-red-400" /> Nil</span>}
                                            </td>
                                            <td className="px-5 py-3.5 last:pr-6">
                                                <Button size="icon" variant="ghost"
                                                    className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground"
                                                    onClick={() => setHistoryDay({ date: day.date, sessions: day.sessions })}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination page={attPag.page} totalPages={attPag.totalPages} prev={attPag.prev} next={attPag.next} />
                    </div>
                )}

                {/* 5. Recent Tasks with pagination */}
                {!isAdmin && (
                    <div className="glass rounded-2xl border-white/10 shadow-sm overflow-hidden flex flex-col h-[500px]">
                        <SectionHeader icon={CheckSquare} title="Recent Directives" count={tasks.length} href="/tasks" />
                        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                            {taskPag.slice.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <CheckSquare className="h-12 w-12 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue Cleaned</p>
                                </div>
                            ) : taskPag.slice.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                                    <div className="min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-1 w-4 rounded-full bg-primary group-hover:w-6 transition-all" />
                                            <span className="text-[11px] font-black text-foreground uppercase tracking-tight truncate">{t.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md border tracking-widest ${priorityColor(t.priority)}`}>
                                                {t.priority}
                                            </span>
                                            {t.dueDate && (
                                                <span className="text-[9px] text-muted-foreground uppercase font-black opacity-60 tabular-nums">Limit: {format(new Date(t.dueDate), "MMM dd")}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-xl border leading-none shadow-sm shrink-0 ${statusColor(t.status)}`}>
                                        {statusLabel(t.status)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Pagination page={taskPag.page} totalPages={taskPag.totalPages} prev={taskPag.prev} next={taskPag.next} />
                    </div>
                )}

                {/* 6. Online Class Sessions with pagination */}
                <div className={`glass rounded-2xl border-white/10 shadow-sm overflow-hidden flex flex-col h-[500px] ${isAdmin ? 'lg:col-span-2' : ''}`}>
                    <SectionHeader icon={Video} title="Digital Classrooms" count={sessions.length} />
                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                        {sessPag.slice.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-40">
                                <Video className="h-12 w-12 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Streams Found</p>
                            </div>
                        ) : sessPag.slice.map((s: any) => (
                            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors gap-5 group">
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                                        <Video className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-xs text-foreground uppercase tracking-tight truncate mb-1">{s.title}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                            {s.startTime && s.endTime && (
                                                <span className="text-[9px] text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-widest opacity-60 tabular-nums">
                                                    <Clock className="h-3 w-3" />{s.startTime} – {s.endTime}
                                                </span>
                                            )}
                                            {s.speaker && (
                                                <span className="text-[9px] text-primary flex items-center gap-1.5 font-bold uppercase tracking-widest overflow-hidden">
                                                    <UserCog className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{s.speaker}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {s.sessionUrl ? (
                                    <a href={s.sessionUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                        <Button size="sm" className="h-9 w-full sm:w-auto rounded-xl text-[10px] font-black bg-primary hover:bg-primary/90 gap-2 px-6 shadow-lg shadow-primary/20 uppercase tracking-widest border-none">
                                            <ExternalLink className="h-3.5 w-3.5" /> Entry Link
                                        </Button>
                                    </a>
                                ) : (
                                    <Button size="sm" variant="ghost" className="h-9 w-full sm:w-auto rounded-xl text-[10px] font-black gap-2 uppercase tracking-widest opacity-40 border border-white/10" disabled>
                                        Locked
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <Pagination page={sessPag.page} totalPages={sessPag.totalPages} prev={sessPag.prev} next={sessPag.next} />
                </div>
            </div>
        </AppLayout>
    );
}
