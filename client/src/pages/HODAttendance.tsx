import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { type Attendance, type User } from "@shared/schema";
import { Search, Calendar, Clock, RotateCcw, Eye, Building2, History, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { format, getDaysInMonth, differenceInCalendarDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = ["2024", "2025", "2026"];

export default function HODAttendance() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [user] = useState(storedUser);
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
        queryKey: ["/api/hod/students", user.email],
        queryFn: async () => {
            const res = await fetch(`/api/hod/students?hodEmail=${user.email}`);
            return res.json();
        },
        enabled: !!user.email
    });

    const { data: attendance = [], isLoading } = useQuery<Attendance[]>({
        queryKey: ["/api/hod/attendance", user.email],
        queryFn: async () => {
            const res = await fetch(`/api/hod/attendance?hodEmail=${user.email}`);
            if (!res.ok) throw new Error("Failed to fetch attendance logs");
            return res.json();
        },
        enabled: !!user.email
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
        
        return interns.map(intern => {
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
        }).filter(item => 
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.department || "").toLowerCase().includes(search.toLowerCase())
        );
    }, [interns, attendance, search, mainMonth, mainYear]);

    // Pagination Logic
    const totalPages = Math.max(1, Math.ceil(summaryData.length / pageSize));
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
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">
                        Attendance Hub
                    </h1>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                        Tracking daily presence and monthly performance for your interns.
                    </p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-3 w-fit">
                    <History className="h-4 w-4 text-indigo-500" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest leading-none">Total Students</span>
                        <span className="text-lg font-black text-foreground tabular-nums">{interns.length}</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 items-center p-4 glass rounded-xl border-white/10 shadow-sm">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                        placeholder="Search intern or department..." 
                        className="pl-9 h-10 bg-white/5 border-white/10 rounded-xl text-xs"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <Select value={mainMonth} onValueChange={setMainMonth}>
                        <SelectTrigger className="w-[120px] h-9 bg-white/5 border-white/10 rounded-xl font-bold text-[10px] uppercase">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m, idx) => (
                                <SelectItem key={m} value={idx.toString()} className="text-[10px] font-bold">{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={mainYear} onValueChange={setMainYear}>
                        <SelectTrigger className="w-[80px] h-9 bg-white/5 border-white/10 rounded-xl font-bold text-[10px] uppercase">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map(y => (
                                <SelectItem key={y} value={y} className="text-[10px] font-bold">{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => {
                        setSearch("");
                        setMainMonth(new Date().getMonth().toString());
                        setMainYear(new Date().getFullYear().toString());
                    }}>
                        <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <div className="glass rounded-xl border-white/10 shadow-sm overflow-hidden relative text-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Intern Details</th>
                                <th className="p-4 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/5">Month</th>
                                <th className="p-4 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/5 text-center">P. Days</th>
                                <th className="p-4 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/5 text-center">A. Days</th>
                                <th className="p-4 text-[9px] font-black text-emerald-500 uppercase tracking-widest border-l border-white/5 bg-emerald-500/5 text-center">Overall P.</th>
                                <th className="p-4 text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 text-center">Overall A.</th>
                                <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-16">
                                        <td colSpan={7} className="p-4 bg-white/5" />
                                    </tr>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-muted-foreground italic font-medium opacity-50">
                                        No attendance logs found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((summary) => (
                                    <tr key={summary.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 min-w-[180px]">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all text-xs">
                                                    {summary.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-foreground truncate">{summary.name}</p>
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                                        {summary.department || "General"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 bg-indigo-500/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-indigo-500/50" />
                                                <span className="font-bold text-[11px] text-indigo-400 uppercase tracking-wider">{summary.trackedMonthName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center bg-indigo-500/[0.02]">
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-md min-w-[32px] justify-center h-6 font-black text-xs tabular-nums">
                                                {summary.filteredPresent}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-center bg-indigo-500/[0.02]">
                                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 rounded-md min-w-[32px] justify-center h-6 font-black text-xs tabular-nums">
                                                {summary.filteredAbsent}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-center border-l border-white/5 bg-emerald-500/[0.02]">
                                            <div className="flex flex-col items-center leading-tight">
                                                <span className="text-sm font-black text-emerald-500 tabular-nums">{summary.totalPresentDays}</span>
                                                <span className="text-[7px] font-black uppercase text-emerald-500/50">Days</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center bg-rose-500/[0.02]">
                                            <div className="flex flex-col items-center leading-tight">
                                                <span className="text-sm font-black text-rose-500 tabular-nums">{summary.totalAbsentDays}</span>
                                                <span className="text-[7px] font-black uppercase text-rose-500/50">Days</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button 
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedInternId(summary.id);
                                                    setDetailMonth(mainMonth);
                                                    setDetailYear(mainYear);
                                                }}
                                                className="rounded-xl font-black uppercase text-[9px] h-8 px-4 border-indigo-500/20 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                            >
                                                <Eye className="h-3 w-3" />
                                                Logs
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                            Showing {paginatedData.length} of {summaryData.length} Records
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 rounded-lg text-[10px] uppercase font-black"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                        </Button>
                        
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-black px-3 py-1 bg-black/20 rounded-lg border border-white/10 tabular-nums">
                                {currentPage} / {totalPages}
                            </span>
                        </div>

                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-8 rounded-lg text-[10px] uppercase font-black"
                        >
                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedInternId} onOpenChange={(open) => !open && setSelectedInternId(null)}>
                <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none w-[95vw] h-[95vh]">
                    <div className="bg-background rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass flex flex-col h-full">
                        <div className="p-5 bg-gradient-to-br from-indigo-500/20 via-indigo-500/5 to-transparent border-b border-white/5 shrink-0">
                            <div className="flex items-start gap-4">
                                <div className="h-14 w-14 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xl font-black shadow-lg border-2 border-white/10 shrink-0">
                                    {selectedIntern?.name?.charAt(0)}
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <DialogTitle className="text-xl font-black tracking-tight truncate">{selectedIntern?.name}</DialogTitle>
                                    <p className="text-muted-foreground font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 opacity-70">
                                        <Building2 className="h-3 w-3 text-indigo-500" />
                                        {selectedIntern?.department || "General Department"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 gap-3">
                                <h4 className="font-black text-[9px] uppercase tracking-widest opacity-70">Personalized Logs</h4>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Select value={detailMonth} onValueChange={setDetailMonth}>
                                        <SelectTrigger className="flex-1 sm:w-[120px] h-8 bg-white/5 border-white/10 rounded-lg font-bold text-[10px] uppercase">
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m, idx) => (
                                                <SelectItem key={m} value={idx.toString()} className="text-[10px] font-bold">{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={detailYear} onValueChange={setDetailYear}>
                                        <SelectTrigger className="w-[70px] h-8 bg-white/5 border-white/10 rounded-lg font-bold text-[10px] uppercase">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {YEARS.map(y => (
                                                <SelectItem key={y} value={y} className="text-[10px] font-bold">{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20 shadow-inner">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead className="sticky top-0 bg-card z-10">
                                            <tr className="border-b border-white/10 bg-white/5">
                                                <th className="p-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-4">Date</th>
                                                <th className="p-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Clock In</th>
                                                <th className="p-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Clock Out</th>
                                                <th className="p-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right pr-4">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {detailLogs.length === 0 ? (
                                                <tr><td colSpan={4} className="p-10 text-center opacity-40 font-bold italic text-xs tracking-widest uppercase">No logs.</td></tr>
                                            ) : (
                                                detailLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-white/[0.02] text-xs font-medium">
                                                        <td className="p-3 px-4 tabular-nums">{log.date ? format(new Date(log.date), "dd MMM yyyy") : "N/A"}</td>
                                                        <td className="p-3">
                                                            <div className="flex items-center justify-center gap-1.5 text-emerald-500 font-bold tabular-nums">
                                                                <Clock className="h-3 w-3" /> {formatTime(log.loginTime)}
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center justify-center gap-1.5 text-rose-500 font-bold tabular-nums">
                                                                <Clock className="h-3 w-3" /> {log.logoutTime ? formatTime(log.logoutTime) : "Active"}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-right pr-4 font-black text-indigo-500 tabular-nums">{calculateDuration(log.loginTime, log.logoutTime)} hrs</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end shrink-0">
                            <Button onClick={() => setSelectedInternId(null)} className="rounded-xl px-10 font-black h-10 bg-white text-black hover:bg-white/90 shadow-xl text-[10px] uppercase tracking-widest">
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
