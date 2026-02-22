import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeaveRequestSchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ClipboardList, Info } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function LeaveRequests() {
    const { toast } = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const { data: requests, isLoading } = useQuery({
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
        mutationFn: async (data: any) => {
            return await apiRequest("POST", "/api/leaves", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/leaves`] });
            toast({ title: "Success", description: "Leave request submitted" });
            form.reset();
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case "rejected": return "text-red-500 bg-red-500/10 border-red-500/20";
            default: return "text-primary bg-primary/10 border-primary/20";
        }
    };

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
                        <p className="text-muted-foreground mt-1">Apply for leave and track status.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-1 h-fit glass border-white/20 shadow-xl">
                            <CardHeader className="border-b border-white/10 pb-6">
                                <CardTitle className="flex items-center gap-3 text-xl font-black">
                                    <div className="p-2 rounded-xl bg-primary/10">
                                        <ClipboardList className="h-5 w-5 text-primary" />
                                    </div>
                                    Apply for Leave
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Start Date</Label>
                                        <Input {...form.register("startDate")} type="date" className="bg-white/5 border-white/10 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">End Date</Label>
                                        <Input {...form.register("endDate")} type="date" className="bg-white/5 border-white/10 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reason for Leave</Label>
                                        <textarea
                                            {...form.register("reason")}
                                            className="w-full min-h-[120px] p-4 rounded-xl border bg-white/5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                            placeholder="Please describe the reason for your leave..."
                                        />
                                    </div>
                                    <Button className="w-full font-bold h-11 rounded-xl shadow-lg shadow-primary/20" disabled={mutation.isPending}>
                                        {mutation.isPending ? "Submitting..." : "Submit Request"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-xl font-bold">My Requests</h3>
                            {isLoading ? (
                                <p>Loading requests...</p>
                            ) : ((requests as any[]) || []).filter((r: any) => r.userId === user.id).length === 0 ? (
                                <p className="text-sm text-muted-foreground py-12 text-center border rounded-xl border-dashed">
                                    No leave requests yet.
                                </p>
                            ) : (
                                ((requests as any[]) || []).filter((r: any) => r.userId === user.id).map((req: any) => (
                                    <Card key={req.id} className="glass border-white/10 hover:shadow-lg transition-all duration-300">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                            <CalendarIcon className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-lg leading-none">
                                                                {format(new Date(req.startDate), "MMM dd")} - {format(new Date(req.endDate), "MMM dd, yyyy")}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Leave Period</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3">
                                                        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                                        <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">"{req.reason}"</p>
                                                    </div>
                                                </div>
                                                <div className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border shadow-sm ${getStatusColor(req.status)}`}>
                                                    {req.status}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
