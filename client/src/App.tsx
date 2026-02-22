import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Tasks from "@/pages/Tasks";
import DailyLogs from "@/pages/DailyLogs";
import LeaveRequests from "@/pages/LeaveRequests";
import Resources from "@/pages/Resources";
import Announcements from "@/pages/Announcements";
import InternMentorship from "@/pages/InternMentorship";
import InternSyllabus from "@/pages/InternSyllabus";
import InternSessions from "@/pages/InternSessions";
import AdminInterns from "@/pages/AdminInterns";
import AdminTasks from "@/pages/AdminTasks";
import AdminSyllabus from "@/pages/AdminSyllabus";
import AdminMentorship from "@/pages/AdminMentorship";
import AdminDiary from "@/pages/AdminDiary";
import AdminAttendance from "@/pages/AdminAttendance";
import AdminSessions from "@/pages/AdminSessions";
import AdminAnnouncements from "@/pages/AdminAnnouncements";
import AdminResources from "@/pages/AdminResources";
import AdminPaidInternship from "@/pages/AdminPaidInternship";
import SuperAdmin from "@/pages/SuperAdmin";
import NotFound from "@/pages/not-found";

function Router() {
    return (
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
            <Route path="/admin/super-admin" component={SuperAdmin} />

            <Route component={NotFound} />
        </Switch>
    );
}

import { ChatAssistant } from "@/components/ChatAssistant";

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router />
            <Toaster />
            <ChatAssistant />
        </QueryClientProvider>
    );
}

export default App;
