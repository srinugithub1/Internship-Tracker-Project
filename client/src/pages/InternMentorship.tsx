import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { MessageSquare, Sparkles, Send, Clock, CheckCircle, ChevronDown, HelpCircle } from "lucide-react";

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
        <AppLayout>
            <div className="space-y-6">
                {/* Standardized Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Support</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Mentorship Hub</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Connect with mentors and accelerate your growth.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ── LEFT: Request Form ── */}
                    <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden h-fit">
                        <div className="flex items-center gap-4 p-5 border-b border-white/10 bg-white/5">
                            <div className="bg-primary/20 rounded-xl p-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Request Mentor</h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Submit a new mentorship query</p>
                            </div>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Request Type */}
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5 ml-1">
                                    <Sparkles className="h-3 w-3 text-primary" /> Request Type
                                </label>
                                <div className="relative">
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
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
                                <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5 ml-1">
                                    <Send className="h-3 w-3 text-primary" /> Description
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="Explain what you need help with..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black text-sm shadow-lg shadow-primary/20 gap-2 uppercase tracking-widest"
                                onClick={handleSubmit}
                                disabled={mutation.isPending}
                            >
                                <Send className="h-4 w-4" />
                                {mutation.isPending ? "Sending..." : "Submit Request"}
                            </Button>
                        </div>
                    </div>

                    {/* ── RIGHT: My Requests ── */}
                    <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-[600px]">
                        <div className="flex items-center justify-between gap-4 p-5 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 rounded-xl p-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-foreground uppercase tracking-wider">My Requests</h2>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Track your history</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
                                {requests.length} total
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {isLoading && (
                                <p className="text-center py-12 text-muted-foreground text-[10px] animate-pulse uppercase font-black tracking-widest">
                                    Loading history...
                                </p>
                            )}

                            {!isLoading && requests.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Requests Yet</p>
                                    </div>
                                </div>
                            )}

                            {requests.map((req: any) => (
                                <div
                                    key={req.id}
                                    className={`rounded-2xl border p-4 transition-all ${req.status === "replied"
                                            ? "border-emerald-500/20 bg-emerald-500/5 shadow-sm"
                                            : "border-white/5 bg-white/[0.02]"
                                        }`}
                                >
                                    {/* Header row */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 tracking-widest">
                                            {TYPE_LABELS[req.type] || req.type}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {req.status === "replied" ? (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 tracking-widest">
                                                    <CheckCircle className="h-2.5 w-2.5" /> Replied
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest">
                                                    <Clock className="h-2.5 w-2.5" /> Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Request Description */}
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-3">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 opacity-60">Your Query</p>
                                        <p className="text-xs font-medium leading-relaxed text-foreground">"{req.description}"</p>
                                    </div>

                                    {/* Mentor Reply */}
                                    {req.reply && (
                                        <div className="bg-primary/10 rounded-xl p-3 border border-primary/20 relative mt-4">
                                            <div className="absolute -top-2.5 left-3 px-2 bg-background border border-primary/20 rounded text-[8px] font-black text-primary uppercase tracking-widest">
                                                💬 Mentor Reply
                                            </div>
                                            <p className="text-xs font-bold leading-relaxed text-foreground mt-1">{req.reply}</p>
                                        </div>
                                    )}

                                    {/* Footer Date */}
                                    <div className="mt-3 text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {req.createdAt ? format(new Date(req.createdAt), "MMM dd, yyyy · hh:mm a") : ""}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
