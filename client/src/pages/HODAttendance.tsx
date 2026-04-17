import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { type Attendance, type User } from "@shared/schema";
import { Search, Calendar, Clock, RotateCcw, Eye, MapPin, Building2, TrendingUp, History } from "lucide-react";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDaysInMonth, isAfter, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function HODAttendance() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [user] = useState(storedUser);
    const [search, setSearch] = useState("");
    
    // Modal & Filter States
    const [selectedInternId, setSelectedInternId] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

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

    // Summary Aggregation for current month
    const summaryData = useMemo(() => {
        const now = new Date();
        const daysInMon = getDaysInMonth(now);
        
        return interns.map(intern => {
            const internLogs = attendance.filter(a => 
                a.userId === intern.id && 
                new Date(a.date || "").getMonth() === now.getMonth() &&
                new Date(a.date || "").getFullYear() === now.getFullYear()
            );
            
            const presentDays = new Set(internLogs.map(l => format(new Date(l.date || ""), "yyyy-MM-dd"))).size;
            const absentDays = Math.max(0, now.getDate() - presentDays); // Absents based on days passed so far

            return {
                ...intern,
                monthName: format(now, "MMMM"),
                presentDays,
                absentDays
            };
        }).filter(item => 
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.department || "").toLowerCase().includes(search.toLowerCase())
        );
    }, [interns, attendance, search]);

    // Modal Details Filtering
    const selectedIntern = interns.find(i => i.id === selectedInternId);
    const detailLogs = useMemo(() => {
        if (!selectedInternId) return [];
        return attendance.filter(a => {
            const logDate = new Date(a.date || "");
            return a.userId === selectedInternId && 
                   logDate.getMonth().toString() === selectedMonth &&
                   logDate.getFullYear().toString() === selectedYear;
        }).sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
    }, [selectedInternId, attendance, selectedMonth, selectedYear]);

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1200px] mx-auto space-y-8">
                    <header className="flex justify-between items-end animate-in fade-in slide-in-from-left duration-700">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                Attendance Hub
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-medium">
                                Monthly overview and detailed tracking for supervised interns.
                            </p>
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-indigo-500/5">
                            <History className="h-5 w-5 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Live Logs</span>
                        </div>
                    </header>

                    {/* Summary Filters */}
                    <div className="flex gap-4 items-center p-5 glass rounded-2xl border-white/10 shadow-xl">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by intern name or branch..." 
                                className="pl-9 h-11 bg-white/5 border-white/10 rounded-xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-primary rounded-xl" onClick={() => setSearch("")}>
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Summary Table */}
                    <div className="glass rounded-3xl border-white/10 shadow-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Intern Name</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Tracked Month</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Present Days</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Absent Days</th>
                                    <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-20">
                                            <td colSpan={5} className="p-6 h-full bg-white/5" />
                                        </tr>
                                    ))
                                ) : summaryData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-muted-foreground italic font-medium">
                                            No attendance data found for this period.
                                        </td>
                                    </tr>
                                ) : summaryData.map((summary, i) => (
                                    <tr key={summary.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                    {summary.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-foreground truncate">{summary.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter opacity-70">
                                                        {summary.department || "No Branch"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-indigo-500" />
                                                <span className="font-bold text-sm">{summary.monthName}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1.5 rounded-xl font-black text-lg">
                                                {summary.presentDays}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-center">
                                            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-4 py-1.5 rounded-xl font-black text-lg">
                                                {summary.absentDays}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-right">
                                            <Button 
                                                variant="outline"
                                                onClick={() => setSelectedInternId(summary.id)}
                                                className="rounded-xl font-black gap-2 h-10 px-6 hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10 border-indigo-500/20"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Detailed
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Attendance Detail Modal */}
            <Dialog open={!!selectedInternId} onOpenChange={(open) => !open && setSelectedInternId(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <div className="bg-background rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden glass">
                        {/* Modal Header */}
                        <div className="p-8 bg-gradient-to-br from-indigo-500/20 via-indigo-500/5 to-transparent border-b border-white/5 relative">
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex gap-6">
                                    <div className="h-20 w-20 rounded-3xl bg-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-500/40 border-4 border-white/10">
                                        {selectedIntern?.name?.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <DialogTitle className="text-3xl font-black tracking-tight">{selectedIntern?.name}</DialogTitle>
                                        <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Building2 className="h-3 w-3 text-indigo-500" />
                                            {selectedIntern?.department || "Department Not Assigned"}
                                        </p>
                                        <div className="flex gap-4 mt-3">
                                            <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/10 rounded-lg px-3 py-1 font-bold lowercase">
                                                {selectedIntern?.email}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">
                            {/* Detailed Filters inside Modal */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                                    <h4 className="font-black text-sm uppercase tracking-widest opacity-70">Monthly Analysis</h4>
                                </div>
                                <div className="flex gap-3">
                                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                        <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 rounded-xl font-bold">
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, idx) => (
                                                <SelectItem key={m} value={idx.toString()}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="w-[100px] h-10 bg-white/5 border-white/10 rounded-xl font-bold">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["2024", "2025", "2026"].map(y => (
                                                <SelectItem key={y} value={y}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Daily Logs Table */}
                            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20 max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-20 bg-card/60 backdrop-blur-md">
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Clock In</th>
                                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Clock Out</th>
                                            <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {detailLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-10 text-center opacity-40 font-bold italic">
                                                    No logs found for the selected month/year.
                                                </td>
                                            </tr>
                                        ) : (
                                            detailLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4 font-bold text-sm">
                                                        {log.date ? format(new Date(log.date), "dd MMM yyyy") : "N/A"}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2 text-emerald-500 font-black text-xs">
                                                            <Clock className="h-3 w-3" />
                                                            {formatTime(log.loginTime)}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2 text-rose-500 font-black text-xs">
                                                            <Clock className="h-3 w-3" />
                                                            {log.logoutTime ? formatTime(log.logoutTime) : "Active"}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-black text-indigo-500">
                                                        {calculateDuration(log.loginTime, log.logoutTime)} hrs
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-8 bg-white/5 border-t border-white/5 flex justify-end">
                            <Button onClick={() => setSelectedInternId(null)} className="rounded-2xl px-12 font-black h-12 bg-white text-black hover:bg-white/90 transition-all shadow-xl">
                                Close Window
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
