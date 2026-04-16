import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { Search, ChevronRight, Activity, Mail, Phone, Hash } from "lucide-react";
import { useState } from "react";

export default function HODStudents() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [user] = useState(storedUser);
    const [search, setSearch] = useState("");

    const { data: interns = [], isLoading } = useQuery<User[]>({
        queryKey: ["/api/hod/students", user.email],
        queryFn: async () => {
            const res = await fetch(`/api/hod/students?hodEmail=${user.email}`);
            if (!res.ok) throw new Error("Failed to fetch supervised students");
            return res.json();
        },
        enabled: !!user.email
    });

    const filtered = interns.filter(i => 
        i.name.toLowerCase().includes(search.toLowerCase()) || 
        i.email.toLowerCase().includes(search.toLowerCase()) ||
        (i.rollNumber || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-[1200px] mx-auto space-y-8">
                    <header className="flex justify-between items-end animate-in fade-in slide-in-from-left duration-700">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                My Students
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-medium">
                                Tracking {interns.length} interns from {user.collegeName || "your department"}.
                            </p>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/5">
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Total Supervised</span>
                            <span className="text-2xl font-black text-primary">{interns.length}</span>
                        </div>
                    </header>

                    <div className="flex gap-4 items-center p-5 glass rounded-2xl border-white/10 shadow-xl">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, email or roll number..." 
                                className="pl-9 h-11 bg-white/5 border-white/10 rounded-xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="glass h-64 rounded-3xl border-white/10 animate-pulse bg-white/5" />
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center glass rounded-3xl border-white/10 border-dashed">
                                <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                <p className="text-muted-foreground font-bold">No students found matching your criteria.</p>
                            </div>
                        ) : filtered.map((intern, i) => (
                            <div 
                                key={intern.id}
                                className="glass p-6 rounded-3xl border-white/10 shadow-xl hover:scale-[1.02] transition-all group animate-in fade-in zoom-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-xl border border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        {intern.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-lg truncate">{intern.name}</h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-2 py-0.5 bg-primary/10 rounded-full">
                                            {intern.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold">
                                        <Hash className="h-4 w-4 text-primary" />
                                        <span>{intern.rollNumber || "No ID"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <span className="truncate">{intern.email}</span>
                                    </div>
                                    
                                    {/* Work Progress Section */}
                                    <div className="pt-4 space-y-2 mt-2 border-t border-white/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Work Progress</span>
                                            <span className="text-[10px] font-black text-primary">{(intern as any).completedTasks || 0} / {(intern as any).totalTasks || 0} Tasks</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${
                                                    ((intern as any).progress || 0) > 70 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                                                    ((intern as any).progress || 0) > 30 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
                                                    'bg-muted shadow-none'
                                                }`}
                                                style={{ width: `${(intern as any).progress || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-green-500" />
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Intern</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
