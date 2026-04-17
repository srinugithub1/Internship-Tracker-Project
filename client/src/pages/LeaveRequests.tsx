import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeaveRequestSchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, ClipboardList, Info, AlertCircle, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function LeaveRequests() {
    const { toast } = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const { data: requests = [], isLoading } = useQuery<any[]>({
        queryKey: [`/api/leaves`],
    });

    const form = useForm({
        resolver: zodResolver(insertLeaveRequestSchema),
        defaultValues: {
            userId: user.id,
            startDate: format(new Date(), "yyyy-MM-dd"),
            endDate: format(new Date(), "yyyy-MM-dd"),
            reason: "",
        },
    });

    const mutation = useMutation({
        mutationFn: (data: any) => apiRequest("POST", "/api/leaves", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/leaves`] });
            toast({ title: "Request Sent", description: "Your leave application is under review." });
            form.reset();
        },
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "approved": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case "rejected": return "text-red-500 bg-red-500/10 border-red-500/20";
            default: return "text-primary bg-primary/10 border-primary/20";
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Standardized Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <ClipboardList className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Applications</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest">Leave Requests</h1>
                        <p className="text-muted-foreground mt-0.5 text-xs font-medium">Request time off and track your approval status.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* ── LEFT: Application Form ── */}
                    <div className="lg:col-span-4 glass rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center gap-3">
                            <div className="p-1.5 bg-primary/20 rounded-lg text-primary">
                                <PlusIcon className="h-3.5 w-3.5" />
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-widest">New Application</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            <Calendar className="h-3 w-3 text-primary" /> Start Date
                                        </Label>
                                        <Input {...form.register("startDate")} type="date" className="bg-white/5 border-white/10 rounded-xl px-4 h-10 text-xs font-medium" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            <Calendar className="h-3 w-3 text-primary" /> End Date
                                        </Label>
                                        <Input {...form.register("endDate")} type="date" className="bg-white/5 border-white/10 rounded-xl px-4 h-10 text-xs font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Justification</Label>
                                    <textarea
                                        {...form.register("reason")}
                                        className="w-full min-h-[100px] p-4 rounded-xl border border-white/10 bg-white/5 text-xs font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                                        placeholder="Reason for your leave request..."
                                    />
                                </div>
                                <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-black text-[10px] shadow-lg shadow-primary/20 uppercase tracking-widest" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Persisting..." : "Submit Application"}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* ── RIGHT: Request Timeline ── */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">My Request History</h3>
                        </div>
                        
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 animate-pulse opacity-40">
                                    <Clock className="h-10 w-10 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Validating history...</p>
                                </div>
                            ) : requests.filter((r: any) => r.userId === user.id).length === 0 ? (
                                <div className="text-center py-20 glass rounded-2xl border border-dashed border-white/10 opacity-30">
                                    <AlertCircle className="h-10 w-10 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Records</p>
                                </div>
                            ) : (
                                requests.filter((r: any) => r.userId === user.id).map((req: any) => (
                                    <div key={req.id} className="glass rounded-2xl border border-white/10 overflow-hidden group hover:border-primary/20 transition-all">
                                        <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-5">
                                            <div className="flex-1 space-y-4 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-black text-sm text-foreground uppercase tracking-tight tabular-nums truncate">
                                                            {format(new Date(req.startDate), "MMM dd")} — {format(new Date(req.endDate), "MMM dd, yyyy")}
                                                        </h4>
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">Leave Duration</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex gap-3 italic">
                                                    <Info className="h-3.5 w-3.5 text-primary/40 shrink-0 mt-0.5" />
                                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed line-clamp-2">"{req.reason}"</p>
                                                </div>
                                            </div>
                                            
                                            <div className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm self-start sm:self-center shrink-0 ${getStatusStyles(req.status)}`}>
                                                {req.status}
                                            </div>
                                        </div>
                                        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
