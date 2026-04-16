import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { Users, CheckSquare, Clock, TrendingUp } from "lucide-react";
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
            description: "Total interns under your supervision"
        },
        { 
            title: "Task Completion", 
            value: `${stats?.completionRate || 0}%`, 
            icon: TrendingUp, 
            color: "text-green-500", 
            bg: "bg-green-500/10",
            description: "Overall productivity of your department"
        },
        { 
            title: "Submitted Tasks", 
            value: `${stats?.completedTasks || 0} / ${stats?.totalTasks || 0}`, 
            icon: CheckSquare, 
            color: "text-purple-500", 
            bg: "bg-purple-500/10",
            description: "Tasks marked as completed by interns"
        },
        { 
            title: "Active Today", 
            value: "Live", 
            icon: Clock, 
            color: "text-orange-500", 
            bg: "bg-orange-500/10",
            description: "Students currently clocked in"
        }
    ];

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1200px] mx-auto space-y-8">
                    <header className="animate-in fade-in slide-in-from-left duration-700">
                        <h1 className="text-4xl font-black tracking-tight text-foreground">
                            HOD Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg font-medium">
                            Welcome, {user.name}. Monitoring department progress for {user.collegeName || "your institution"}.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((card, i) => (
                            <div 
                                key={card.title} 
                                className="glass p-6 rounded-3xl border-white/10 shadow-xl hover:scale-[1.02] transition-all duration-300 animate-in fade-in zoom-in"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${card.bg}`}>
                                        <card.icon className={`h-6 w-6 ${card.color}`} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black mb-1">{isLoading ? "..." : card.value}</h3>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                                        {card.title}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="glass p-8 rounded-3xl border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck className="h-32 w-32" />
                            </div>
                            <h2 className="text-2xl font-black mb-4">Department Overview</h2>
                            <p className="text-muted-foreground max-w-2xl leading-relaxed">
                                You are currently supervising students from **{user.collegeName || "your college"}**. 
                                Interns who register and enter your HOD email (**{user.email}**) will automatically appear in your record list. 
                                You can monitor their task completion, check their daily attendance, and review their progress reports.
                            </p>
                            <div className="mt-8 flex gap-4">
                                <a href="/hod/students" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                                    View My Students
                                </a>
                                <a href="/hod/attendance" className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
                                    Attendance Logs
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

import { ShieldCheck } from "lucide-react";
