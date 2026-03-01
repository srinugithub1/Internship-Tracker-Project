-- Database Schema for Internship Tracker

-- Users Table (Admins and Interns)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'intern', -- 'admin', 'super_admin', 'intern'
    phone TEXT,
    college_name TEXT,
    roll_number TEXT,
    address TEXT,
    start_date DATE,
    end_date DATE,
    team_lead_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions Table (for login/logout tracking)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Attendance Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    login_time TIMESTAMPTZ DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    status TEXT, -- 'present', 'absent', 'half-day'
    date DATE DEFAULT CURRENT_DATE,
    working_hours DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID REFERENCES users(id), -- Nullable for unassigned tasks
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed'
    due_date DATE,
    priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
    reassignable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Daily Logs Table
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    log_date DATE DEFAULT CURRENT_DATE,
    work_description TEXT,
    hours_spent DECIMAL(5, 2),
    course TEXT,
    module TEXT,
    topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Requests Table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements Table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources Table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    link TEXT,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class Session Links Table
CREATE TABLE session_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda TEXT,
    session_date DATE,
    start_time TIME,
    end_time TIME,
    session_url TEXT,
    speaker TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
