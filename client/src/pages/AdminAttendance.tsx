import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronRight, ChevronLeft, RotateCcw, Calendar, Eye } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { type Attendance, type User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function AdminAttendance() {
    const [filterName, setFilterName] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [selectedDetail, setSelectedDetail] = useState<{ userId: string; date: string; name: string } | null>(null);

    const { data: attendanceRecords, isLoading } = useQuery<any[]>({
        queryKey: ["/api/admin/attendance/grouped"],
    });

    const { data: interns } = useQuery<User[]>({
        queryKey: ["/api/interns"],
    });

    const getInternName = (id: string) => {
        return interns?.find((i) => i.id === id)?.name || "Unknown";
    };

    const filteredRecords = (attendanceRecords || []).filter((record) => {
        const nameMatch = getInternName(record.userId).toLowerCase().includes(filterName.toLowerCase());
        const dateMatch = !filterDate || record.date === filterDate;
        return nameMatch && dateMatch;
    });

    const resetFilters = () => {
        setFilterName("");
        setFilterDate("");
    };

    const parseTime = (timeStr: string | null | undefined) => {
        if (!timeStr) return null;
        const num = Number(timeStr);
        return isNaN(num) ? new Date(timeStr) : new Date(num);
    };

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1400px] mx-auto space-y-6">
                    <header className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground">
                                Attendance Tracking
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm font-medium">
                                Automated clock-in/out logs and calculated hours
                            </p>
                        </div>
                        <div className="bg-secondary/50 px-4 py-2 rounded-2xl border border-white/20 shadow-sm flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Total Days:</span>
                            <span className="text-lg font-black text-primary">{filteredRecords.length}</span>
                        </div>
                    </header>

                    <div className="flex gap-4 items-center p-6 glass rounded-2xl border-white/10 shadow-xl shadow-primary/5">
                        <div className="flex-[2] relative">
                            <Input
                                placeholder="Filter by Intern Name"
                                className="h-11 bg-white/5 border-white/10 rounded-xl pl-4"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="date"
                                className="h-11 bg-white/5 border-white/10 rounded-xl pr-10 text-muted-foreground"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-primary transition-all"
                            onClick={resetFilters}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="glass rounded-2xl border-white/10 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Intern</th>
                                        <th className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Date</th>
                                        <th className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Working Hours</th>
                                        <th className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</th>
                                        <th className="p-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="p-20 text-center text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Fetching logs...</td></tr>
                                    ) : filteredRecords.map((record, index) => (
                                        <tr key={`${record.userId}-${record.date}-${index}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-[10px]">
                                                        {getInternName(record.userId).charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-sm">{getInternName(record.userId)}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-sm font-bold opacity-80">
                                                {record.date ? format(new Date(record.date), "MMM dd, yyyy") : "N/A"}
                                            </td>
                                            <td className="p-5 text-sm font-black text-primary">
                                                {record.totalHours || "0.00"} hrs
                                            </td>
                                            <td className="p-5">
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${record.status === 'present' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    record.status === 'absent' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    }`}>
                                                    {record.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg font-bold text-xs gap-2 border-primary/20 hover:bg-primary/10 text-primary transition-all active:scale-95 shadow-sm"
                                                    onClick={() => setSelectedDetail({
                                                        userId: record.userId,
                                                        date: record.date,
                                                        name: getInternName(record.userId)
                                                    })}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View Attendance
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && filteredRecords.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center text-muted-foreground italic font-medium">
                                                No attendance logs found matching the filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center px-8">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Showing {filteredRecords.length} records</p>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled>
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <span className="text-xs font-black uppercase tracking-widest">Page 1 of 1</span>
                                <Button variant="outline" size="sm" className="h-8 rounded-xl px-4 border-white/10 bg-white/5" disabled>
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AttendanceDetailsModal
                detail={selectedDetail}
                onClose={() => setSelectedDetail(null)}
            />
        </div>
    );
}

function AttendanceDetailsModal({
    detail,
    onClose
}: {
    detail: { userId: string; date: string; name: string } | null;
    onClose: () => void;
}) {
    const { data: details, isLoading } = useQuery<Attendance[]>({
        queryKey: ["/api/admin/attendance/details", detail?.userId, detail?.date],
        enabled: !!detail,
        queryFn: async () => {
            const res = await fetch(`/api/admin/attendance/details?userId=${detail?.userId}&date=${detail?.date}`);
            if (!res.ok) throw new Error("Failed to fetch details");
            return res.json();
        }
    });

    const parseTime = (timeStr: string | null | undefined) => {
        if (!timeStr) return null;
        const num = Number(timeStr);
        return isNaN(num) ? new Date(timeStr) : new Date(num);
    };

    return (
        <Dialog open={!!detail} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl glass border-white/20 p-0 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tight">{detail?.name}</DialogTitle>
                            <DialogDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground mt-0.5">
                                {detail?.date ? format(new Date(detail.date), "MMMM dd, yyyy") : ""}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6">
                    <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-white/10">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-white/10 text-center">Check-in Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-white/10 text-center">Check-out Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan={2} className="p-10 text-center text-muted-foreground animate-pulse font-bold text-xs uppercase tracking-widest">Loading sessions...</td></tr>
                                ) : (details || []).length === 0 ? (
                                    <tr><td colSpan={2} className="p-10 text-center text-muted-foreground italic text-sm">No sessions found.</td></tr>
                                ) : (details || []).map((session) => (
                                    <tr key={session.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-black text-foreground">
                                                {session.loginTime ? format(parseTime(session.loginTime)!, "hh:mm a") : "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "text-sm font-black",
                                                session.logoutTime ? "text-foreground" : "text-yellow-500 animate-pulse"
                                            )}>
                                                {session.logoutTime ? format(parseTime(session.logoutTime)!, "hh:mm a") : "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-white/5 border-t border-white/10">
                    <Button variant="outline" className="rounded-xl font-bold px-8 h-10 border-white/10 hover:bg-white/10 transition-all w-full sm:w-auto mx-auto mb-2" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
