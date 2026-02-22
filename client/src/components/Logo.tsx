import React from "react";

interface LogoProps {
    className?: string;
    variant?: "expertpedia" | "learnersbyte";
}

export function Logo({
    className = "h-8",
    variant = "expertpedia"
}: LogoProps) {

    // High-fidelity ExpertPedia AI reconstruction
    const ExpertPediaLogo = () => (
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                    {/* AI Head/Profile Silhouette */}
                    <path d="M30 85 V45 C30 30 45 20 60 20 C75 20 85 35 85 55 C85 75 75 85 60 85 H30 Z" fill="#0A3DFF" />
                    {/* Signal Waves (WiFi style) */}
                    <circle cx="60" cy="20" r="10" stroke="#0A3DFF" strokeWidth="3" fill="none" opacity="0.6" />
                    <circle cx="60" cy="20" r="18" stroke="#0A3DFF" strokeWidth="3" fill="none" opacity="0.4" />
                    <circle cx="60" cy="20" r="26" stroke="#0A3DFF" strokeWidth="3" fill="none" opacity="0.2" />
                    {/* Minimal facial detail */}
                    <rect x="40" y="45" width="4" height="4" rx="1" fill="white" />
                    <path d="M40 65 Q50 75 65 65" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
            </div>
            <div className="flex flex-col -gap-1">
                <div className="flex items-center">
                    <span className="text-[26px] font-black tracking-tighter text-[#0A3DFF]">Expert</span>
                    <span className="text-[26px] font-black tracking-tighter text-[#E10098]">Pedia</span>
                    <span className="text-[14px] font-black text-[#0A3DFF] ml-1 mt-auto pb-1 lowercase">ai</span>
                </div>
            </div>
        </div>
    );

    // High-fidelity Learners Byte reconstruction
    const LearnersByteLogo = () => (
        <div className="bg-[#0D1117] px-4 py-2 rounded flex items-center gap-3 border border-emerald-500/20">
            <div className="h-8 w-8 border-2 border-[#10B981] rounded-sm relative flex items-center justify-center p-1">
                {/* Decorative corner dots */}
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                <span className="text-white font-black text-xl">B</span>
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-[#94A3B8] tracking-[0.2em] mb-0.5 uppercase">LEARNERS</span>
                <span className="text-[18px] font-black text-[#10B981] tracking-tighter uppercase">BYTE</span>
            </div>
        </div>
    );

    return (
        <div className={`inline-flex items-center ${className} select-none pointer-events-none`}>
            {/* Always show the combined branding style as requested by "Full image" */}
            <div className="flex items-center gap-6">
                <LearnersByteLogo />
                <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
                <ExpertPediaLogo />
            </div>
        </div>
    );
}
