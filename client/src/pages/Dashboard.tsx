import Sidebar from "@/components/Sidebar";
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
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10">
            <Button variant="outline" size="sm" onClick={prev} disabled={page === 1}
                className="h-7 px-3 rounded-lg text-xs font-black gap-1 disabled:opacity-30">
                <ChevronLeft className="h-3 w-3" /> Prev
            </Button>
            <span className="text-[10px] font-black text-muted-foreground tabular-nums">
                Page {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={next} disabled={page === totalPages}
                className="h-7 px-3 rounded-lg text-xs font-black gap-1 disabled:opacity-30">
                Next <ChevronRight className="h-3 w-3" />
            </Button>
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
            <div className="w-full rounded-xl bg-blue-500/8 border border-blue-500/20 px-5 py-2.5 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 shrink-0">Latest</span>
                <span className="text-xs text-muted-foreground">No announcements available.</span>
            </div>
        );
    }

    const items = [...list, ...list]; // double for seamless loop

    return (
        <div
            className="w-full rounded-xl bg-blue-500/8 border border-blue-500/20 flex items-center overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="shrink-0 px-4 py-2.5 bg-blue-600 flex items-center gap-2 rounded-l-xl">
                <Megaphone className="h-3.5 w-3.5 text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">Latest</span>
            </div>
            <div className="flex-1 overflow-hidden">
                <div
                    ref={trackRef}
                    className="flex gap-10 whitespace-nowrap py-2.5 px-4"
                    style={{
                        animation: paused ? "none" : "ticker 30s linear infinite",
                        display: "flex",
                    }}
                >
                    {items.map((ann, i) => (
                        <span key={i} className="text-xs text-foreground font-medium shrink-0">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded mr-2 ${ann.type === "urgent" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-500"}`}>
                                {ann.type || "notice"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            style={{ animation: "fadein .2s ease" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="relative w-full max-w-lg mx-4 bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ animation: "zoomin .2s ease" }}>
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-700">
                    <div>
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Attendance Detail</p>
                        <h2 className="text-white font-black text-lg">
                            {format(new Date(day.date + "T00:00:00"), "EEEE, MMM dd yyyy")}
                        </h2>
                    </div>
                    <button onClick={onClose}
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <X className="h-4 w-4 text-white" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Sessions ({sorted.length})
                    </p>
                    <div className="rounded-xl border border-white/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-primary/5">
                                    {["#", "Clock IN", "Clock Out", "Duration"].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {sorted.map((s, i) => {
                                    const login = parseAttTime(s.loginTime);
                                    const logout = parseAttTime(s.logoutTime);
                                    const dur = login && logout ? ((logout.getTime() - login.getTime()) / 3_600_000).toFixed(2) : null;
                                    return (
                                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-sm font-bold text-muted-foreground">{i + 1}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-foreground tabular-nums">{fmtTime12(s.loginTime)}</td>
                                            <td className="px-4 py-3 text-sm tabular-nums">
                                                {s.logoutTime
                                                    ? <span className="font-bold text-foreground">{fmtTime12(s.logoutTime)}</span>
                                                    : <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-1 w-fit">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />Active
                                                    </span>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{dur ? `${dur} hrs` : "—"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Hours Worked</span>
                        <span className="text-lg font-black text-primary">{total.toFixed(2)} hrs</span>
                    </div>
                </div>
                <div className="px-6 pb-5 flex justify-end">
                    <Button onClick={onClose} variant="outline" className="rounded-xl font-black text-sm px-6">Close</Button>
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
    const isAdmin = user.role === "admin" || user.role === "sadmin";
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
        <div className="flex bg-[#f4f6fb] dark:bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-6">
                <div className="max-w-[1300px] mx-auto space-y-5">

                    {/* Modals */}
                    <HistoryModal day={historyDay} onClose={() => setHistoryDay(null)} />
                    <InstructionModal
                        open={showInstructions}
                        onOpenChange={setShowInstructions}
                        userId={user.id}
                    />

                    {/* 1. Welcome Banner */}
                    <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-6 flex items-center justify-between shadow-2xl shadow-purple-500/30 relative overflow-hidden">
                        <div className="absolute right-48 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
                        <div className="absolute right-32 bottom-2 h-24 w-24 rounded-full bg-white/5 pointer-events-none" />
                        <div className="absolute right-8 top-4 h-16 w-16 rounded-full bg-white/10 pointer-events-none" />
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                {user.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Welcome back</p>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-black text-white tracking-tight">{currentUser.name || "Intern"}</h1>
                                </div>
                                <p className="text-white/60 text-xs font-medium mt-0.5">Here's your daily overview</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="flex items-center gap-2 justify-end mb-1">
                                    <Clock className="h-4 w-4 text-white/60" />
                                    <span className="text-white font-black text-xl tracking-wide tabular-nums">{format(now, "hh:mm:ss aa")}</span>
                                </div>
                                <p className="text-white/60 text-xs font-bold">{format(now, "EEE, MMM dd yyyy")}</p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{isClockedIn ? "End your day" : "Start your day"}</p>
                                {!isClockedIn
                                    ? <Button className="bg-white text-purple-700 font-black rounded-xl hover:bg-white/90 shadow-lg px-6 py-2 text-sm min-w-[110px]" onClick={() => clockInMutation.mutate()} disabled={clockInMutation.isPending}>
                                        {clockInMutation.isPending ? "Clocking IN..." : "Clock IN"}
                                    </Button>
                                    : <Button className="bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 shadow-lg px-6 py-2 text-sm min-w-[110px]" onClick={() => clockOutMutation.mutate()} disabled={clockOutMutation.isPending}>
                                        {clockOutMutation.isPending ? "Saving..." : "Clock Out"}
                                    </Button>}
                                {isClockedIn && todayOpenSession && (
                                    <p className="text-white/50 text-[10px] mt-1">In since {fmtTime12(todayOpenSession.loginTime)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Announcement Ticker */}
                    <AnnouncementTicker announcements={announcements} />

                    {/* 3. Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <div key={i} className="bg-white dark:bg-white/5 rounded-2xl border border-white/10 shadow-sm p-5">
                                <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                                <div className="mb-1">
                                    <span className="text-3xl font-black text-foreground">{s.value}</span>
                                    {s.unit && <span className="text-xs font-bold text-muted-foreground ml-1">{s.unit}</span>}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{s.label}</p>
                                <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden mb-1">
                                    <div className={`h-full ${s.bar} rounded-full transition-all duration-700`} style={{ width: `${s.barW}%` }} />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold">{s.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* 4. Attendance History */}
                    {!isAdmin && (
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-white/10 shadow-sm overflow-hidden">
                            <SectionHeader icon={CalendarDays} title="Attendance History" count={groupedDays.length} />
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-primary/5">
                                            {["Date", "Total Hours", "Sessions", "Status", "Action"].map(h => (
                                                <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {attPag.slice.length === 0 ? (
                                            <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground italic">No attendance records yet.</td></tr>
                                        ) : attPag.slice.map(day => (
                                            <tr key={day.date} className="hover:bg-white/5 transition-colors">
                                                <td className="px-5 py-3.5 text-sm font-bold text-foreground">
                                                    {format(new Date(day.date + "T00:00:00"), "MMM dd, yyyy")}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-black tabular-nums">
                                                    {day.totalHours > 0 ? <span className="text-primary">{day.totalHours.toFixed(2)} hrs</span>
                                                        : day.hasOpen ? <span className="text-blue-400 text-[10px] font-black uppercase">In Progress</span>
                                                            : <span className="text-muted-foreground">0.00 hrs</span>}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-[10px] font-black text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                                                        {day.sessions.length} session{day.sessions.length !== 1 ? "s" : ""}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {day.status === "active" && <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit bg-blue-500/10 text-blue-400 border-blue-500/20"><span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse inline-block" /> Active</span>}
                                                    {day.status === "half-day" && <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit bg-orange-500/10 text-orange-400 border-orange-500/20"><span className="h-1.5 w-1.5 rounded-full bg-orange-400 inline-block" /> Half-day</span>}
                                                    {day.status === "present" && <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" /> Present</span>}
                                                    {day.status === "absent" && <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit bg-red-500/10 text-red-400 border-red-500/20"><span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block" /> Absent</span>}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <Button size="sm" variant="outline"
                                                        className="h-7 rounded-lg text-[10px] font-black uppercase gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                                                        onClick={() => setHistoryDay({ date: day.date, sessions: day.sessions })}>
                                                        <Eye className="h-3 w-3" /> View History
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
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-white/10 shadow-sm overflow-hidden">
                            <SectionHeader icon={CheckSquare} title="Recent Tasks" count={tasks.length} href="/tasks" />
                            <div className="divide-y divide-white/10">
                                {taskPag.slice.length === 0 ? (
                                    <p className="text-center py-10 text-sm text-muted-foreground">No tasks assigned yet.</p>
                                ) : taskPag.slice.map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                <span className="text-sm font-bold text-foreground">{t.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${priorityColor(t.priority)}`}>
                                                    {t.priority} priority
                                                </span>
                                                {t.dueDate && (
                                                    <span className="text-[9px] text-muted-foreground">Due: {format(new Date(t.dueDate), "MMM dd")}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${statusColor(t.status)}`}>
                                            {statusLabel(t.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Pagination page={taskPag.page} totalPages={taskPag.totalPages} prev={taskPag.prev} next={taskPag.next} />
                        </div>
                    )}

                    {/* 6. Online Class Sessions with pagination */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-white/10 shadow-sm overflow-hidden">
                        <SectionHeader icon={Video} title="Online Class Sessions" count={sessions.length} />
                        <div className="divide-y divide-white/10">
                            {sessPag.slice.length === 0 ? (
                                <p className="text-center py-10 text-sm text-muted-foreground">No sessions scheduled.</p>
                            ) : sessPag.slice.map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Video className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">{s.title}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                {s.startTime && s.endTime && (
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />{s.startTime} – {s.endTime}
                                                    </span>
                                                )}
                                                {s.speaker && (
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <User className="h-3 w-3" />{s.speaker}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {s.sessionUrl ? (
                                        <a href={s.sessionUrl} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" className="h-8 rounded-xl text-xs font-black bg-primary gap-1">
                                                <ExternalLink className="h-3 w-3" /> Join
                                            </Button>
                                        </a>
                                    ) : (
                                        <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs font-black gap-1" disabled>
                                            No Link
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Pagination page={sessPag.page} totalPages={sessPag.totalPages} prev={sessPag.prev} next={sessPag.next} />
                    </div>



                </div>
            </main>
        </div>
    );
}
