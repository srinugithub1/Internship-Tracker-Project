import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { Users, CheckSquare, Clock, TrendingUp, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function HODDashboard() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [user] = useState(storedUser);

    const { data: stats, isLoading } = useQuery({
        queryKey: ["/api/hod/stats", user.email],
        queryFn: async () => {
            const res = await fetch(`/api/hod/stats?hodEmail=${user.email}`);
            if (!res.ok) throw new Error("Failed to fetch HOD stats");
            return res.json();
        },
        enabled: !!user.email
    });

    const statCards = [
        { 
            title: "My Students", 
            value: stats?.totalStudents || 0, 
            icon: Users, 
            color: "text-blue-500", 
            bg: "bg-blue-500/10",
            description: "Students under your supervision"
        },
        { 
            title: "Completion", 
            value: `${stats?.completionRate || 0}%`, 
            icon: TrendingUp, 
            color: "text-green-500", 
            bg: "bg-green-500/10",
            description: "Department productivity"
        },
        { 
            title: "Submitted Tasks", 
            value: `${stats?.completedTasks || 0} / ${stats?.totalTasks || 0}`, 
            icon: CheckSquare, 
            color: "text-purple-500", 
            bg: "bg-purple-500/10",
            description: "Completed by interns"
        },
        { 
            title: "Active Today", 
            value: "Live", 
            icon: Clock, 
            color: "text-orange-500", 
            bg: "bg-orange-500/10",
            description: "Currently clocked in"
        }
    ];

    return (
        <AppLayout>
            <div className="space-y-6">
            <header className="animate-in fade-in slide-in-from-left duration-700">
                <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">
                    HOD Dashboard
                </h1>
                <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                    Welcome, {user.name}. Institution: {user.collegeName || "N/A"}.
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div 
                        key={card.title} 
                        className="glass p-5 rounded-2xl border-white/10 shadow-sm hover:translate-y-[-2px] transition-all duration-300 animate-in fade-in zoom-in"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-xl ${card.bg}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black mb-0.5 tracking-tight">{isLoading ? "..." : card.value}</h3>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                {card.title}
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed opacity-70">
                                {card.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="glass p-6 md:p-8 rounded-2xl border-white/10 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldCheck className="h-24 w-24" />
                    </div>
                    <h2 className="text-xl font-black mb-3 text-primary uppercase tracking-wider">Department Overview</h2>
                    <p className="text-muted-foreground text-xs leading-relaxed max-w-3xl">
                        You are supervising students from **{user.collegeName || "your college"}**. 
                        Interns who use your HOD email (**{user.email}**) during registration will appear in your records. 
                        Monitor task completion, check attendance logs, and review progress reports from your dedicated portal.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <a href="/hod/students" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all shadow-primary/20">
                            My Students
                        </a>
                        <a href="/hod/attendance" className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            Attendance Logs
                        </a>
                    </div>
                </div>
            </div>
            </div>
        </AppLayout>
    );
}
