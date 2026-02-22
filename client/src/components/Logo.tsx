import React from "react";

interface LogoProps {
    className?: string;
    variant?: "expertpedia" | "learnersbyte";
}

export function Logo({
    className = "h-8",
    variant = "expertpedia"
}: LogoProps) {
    // Point to a single full branding image as requested
    // This will try to load /logo.png from the public folder
    const logoPath = "/logo.png";

    return (
        <div className={`flex items-center ${className}`}>
            <img
                src={logoPath}
                alt="Learners Byte | ExpertPedia AI"
                className="h-full w-auto object-contain"
                // If image is missing, we show an empty div instead of broken text fallback to avoid "separation" of branding
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
}
