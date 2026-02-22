import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { MessageSquare, Sparkles, Send, Clock, CheckCircle, ChevronDown } from "lucide-react";

const REQUEST_TYPES = [
    { value: "technical", label: "Technical Support" },
    { value: "hr", label: "HR & Admin" },
    { value: "project", label: "Project Review" },
    { value: "career", label: "Career Advice" },
    { value: "code_review", label: "Code Review" },
    { value: "general", label: "General Query" },
];

const TYPE_LABELS: Record<string, string> = {
    technical: "Technical Support",
    hr: "HR & Admin",
    project: "Project Review",
    career: "Career Advice",
    code_review: "Code Review",
    general: "General Query",
};

export default function InternMentorship() {
    const { toast } = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [type, setType] = useState("technical");
    const [description, setDescription] = useState("");

    // ✅ FIXED: use query param ?userId= instead of path param /:id
    const queryKey = `/api/mentorship?userId=${user.id}`;
    const { data: requests = [], isLoading } = useQuery<any[]>({
        queryKey: [queryKey],
    });

    const mutation = useMutation({
        mutationFn: () =>
            apiRequest("POST", "/api/mentorship", {
                internId: user.id,
                type,
                description,
                status: "pending",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            toast({ title: "Request Sent ✅", description: "Your mentor will reply shortly." });
            setDescription("");
            setType("technical");
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.message || "Failed to send request.", variant: "destructive" });
        },
    });

    const handleSubmit = () => {
        if (!description.trim()) {
            toast({ title: "Required", description: "Please describe your query.", variant: "destructive" });
            return;
        }
        mutation.mutate();
    };

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">

                    {/* Banner */}
                    <div className="mb-8 rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-8 flex items-center gap-5 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-64 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                        <div className="absolute right-8 top-4 h-32 w-32 rounded-full bg-white/10 pointer-events-none" />
                        <div className="absolute right-24 bottom-4 h-20 w-20 rounded-full bg-white/5 pointer-events-none" />
                        <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                            <MessageSquare className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Mentorship Hub</h1>
                            <p className="text-white/70 text-sm mt-1 font-medium">Connect with mentors and accelerate your growth</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* ── LEFT: Request Form ── */}
                        <div className="glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden h-fit">
                            <div className="flex items-center gap-4 p-6 border-b border-white/10">
                                <div className="bg-violet-500/20 rounded-xl p-2.5">
                                    <MessageSquare className="h-5 w-5 text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-foreground">Request Mentor</h2>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Submit a new mentorship request</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Request Type */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                                        ≡ Request Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all cursor-pointer"
                                        >
                                            {REQUEST_TYPES.map((t) => (
                                                <option key={t.value} value={t.value} className="bg-background">
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                                        ✍ Description
                                    </label>
                                    <textarea
                                        rows={6}
                                        placeholder="Explain what you need help with..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none transition-all"
                                    />
                                </div>

                                {/* Submit */}
                                <Button
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 font-black text-base shadow-xl shadow-violet-500/30 gap-2"
                                    onClick={handleSubmit}
                                    disabled={mutation.isPending}
                                >
                                    <Send className="h-4 w-4" />
                                    {mutation.isPending ? "Sending..." : "Submit Request"}
                                </Button>
                            </div>
                        </div>

                        {/* ── RIGHT: My Requests ── */}
                        <div className="glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between gap-4 p-6 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-fuchsia-500/20 rounded-xl p-2.5">
                                        <Sparkles className="h-5 w-5 text-fuchsia-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground">My Requests</h2>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Track your mentorship requests</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                    {requests.length} total
                                </span>
                            </div>

                            <div className="overflow-y-auto max-h-[65vh] p-4 space-y-3">
                                {isLoading && (
                                    <p className="text-center py-12 text-muted-foreground text-xs animate-pulse uppercase font-black tracking-widest">
                                        Loading requests...
                                    </p>
                                )}

                                {!isLoading && requests.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="bg-violet-500/10 rounded-full p-6">
                                            <MessageSquare className="h-10 w-10 text-violet-400/50" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-muted-foreground">No Requests Yet</p>
                                            <p className="text-xs text-muted-foreground/60 mt-1">
                                                Start by submitting your first mentorship<br />request on the left
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {requests.map((req: any) => (
                                    <div
                                        key={req.id}
                                        className={`rounded-2xl border p-4 transition-all ${req.status === "replied"
                                                ? "border-emerald-500/20 bg-emerald-500/5"
                                                : "border-white/10 bg-white/5"
                                            }`}
                                    >
                                        {/* Header row */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-violet-500/15 text-violet-400 rounded border border-violet-500/20">
                                                    {TYPE_LABELS[req.type] || req.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {req.status === "replied" ? (
                                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle className="h-2.5 w-2.5" /> Replied
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                        <Clock className="h-2.5 w-2.5" /> Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Request Description */}
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-3">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Your Query</p>
                                            <p className="text-sm font-medium leading-relaxed text-foreground">"{req.description}"</p>
                                        </div>

                                        {/* Date */}
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">
                                            📅 {req.createdAt ? format(new Date(req.createdAt), "MMM dd, yyyy 'at' h:mm a") : ""}
                                        </p>

                                        {/* Mentor Reply */}
                                        {req.reply && (
                                            <div className="bg-violet-500/10 rounded-xl p-3 border border-violet-500/20 relative mt-2">
                                                <div className="absolute -top-2.5 left-3 px-2 bg-background border border-violet-500/20 rounded text-[9px] font-black text-violet-400 uppercase tracking-widest">
                                                    💬 Mentor Reply
                                                </div>
                                                <p className="text-sm font-bold leading-relaxed text-foreground mt-1">{req.reply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
