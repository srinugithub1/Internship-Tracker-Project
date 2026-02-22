import React from "react";

interface LogoProps {
    className?: string;
    variant?: "expertpedia" | "learnersbyte";
}

export function Logo({
    className = "h-8",
    variant = "expertpedia"
}: LogoProps) {
    // Path to the official logo file uploaded by the user
    const logoPath = "/learners%20byte%20expertpedia.jpg";

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
