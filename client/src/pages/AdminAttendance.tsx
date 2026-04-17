import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { type Attendance, type User } from "@shared/schema";
import { Search, Calendar, Clock, RotateCcw, Eye, Building2, TrendingUp, History, Filter, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { format, getDaysInMonth, differenceInCalendarDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    <header className="flex justify-between items-end animate-in fade-in slide-in-from-left duration-700">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                Attendance Tracking
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-medium">
                                Organization-wide attendance summaries and detailed career historical logs.
                            </p>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/5">
                            <History className="h-5 w-5 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Total Interns</span>
                                <span className="text-xl font-black text-foreground">{interns.length}</span>
                            </div>
                        </div>
                    </header>

                    {/* Filters Section */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center p-6 glass rounded-2xl border-white/10 shadow-xl">
                        <div className="relative flex-1 w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, branch or HOD..." 
                                className="pl-9 h-11 bg-white/5 border-white/10 rounded-xl"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        
                        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10">
                                <Filter className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Global Filter</span>
                            </div>
                            <Select value={mainMonth} onValueChange={(v) => { setMainMonth(v); setCurrentPage(1); }}>
                                <SelectTrigger className="w-[140px] h-11 bg-white/5 border-white/10 rounded-xl font-bold">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m, idx) => (
                                        <SelectItem key={m} value={idx.toString()}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={mainYear} onValueChange={(v) => { setMainYear(v); setCurrentPage(1); }}>
                                <SelectTrigger className="w-[100px] h-11 bg-white/5 border-white/10 rounded-xl font-bold">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {YEARS.map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl" onClick={() => {
                                setSearch("");
                                setMainMonth(new Date().getMonth().toString());
                                setMainYear(new Date().getFullYear().toString());
                                setCurrentPage(1);
                            }}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Paginated Data Table */}
                    <div className="glass rounded-3xl border-white/10 shadow-2xl overflow-hidden relative">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Intern Details</th>
                                    <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest border-l border-white/5 bg-primary/5">Filtered Month</th>
                                    <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 text-center px-4">P. Days</th>
                                    <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 text-center px-4">A. Days</th>
                                    <th className="p-6 text-[10px] font-black text-emerald-500 uppercase tracking-widest border-l border-white/5 bg-emerald-500/5 text-center">Total Present (Overall)</th>
                                    <th className="p-6 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 text-center">Total Absent (Overall)</th>
                                    <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right border-l border-white/5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-20">
                                            <td colSpan={7} className="p-6 bg-white/5" />
                                        </tr>
                                    ))
                                ) : paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center text-muted-foreground italic font-medium opacity-50">
                                            No attendance logs found for specified filters.
                                        </td>
                                    </tr>
                                ) : paginatedData.map((summary) => (
                                    <tr key={summary.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6 min-w-[250px]">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                                                    {summary.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-foreground truncate">{summary.name}</p>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                                            {summary.department || "General"}
                                                        </p>
                                                        <p className="text-[8px] font-black text-primary/70 uppercase tracking-tighter">
                                                            HOD: {summary.hodName || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 border-l border-white/5 bg-primary/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary/50" />
                                                <span className="font-black text-sm text-primary">{summary.trackedMonthName}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center bg-primary/[0.02]">
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg min-w-[42px] justify-center h-8 font-black text-base">
                                                {summary.filteredPresent}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-center bg-primary/[0.02]">
                                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 rounded-lg min-w-[42px] justify-center h-8 font-black text-base">
                                                {summary.filteredAbsent}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-center border-l border-white/5 bg-emerald-500/[0.02]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xl font-black text-emerald-500 leading-none">{summary.totalPresentDays}</span>
                                                <span className="text-[8px] font-black uppercase tracking-tighter text-emerald-500/50 mt-1">Present Days</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center bg-rose-500/[0.02]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xl font-black text-rose-500 leading-none">{summary.totalAbsentDays}</span>
                                                <span className="text-[8px] font-black uppercase tracking-tighter text-rose-500/50 mt-1">Absent Days</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right border-l border-white/5">
                                            <Button 
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedInternId(summary.id);
                                                    setDetailMonth(mainMonth);
                                                    setDetailYear(mainYear);
                                                }}
                                                className="rounded-xl font-black gap-2 h-10 px-6 hover:bg-white hover:text-black transition-all border-white/10 shadow-sm"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Log
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Footer */}
                        <div className="p-4 bg-white/5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-8 gap-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                    Showing {paginatedData.length} of {summaryData.length} Interns
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-xl h-9 hover:bg-white/5 text-xs font-bold gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Prev
                                </Button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 3 + i + 1;
                                        if (pageNum > totalPages) return null;
                                        
                                        return (
                                            <button 
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`h-8 w-8 rounded-lg text-[10px] font-black transition-all border ${currentPage === pageNum ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-white/10 text-muted-foreground hover:bg-white/5'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="rounded-xl h-9 hover:bg-white/5 text-xs font-bold gap-2"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Detailed History Logs Popup */}
            <Dialog open={!!selectedInternId} onOpenChange={(open) => !open && setSelectedInternId(null)}>
                <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
                    <div className="bg-background rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden glass max-h-[92vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 lg:p-8 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-white/5 shrink-0">
                            <div className="flex gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-primary/40 border-4 border-white/10">
                                    {selectedIntern?.name?.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <DialogTitle className="text-2xl font-black tracking-tight">{selectedIntern?.name}</DialogTitle>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Building2 className="h-3 w-3 text-primary" />
                                            {selectedIntern?.department || "General Department"}
                                        </p>
                                        <p className="text-muted-foreground/60 font-bold text-[9px] uppercase tracking-widest flex items-center gap-2">
                                            HOD: {selectedIntern?.hodName || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 lg:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <h4 className="font-black text-[10px] uppercase tracking-widest opacity-70">Drill-Down Monthly Log</h4>
                                <div className="flex gap-3">
                                    <Select value={detailMonth} onValueChange={setDetailMonth}>
                                        <SelectTrigger className="w-[130px] h-9 bg-white/5 border-white/10 rounded-xl font-bold text-xs">
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m, idx) => (
                                                <SelectItem key={m} value={idx.toString()}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={detailYear} onValueChange={setDetailYear}>
                                        <SelectTrigger className="w-[90px] h-9 bg-white/5 border-white/10 rounded-xl font-bold text-xs">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {YEARS.map(y => (
                                                <SelectItem key={y} value={y}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20 shadow-inner">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-card/80 backdrop-blur-md z-10 border-b border-white/10">
                                        <tr className="bg-white/5">
                                            <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-6 text-center">Date</th>
                                            <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Clock In</th>
                                            <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Clock Out</th>
                                            <th className="p-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right px-6">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {detailLogs.length === 0 ? (
                                            <tr><td colSpan={4} className="p-12 text-center opacity-40 font-bold italic text-xs tracking-widest uppercase">No tracked sessions for selected period.</td></tr>
                                        ) : (
                                            detailLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-white/[0.02]">
                                                    <td className="p-4 px-6 font-bold text-xs tracking-tight text-center">{log.date ? format(new Date(log.date), "dd MMM yyyy") : "N/A"}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-2 text-emerald-500 font-black text-[10px]">
                                                            <Clock className="h-3 w-3" /> {formatTime(log.loginTime)}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-2 text-rose-500 font-black text-[10px]">
                                                            <Clock className="h-3 w-3" /> {log.logoutTime ? formatTime(log.logoutTime) : "Active"}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 px-6 text-right font-black text-primary text-xs">{calculateDuration(log.loginTime, log.logoutTime)} hrs</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end shrink-0">
                            <Button onClick={() => setSelectedInternId(null)} className="rounded-2xl px-12 font-black h-11 bg-white text-black hover:bg-white/90 shadow-2xl active:scale-95 transition-all text-xs">
                                Close Dashboard
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
