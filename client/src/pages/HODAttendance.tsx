import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { type Attendance, type User } from "@shared/schema";
import { Search, Calendar, Clock, RotateCcw } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HODAttendance() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [user] = useState(storedUser);
    const [search, setSearch] = useState("");

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

    const filtered = attendance.filter(record => {
        const intern = interns.find(i => i.id === record.userId);
        if (!intern) return false;
        
        const searchStr = search.toLowerCase();
        return (
            intern.name.toLowerCase().includes(searchStr) ||
            format(new Date(record.date || ""), "MMM dd, yyyy").toLowerCase().includes(searchStr)
        );
    });

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1200px] mx-auto space-y-8">
                    <header className="animate-in fade-in slide-in-from-left duration-700">
                        <h1 className="text-4xl font-black tracking-tight text-foreground">
                            Attendance Logs
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg font-medium">
                            Daily clock-in and clock-out monitoring for your department's interns.
                        </p>
                    </header>

                    <div className="flex gap-4 items-center p-5 glass rounded-2xl border-white/10 shadow-xl">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by student name or date..." 
                                className="pl-9 h-11 bg-white/5 border-white/10 rounded-xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-primary rounded-xl" onClick={() => setSearch("")}>
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="bg-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                                    <th className="p-6">Intern</th>
                                    <th className="p-6">Date</th>
                                    <th className="p-6">Clock In</th>
                                    <th className="p-6">Clock Out</th>
                                    <th className="p-6">Duration</th>
                                    <th className="p-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="p-6 h-16 bg-white/5" />
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground font-bold">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                ) : filtered.map((record, i) => {
                                    const intern = interns.find(inr => inr.id === record.userId);
                                    return (
                                        <tr key={record.id} className="hover:bg-white/5 transition-colors group animate-in fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                                                        {intern?.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold">{intern?.name || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-bold opacity-80">
                                                {record.date ? format(new Date(record.date), "MMM dd, yyyy") : "N/A"}
                                            </td>
                                            <td className="p-6 text-xs font-black">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-green-500" />
                                                    {record.loginTime || "—"}
                                                </div>
                                            </td>
                                            <td className="p-6 text-xs font-black">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-red-500" />
                                                    {record.logoutTime || "Active"}
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-black text-primary">
                                                {record.totalHours || "0.00"} hrs
                                            </td>
                                            <td className="p-6 text-right">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${record.logoutTime ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500 animate-pulse"}`}>
                                                    {record.logoutTime ? "Completed" : "In Progress"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
