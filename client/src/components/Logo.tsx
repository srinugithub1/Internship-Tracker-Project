import React from "react";

interface LogoProps {
    className?: string;
    variant?: "expertpedia" | "learnersbyte";
}

export function Logo({
    className = "h-8",
    variant = "expertpedia"
}: LogoProps) {
    // Point to the official logo file that you will upload to the public folder
    const logoPath = "/logo.png";

    return (
        <div className={`flex items-center ${className}`}>
            <img
                src={logoPath}
                alt="Official Logo"
                className="h-full w-auto object-contain"
                onError={(e) => {
                    // If image is missing, we show nothing (to avoid showing a broken link icon)
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
}
