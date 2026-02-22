import React from "react";

interface LogoProps {
    className?: string;
    variant?: "expertpedia" | "learnersbyte"; // Keeping these for consistency but both will use the provided image
}

export function Logo({
    className = "h-8",
    variant = "expertpedia"
}: LogoProps) {
    // Point to the official logo file that the user will upload to the public folder
    // We use a relative path from the root of the web server
    const logoPath = "/logo.png";

    return (
        <div className={`flex items-center ${className}`}>
            <img
                src={logoPath}
                alt={variant === "expertpedia" ? "ExpertPedia AI" : "Learners Byte"}
                className="h-full w-auto object-contain"
                onError={(e) => {
                    // Fallback to text if the image isn't found yet
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                        const span = document.createElement('span');
                        span.className = "text-sm font-black uppercase tracking-widest text-[#0A3DFF]";
                        span.innerText = variant === "expertpedia" ? "ExpertPedia AI" : "Learners Byte";
                        parent.appendChild(span);
                    }
                }}
            />
        </div>
    );
}
