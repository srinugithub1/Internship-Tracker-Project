import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy Loaded Pages
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const DailyLogs = lazy(() => import("@/pages/DailyLogs"));
const LeaveRequests = lazy(() => import("@/pages/LeaveRequests"));
const Resources = lazy(() => import("@/pages/Resources"));
const Announcements = lazy(() => import("@/pages/Announcements"));
const InternMentorship = lazy(() => import("@/pages/InternMentorship"));
const InternSyllabus = lazy(() => import("@/pages/InternSyllabus"));
const InternSessions = lazy(() => import("@/pages/InternSessions"));
const AdminInterns = lazy(() => import("@/pages/AdminInterns"));
const AdminTasks = lazy(() => import("@/pages/AdminTasks"));
const AdminSyllabus = lazy(() => import("@/pages/AdminSyllabus"));
const AdminMentorship = lazy(() => import("@/pages/AdminMentorship"));
const AdminDiary = lazy(() => import("@/pages/AdminDiary"));
const AdminAttendance = lazy(() => import("@/pages/AdminAttendance"));
const AdminSessions = lazy(() => import("@/pages/AdminSessions"));
const AdminAnnouncements = lazy(() => import("@/pages/AdminAnnouncements"));
const AdminResources = lazy(() => import("@/pages/AdminResources"));
const AdminPaidInternship = lazy(() => import("@/pages/AdminPaidInternship"));
const AdminEvaluation = lazy(() => import("@/pages/AdminEvaluation"));
const EvaluationSheet = lazy(() => import("@/pages/EvaluationSheet"));
const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));
const HODDashboard = lazy(() => import("@/pages/HODDashboard"));
const HODStudents = lazy(() => import("@/pages/HODStudents"));
const HODAttendance = lazy(() => import("@/pages/HODAttendance"));
const HODEvaluations = lazy(() => import("@/pages/HODEvaluations"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Standardized Loading Fallback
function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] dark:bg-slate-950">
            <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute h-8 w-8 rounded-full border-4 border-primary/40 border-b-primary animate-spin-reverse" />
            </div>
            <p className="mt-6 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Interface...</p>
            <style>{`
                @keyframes spin-reverse {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                .animate-spin-reverse {
                    animation: spin-reverse 1.5s linear infinite;
                }
            `}</style>
        </div>
    );
}

function Router() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Switch>
                <Route path="/" component={LandingPage} />
                <Route path="/login">{() => <LoginPage initialTab="login" />}</Route>
                <Route path="/signup">{() => <LoginPage initialTab="signup" />}</Route>
                <Route path="/dashboard" component={Dashboard} />

                {/* Intern Routes */}
                <Route path="/attendance" component={Attendance} />
                <Route path="/tasks" component={Tasks} />
                <Route path="/logs" component={DailyLogs} />
                <Route path="/leaves" component={LeaveRequests} />
                <Route path="/resources" component={Resources} />
                <Route path="/announcements" component={Announcements} />
                <Route path="/mentorship" component={InternMentorship} />
                <Route path="/syllabus" component={InternSyllabus} />
                <Route path="/sessions" component={InternSessions} />
                <Route path="/evaluation-sheet" component={EvaluationSheet} />

                {/* Admin Routes */}
                <Route path="/admin/interns" component={AdminInterns} />
                <Route path="/admin/tasks" component={AdminTasks} />
                <Route path="/admin/mentorship" component={AdminMentorship} />
                <Route path="/admin/logs" component={AdminDiary} />
                <Route path="/admin/syllabus" component={AdminSyllabus} />
                <Route path="/admin/attendance" component={AdminAttendance} />
                <Route path="/admin/sessions" component={AdminSessions} />
                <Route path="/admin/announcements" component={AdminAnnouncements} />
                <Route path="/admin/resources" component={AdminResources} />
                <Route path="/admin/paid-internship" component={AdminPaidInternship} />
                <Route path="/admin/evaluation" component={AdminEvaluation} />
                <Route path="/admin/super-admin" component={SuperAdmin} />
                
                {/* HOD Routes */}
                <Route path="/hod/dashboard" component={HODDashboard} />
                <Route path="/hod/students" component={HODStudents} />
                <Route path="/hod/attendance" component={HODAttendance} />
                <Route path="/hod/evaluations" component={HODEvaluations} />

                <Route component={NotFound} />
            </Switch>
        </Suspense>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router />
            <Toaster />
        </QueryClientProvider>
    );
}

export default App;
