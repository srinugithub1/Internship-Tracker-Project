import React from "react";

interface LogoProps {
    className?: string;
    variant?: "expertpedia" | "learnersbyte";
}

export function Logo({
    className = "h-8",
    variant = "expertpedia"
}: LogoProps) {

    if (variant === "expertpedia") {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                {/* ExpertPedia High-Fidelity SVG Reconstruction based on user image */}
                <div className="flex items-center gap-3 group">
                    <div className="relative h-full aspect-square flex items-center justify-center">
                        <svg
                            viewBox="0 0 100 100"
                            className="h-full w-auto"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Brain/Head Contour with Wi-Fi signal style as seen in their logo */}
                            <path
                                d="M45 20C45 20 65 20 75 35C85 50 85 70 75 85C65 100 45 100 45 100V20Z"
                                fill="#0A3DFF"
                            />
                            <path
                                d="M40 30C40 30 55 30 62 40C69 50 69 65 62 75C55 85 40 85 40 85V30Z"
                                fill="white"
                                fillOpacity="0.3"
                            />
                            <path
                                d="M45 45C48 45 50 47 50 50C50 53 48 55 45 55V45Z"
                                fill="white"
                            />
                            {/* WiFi/AI Waves */}
                            <circle cx="45" cy="50" r="35" stroke="#0A3DFF" strokeWidth="4" strokeDasharray="10 160" transform="rotate(-45 45 50)" />
                            <circle cx="45" cy="50" r="25" stroke="#0A3DFF" strokeWidth="4" strokeDasharray="8 120" transform="rotate(-45 45 50)" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[24px] font-black tracking-tighter leading-none flex items-center mb-0.5">
                            <span className="text-[#0A3DFF]">Expert</span>
                            <span className="text-[#D946EF]">Pedia</span>
                        </h1>
                        <span className="text-[12px] font-bold text-[#0A3DFF] uppercase tracking-[0.2em] leading-none text-right">ai</span>
                    </div>
                </div>
            </div>
        );
    }

    // Learners Byte Variant
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="bg-[#0D1117] p-2 rounded-sm border border-emerald-500/20 flex items-center gap-2">
                <div className="h-8 w-8 border-2 border-emerald-400 rounded-sm relative flex items-center justify-center p-1">
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full" />
                    <span className="text-white font-black text-xl leading-none">B</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-400/80 tracking-[0.2em] leading-none mb-0.5 uppercase">Learners</span>
                    <span className="text-[14px] font-black text-white tracking-widest leading-none uppercase">Byte</span>
                </div>
            </div>
        </div>
    );
}
