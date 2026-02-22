import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast-internal";
import { Megaphone, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAnnouncementSchema } from "@shared/schema";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

export default function Announcements() {
    const { toast } = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const { data: announcements, isLoading } = useQuery({
        queryKey: ["/api/announcements"],
    });

    const form = useForm({
        resolver: zodResolver(insertAnnouncementSchema),
        defaultValues: {
            message: "",
            type: "info",
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            return await apiRequest("POST", "/api/announcements", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
            toast({ title: "Success", description: "Announcement posted" });
            form.reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return await apiRequest("DELETE", `/api/announcements/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
            toast({ title: "Deleted", description: "Announcement removed" });
        },
    });

    return (
        <div className="flex bg-secondary/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Announcements</h1>
                            <p className="text-muted-foreground mt-1">Check the latest updates from the management.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {user.role === 'admin' && (
                            <Card className="lg:col-span-1 h-fit">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5 text-primary" /> Create New
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Announcement Message</Label>
                                            <textarea
                                                {...form.register("message")}
                                                className="w-full min-h-[120px] p-4 rounded-xl border bg-white/5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                                placeholder="Enter important update..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</Label>
                                            <select
                                                {...form.register("type")}
                                                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            >
                                                <option value="info" className="bg-background">Info</option>
                                                <option value="warning" className="bg-background">Warning</option>
                                                <option value="success" className="bg-background">Success</option>
                                                <option value="error" className="bg-background">Error</option>
                                            </select>
                                        </div>
                                        <Button className="w-full" disabled={mutation.isPending}>
                                            {mutation.isPending ? "Posting..." : "Post Announcement"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        <div className={user.role === 'admin' ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
                            <h3 className="text-xl font-bold">Recent Updates</h3>
                            {isLoading ? (
                                <p>Loading...</p>
                            ) : ((announcements as any[]) || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground py-12 text-center border rounded-xl border-dashed">
                                    No announcements yet.
                                </p>
                            ) : (
                                ((announcements as any[]) || []).map((ann: any) => (
                                    <Card key={ann.id} className="hover:shadow-md transition-all group">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${ann.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            ann.type === 'error' ? 'bg-red-500/10 text-red-500' :
                                                                ann.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                                                    'bg-primary/10 text-primary'
                                                            }`}>
                                                            <Megaphone className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                            {ann.type || "info"} Update
                                                        </span>
                                                    </div>
                                                    <p className="text-base font-medium leading-relaxed">{ann.message}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                        {format(new Date(ann.createdAt), "MMMM dd, yyyy • hh:mm a")}
                                                    </p>
                                                </div>
                                                {user.role === 'admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => deleteMutation.mutate(ann.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
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
