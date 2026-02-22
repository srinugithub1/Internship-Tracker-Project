import React from "react";

interface LogoProps {
    className?: string;
    variant?: "expertpedia" | "learnersbyte";
    type?: "full" | "icon";
    color?: "primary" | "white" | "dark";
}

export function Logo({
    className = "h-8",
    variant = "expertpedia",
    type = "full",
    color = "primary"
}: LogoProps) {

    if (variant === "expertpedia") {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {/* ExpertPedia Icon Part */}
                <svg
                    viewBox="0 0 100 100"
                    className="h-full w-auto"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10ZM50 82C32.3269 82 18 67.6731 18 50C18 32.3269 32.3269 18 50 18C67.6731 18 82 32.3269 82 50C82 67.6731 67.6731 82 50 82Z"
                        fill={color === 'white' ? 'white' : '#0A3DFF'}
                    />
                    <path
                        d="M50 30L35 45H45V70H55V45H65L50 30Z"
                        fill={color === 'white' ? 'white' : '#0A3DFF'}
                    />
                    <rect x="70" y="45" width="15" height="10" rx="2" fill="#FF00FF" fillOpacity="0.5" />
                    <circle cx="25" cy="45" r="5" fill="#00FFFF" fillOpacity="0.5" />
                </svg>

                {type === "full" && (
                    <span className={`text-[1.1em] font-black tracking-tighter ${color === 'white' ? 'text-white' : 'text-slate-900'
                        }`}>
                        <span className={color === 'white' ? 'text-white' : 'text-[#0A3DFF]'}>Expert</span>Pedia AI
                    </span>
                )}
            </div>
        );
    }

    // Learners Byte Variant
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Learners Byte Icon Part (B in square style as seen in screenshot) */}
            <div className={`aspect-square h-full flex items-center justify-center rounded-sm border-2 ${color === 'white' ? 'border-white/40' : 'border-emerald-500/40'
                } relative overflow-hidden p-1`}>
                <div className={`absolute -top-1 -right-1 w-2 h-2 ${color === 'white' ? 'bg-white' : 'bg-emerald-500'} rounded-full`}></div>
                <div className={`absolute -bottom-1 -left-1 w-2 h-2 ${color === 'white' ? 'bg-white' : 'bg-emerald-500'} rounded-full`}></div>
                <span className={`text-[1.2em] font-black leading-none ${color === 'white' ? 'text-white' : 'text-emerald-500'}`}>B</span>
            </div>

            {type === "full" && (
                <div className="flex flex-col -gap-1">
                    <span className={`text-[0.9em] font-black leading-none tracking-tight ${color === 'white' ? 'text-white' : 'text-slate-400'
                        }`}>LEARNERS</span>
                    <span className={`text-[1.1em] font-black leading-none tracking-tight ${color === 'white' ? 'text-white' : 'text-emerald-500'
                        }`}>BYTE</span>
                </div>
            )}
        </div>
    );
}
