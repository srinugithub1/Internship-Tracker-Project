import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { type Attendance, type User } from "@shared/schema";
import { Search, Calendar, Clock, RotateCcw, Eye, Building2, TrendingUp, History, Filter, ChevronLeft, ChevronRight, Users, ClipboardCheck } from "lucide-react";
import { useState, useMemo } from "react";
import { format, getDaysInMonth, differenceInCalendarDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = ["2024", "2025", "2026"];

export default function AdminAttendance() {
    const [search, setSearch] = useState("");
    
    // Main Table Filter State
    const [mainMonth, setMainMonth] = useState(new Date().getMonth().toString());
    const [mainYear, setMainYear] = useState(new Date().getFullYear().toString());

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Modal & Filter States
    const [selectedInternId, setSelectedInternId] = useState<string | null>(null);
    const [detailMonth, setDetailMonth] = useState(new Date().getMonth().toString());
    const [detailYear, setDetailYear] = useState(new Date().getFullYear().toString());

    const { data: interns = [] } = useQuery<User[]>({
        queryKey: ["/api/interns"],
    });

    const { data: attendance = [], isLoading } = useQuery<Attendance[]>({
        queryKey: ["/api/attendance"],
    });

    // Formatting Helpers
    const formatTime = (msString: string | null) => {
        if (!msString) return "—";
        try {
            return format(new Date(parseInt(msString)), "hh:mm a");
        } catch (e) {
            return msString;
        }
    };

    const calculateDuration = (login: string | null, logout: string | null) => {
        if (!login || !logout) return "00:00";
        try {
            const diff = parseInt(logout) - parseInt(login);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } catch (e) {
            return "00:00";
        }
    };

    // Enhanced Summary Aggregation
    const summaryData = useMemo(() => {
        const today = startOfDay(new Date());
        const selectedM = parseInt(mainMonth);
        const selectedY = parseInt(mainYear);
        
        const filteredInterns = interns.filter(item => 
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.department || "").toLowerCase().includes(search.toLowerCase()) ||
            (item.hodName || "").toLowerCase().includes(search.toLowerCase())
        );

        return filteredInterns.map(intern => {
            const allInternLogs = attendance.filter(a => a.userId === intern.id);
            
            // Overall Stats (All time)
            const totalPresentDays = new Set(allInternLogs.map(l => format(new Date(l.date || ""), "yyyy-MM-dd"))).size;
            const signupDate = startOfDay(new Date(intern.createdAt || new Date()));
            const daysSinceSignup = Math.max(0, differenceInCalendarDays(today, signupDate));
            const totalAbsentDays = Math.max(0, daysSinceSignup - totalPresentDays);

            // Filtered Stats (Current selected month)
            const monthlyLogs = allInternLogs.filter(a => {
                const d = new Date(a.date || "");
                return d.getMonth() === selectedM && d.getFullYear() === selectedY;
            });
            const filteredPresent = new Set(monthlyLogs.map(l => format(new Date(l.date || ""), "yyyy-MM-dd"))).size;
            
            // Calculate absent for the selected month
            let filteredAbsent = 0;
            if (selectedM === today.getMonth() && selectedY === today.getFullYear()) {
                filteredAbsent = Math.max(0, today.getDate() - filteredPresent);
            } else {
                const lastDayOfShownMonth = getDaysInMonth(new Date(selectedY, selectedM));
                filteredAbsent = Math.max(0, lastDayOfShownMonth - filteredPresent);
            }

            return {
                ...intern,
                filteredPresent,
                filteredAbsent,
                totalPresentDays,
                totalAbsentDays,
                trackedMonthName: MONTHS[selectedM]
            };
        });
    }, [interns, attendance, search, mainMonth, mainYear]);

    // Pagination Logic
    const totalPages = Math.ceil(summaryData.length / pageSize);
    const paginatedData = summaryData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Modal Details Filtering
    const selectedIntern = interns.find(i => i.id === selectedInternId);
    const detailLogs = useMemo(() => {
        if (!selectedInternId) return [];
        return attendance.filter(a => {
            const logDate = new Date(a.date || "");
            return a.userId === selectedInternId && 
                   logDate.getMonth().toString() === detailMonth &&
                   logDate.getFullYear().toString() === detailYear;
        }).sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
    }, [selectedInternId, attendance, detailMonth, detailYear]);

    return (
        <AppLayout>
            <div className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">
                            Attendance Registry
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs font-medium">
                            Monitor enterprise-wide clock-in sequences and institutional historical logs.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl shadow-sm h-11">
                        <History className="h-4 w-4 text-primary opacity-60" />
                        <div className="flex flex-col items-start pr-2">
                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest leading-none">Total Registry</span>
                            <span className="text-lg font-black text-primary leading-none tabular-nums">{interns.length}</span>
                        </div>
                    </div>
                </header>

                <div className="glass rounded-xl border-white/10 shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                            <div className="relative w-full lg:max-w-md group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input 
                                    placeholder="Search by identity, department or guide..." 
                                    className="pl-9 h-10 bg-white/5 border-white/10 rounded-xl text-[10px] font-medium uppercase tracking-tight focus:bg-white/10 transition-all"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                            
                            <div className="flex items-center gap-2 w-full lg:w-auto">
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                                    <Filter className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-[9px] font-black uppercase text-primary tracking-widest whitespace-nowrap">Monthly Index</span>
                                </div>
                                <Select value={mainMonth} onValueChange={(v) => { setMainMonth(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full sm:w-[130px] h-10 bg-white/5 border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((m, idx) => (
                                            <SelectItem key={m} value={idx.toString()}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={mainYear} onValueChange={(v) => { setMainYear(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-[90px] h-10 bg-white/5 border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {YEARS.map(y => (
                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl shrink-0" onClick={() => {
                                    setSearch("");
                                    setMainMonth(new Date().getMonth().toString());
                                    setMainYear(new Date().getFullYear().toString());
                                    setCurrentPage(1);
                                }}>
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] first:pl-6">Intern Identity</th>
                                    <th className="p-4 text-[9px] font-black uppercase text-primary tracking-[0.1em] text-center border-l border-white/5 bg-primary/[0.03]">F. Present</th>
                                    <th className="p-4 text-[9px] font-black uppercase text-rose-500 tracking-[0.1em] text-center border-l border-white/5 bg-rose-500/[0.03]">F. Absent</th>
                                    <th className="p-4 text-[9px] font-black uppercase text-emerald-500 tracking-[0.1em] text-center border-l border-white/5 bg-emerald-500/[0.03]">Overall Present</th>
                                    <th className="p-4 text-[9px] font-black uppercase text-rose-600 tracking-[0.1em] text-center border-l border-white/5 bg-rose-600/[0.03]">Overall Absent</th>
                                    <th className="p-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em] text-right last:pr-6 border-l border-white/5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="p-8"><div className="h-4 w-full bg-white/5 rounded" /></td>
                                        </tr>
                                    ))
                                ) : paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">
                                            No attendance telemetry found for current criteria.
                                        </td>
                                    </tr>
                                ) : paginatedData.map((summary) => (
                                    <tr key={summary.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 first:pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-inner">
                                                    {summary.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[11px] text-foreground uppercase tracking-tight leading-none mb-1">{summary.name}</span>
                                                    <span className="text-[9px] text-muted-foreground font-bold uppercase opacity-60 tracking-tighter">
                                                        {summary.department || "General"} | HOD: {summary.hodName || "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center border-l border-white/5 bg-primary/[0.01]">
                                            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg min-w-[32px] justify-center h-7 font-black text-xs tabular-nums">
                                                {summary.filteredPresent}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-center border-l border-white/5 bg-rose-500/[0.01]">
                                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 rounded-lg min-w-[32px] justify-center h-7 font-black text-xs tabular-nums">
                                                {summary.filteredAbsent}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-center border-l border-white/5 bg-emerald-500/[0.01]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-emerald-500 leading-none tabular-nums">{summary.totalPresentDays}</span>
                                                <span className="text-[7px] font-black uppercase tracking-tighter text-emerald-500/50 mt-1">Days Present</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center border-l border-white/5 bg-rose-600/[0.01]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-rose-600 leading-none tabular-nums">{summary.totalAbsentDays}</span>
                                                <span className="text-[7px] font-black uppercase tracking-tighter text-rose-600/50 mt-1">Days Absent</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right last:pr-6 border-l border-white/5">
                                            <Button 
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedInternId(summary.id);
                                                    setDetailMonth(mainMonth);
                                                    setDetailYear(mainYear);
                                                }}
                                                className="rounded-lg font-black text-[9px] uppercase tracking-widest h-8 px-4 hover:bg-white/10 transition-all border-white/10"
                                            >
                                                History
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/5">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest tabular-nums leading-none">
                            Identity {(currentPage - 1) * pageSize + 1} – {Math.min(currentPage * pageSize, summaryData.length)} / {summaryData.length} records
                        </span>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                disabled={currentPage === 1} 
                                className="h-8 px-3 rounded-lg text-[10px] font-black uppercase gap-1 border-white/10"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-[10px] font-black tabular-nums border border-white/10 px-3 h-8 flex items-center rounded-lg bg-black/20 text-foreground">
                                {currentPage} / {totalPages}
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                disabled={currentPage === totalPages || totalPages === 0} 
                                className="h-8 px-3 rounded-lg text-[10px] font-black uppercase gap-1 border-white/10"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedInternId} onOpenChange={(open) => !open && setSelectedInternId(null)}>
                <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none w-[95vw] h-[90vh]">
                    <div className="bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass flex flex-col h-full">
                        <div className="p-6 border-b border-white/5 bg-white/5 shrink-0">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl shadow-inner">
                                    {selectedIntern?.name?.charAt(0)}
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black uppercase tracking-tight">{selectedIntern?.name}</DialogTitle>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-60">
                                            <Building2 className="h-3 w-3 text-primary" />
                                            {selectedIntern?.department || "Department Routing"}
                                        </p>
                                        <div className="h-1 w-1 rounded-full bg-white/20" />
                                        <p className="text-primary font-black text-[9px] uppercase tracking-widest">
                                            Index: {MONTHS[parseInt(detailMonth)]} {detailYear}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-b border-white/5 bg-white/[0.02] shrink-0">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <ClipboardCheck className="h-3.5 w-3.5 text-primary" />
                                    <h4 className="font-black text-[9px] uppercase tracking-widest">Session Drill-Down</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={detailMonth} onValueChange={setDetailMonth}>
                                        <SelectTrigger className="w-[110px] h-8 bg-white/5 border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m, idx) => (
                                                <SelectItem key={m} value={idx.toString()} className="text-[10px] font-black uppercase tracking-widest">{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={detailYear} onValueChange={setDetailYear}>
                                        <SelectTrigger className="w-[80px] h-8 bg-white/5 border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {YEARS.map(y => (
                                                <SelectItem key={y} value={y} className="text-[10px] font-black uppercase tracking-widest">{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-background/95 backdrop-blur-md z-10 border-b border-white/10">
                                        <tr className="bg-white/5">
                                            <th className="p-4 text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-8">Protocol Date</th>
                                            <th className="p-4 text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Clock In</th>
                                            <th className="p-4 text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Clock Out</th>
                                            <th className="p-4 text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] pr-8 text-right">Sequence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {detailLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-20 text-center opacity-30 italic text-[9px] font-black uppercase tracking-widest">
                                                    No session telemetry found for current timeframe.
                                                </td>
                                            </tr>
                                        ) : (
                                            detailLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4 pl-8 font-black text-xs text-foreground/80 tracking-tight">
                                                        {log.date ? format(new Date(log.date), "dd MMM yyyy") : "N/A"}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-emerald-500 font-black text-[10px] tracking-tight tabular-nums bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10 grayscale-[0.3]">
                                                            {formatTime(log.loginTime)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {log.logoutTime ? (
                                                            <span className="text-rose-500 font-black text-[10px] tracking-tight tabular-nums bg-rose-500/5 px-2 py-1 rounded-md border border-rose-500/10 grayscale-[0.3]">
                                                                {formatTime(log.logoutTime)}
                                                            </span>
                                                        ) : (
                                                            <Badge className="bg-primary/20 text-primary border-primary/20 animate-pulse text-[8px] font-black uppercase tracking-widest">Active Sequence</Badge>
                                                        )}
                                                    </td>
                                                    <td className="p-4 pr-8 text-right font-black text-foreground/40 text-[10px] tabular-nums">
                                                        {calculateDuration(log.loginTime, log.logoutTime)} <span className="text-[8px] opacity-40">HRS</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </ScrollArea>

                        <div className="p-6 bg-white/5 border-t border-white/5 shrink-0">
                            <Button onClick={() => setSelectedInternId(null)} className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest h-11 bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5 transition-all">
                                Close Registry
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
