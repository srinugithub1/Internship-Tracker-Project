import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import {
    CircleHelp,
    AlertCircle,
    LogIn,
    UserCircle,
    CalendarCheck,
    ClipboardList,
    ShieldCheck,
    XCircle,
    CheckCircle2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast-internal";

interface InstructionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
}

export function InstructionModal({ open, onOpenChange, userId }: InstructionModalProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleClose = async () => {
        if (dontShowAgain) {
            setLoading(true);
            try {
                await apiRequest("POST", "/api/intern/update-popup-preference", {
                    userId,
                    show: false
                });
                // Update local storage to reflect the change immediately
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    user.showInstructionsPopup = false;
                    localStorage.setItem("user", JSON.stringify(user));
                }
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: "Unable to save preference. Please try again.",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }
        }
        onOpenChange(false);
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={(v: boolean) => { if (!loading) onOpenChange(v); }}>
            <DialogContent className="max-w-3xl h-[85vh] p-0 overflow-hidden flex flex-col bg-white border-none shadow-2xl rounded-[2rem]">
                {/* Header with Logos */}
                <DialogHeader className="p-8 bg-white border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <Logo className="h-12" />
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <span className="text-[#0A3DFF] font-black text-xl italic tracking-tighter">ExpertPedia</span>
                            <div className="bg-[#0A3DFF] p-1 rounded-md">
                                <ShieldCheck className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>
                    <DialogTitle className="text-3xl md:text-4xl font-extrabold text-[#0A3DFF] text-center tracking-tight">
                        Student User Instruction Manual
                    </DialogTitle>
                </DialogHeader>

                {/* Body Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Introduction */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0A3DFF]">
                                <CircleHelp className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Introduction</h3>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed pl-1">
                            This Internship Training Portal is your official platform for attendance, tasks, online sessions, and performance tracking. All activities are monitored for accuracy and discipline.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Signup Instructions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Signup Instructions (Critical)</h3>
                            </div>
                            <ul className="space-y-3 pl-1">
                                {[
                                    "Use the same email ID registered in the VTU Portal.",
                                    "Different emails will not be approved.",
                                    "Duplicate emails are strictly prohibited."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-600 font-semibold text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#0A3DFF] mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mt-4">
                                <p className="text-sm font-bold text-[#0A3DFF] leading-relaxed">
                                    <span className="font-black underline decoration-2 underline-offset-4">Important:</span> If your email is not registered in the VTU Portal for this program, you cannot sign up in this Internship Portal.
                                </p>
                            </div>
                        </div>

                        {/* Login Instructions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0A3DFF]">
                                    <LogIn className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Login Instructions</h3>
                            </div>
                            <ul className="space-y-3 pl-1">
                                {[
                                    "Use your registered email ID and password.",
                                    "If issues persist, contact support."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-600 font-semibold text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#0A3DFF] mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Profile Instructions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0A3DFF]">
                                    <UserCircle className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Profile Instructions</h3>
                            </div>
                            <ul className="space-y-3 pl-1">
                                {[
                                    "Update your profile immediately after first login.",
                                    "Email ID cannot be changed once registered."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-600 font-semibold text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#0A3DFF] mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Attendance Rules */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0A3DFF]">
                                    <CalendarCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Attendance Rules</h3>
                            </div>
                            <ul className="space-y-3 pl-1">
                                {[
                                    "Daily Clock IN when you start work.",
                                    "Daily Clock Out when you finish work."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-600 font-semibold text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#0A3DFF] mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Task & Assignment Rules */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0A3DFF]">
                                    <ClipboardList className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Task & Assignment Rules</h3>
                            </div>
                            <ul className="space-y-3 pl-1">
                                {[
                                    "Check \"Recent Tasks\" daily.",
                                    "Submit assignments before deadlines."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-600 font-semibold text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#0A3DFF] mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* DO's and DON'Ts */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">DO’s and DON’Ts</h3>
                            </div>
                            <ul className="space-y-3 pl-1">
                                {[
                                    "Share your login credentials.",
                                    "Register with a different email.",
                                    "Create duplicate accounts.",
                                    "Fake attendance or time entries.",
                                    "Submit copied work."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-600 font-semibold text-sm">
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-start gap-4">
                        <CheckCircle2 className="h-6 w-6 text-[#0A3DFF] shrink-0" />
                        <div className="space-y-4 w-full">
                            <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                By signing up and using this portal, you confirm that you have registered through the VTU Portal using the same email and agree to follow all internship guidelines.
                            </p>
                            <p className="text-right text-[#0A3DFF] font-black italic">
                                Regards, Learners Byte Team
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Preference */}
                <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex flex-row items-center justify-between sm:justify-between flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="dontShow"
                            checked={dontShowAgain}
                            onCheckedChange={(v: boolean | "indeterminate") => setDontShowAgain(!!v)}
                            className="h-5 w-5 border-slate-300 data-[state=checked]:bg-[#0A3DFF]"
                        />
                        <label
                            htmlFor="dontShow"
                            className="text-sm font-bold text-slate-600 cursor-pointer select-none"
                        >
                            Don't show me again
                        </label>
                    </div>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        className="bg-[#0A3DFF] hover:bg-[#0835CC] text-white px-10 h-12 rounded-xl font-black shadow-lg shadow-[#0A3DFF]/20 transition-all uppercase tracking-widest text-xs"
                    >
                        {loading ? "Saving..." : "Close & Continue"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
