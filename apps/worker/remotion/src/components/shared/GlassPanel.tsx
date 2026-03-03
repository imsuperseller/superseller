import React from "react";

export const GlassPanel: React.FC<{
    accentColorRgb: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}> = ({ accentColorRgb, children, style }) => (
    <div
        style={{
            background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.08), rgba(255,255,255,0.03))`,
            border: `1px solid rgba(${accentColorRgb}, 0.15)`,
            borderRadius: 24,
            backdropFilter: "blur(12px)",
            boxShadow: `
                0 20px 60px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.06)
            `,
            padding: "50px 60px",
            ...style,
        }}
    >
        {children}
    </div>
);
