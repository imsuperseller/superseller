'use client';

import React, { useId } from 'react';

interface IconProps {
    className?: string;
    size?: number;
}

// Blueprint Icon - architectural schematic design
export function BlueprintIcon({ className = '', size = 64 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="blueprintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1EAEF7" />
                    <stop offset="100%" stopColor="#5FFBFD" />
                </linearGradient>
                <filter id="blueprintGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#blueprintGlow)">
                {/* Outer frame */}
                <rect x="8" y="8" width="48" height="48" rx="4" stroke="url(#blueprintGrad)" strokeWidth="2" fill="none" />
                {/* Grid lines */}
                <line x1="8" y1="24" x2="56" y2="24" stroke="url(#blueprintGrad)" strokeWidth="1" opacity="0.5" />
                <line x1="8" y1="40" x2="56" y2="40" stroke="url(#blueprintGrad)" strokeWidth="1" opacity="0.5" />
                <line x1="24" y1="8" x2="24" y2="56" stroke="url(#blueprintGrad)" strokeWidth="1" opacity="0.5" />
                <line x1="40" y1="8" x2="40" y2="56" stroke="url(#blueprintGrad)" strokeWidth="1" opacity="0.5" />
                {/* Corner marks */}
                <path d="M12 16 L16 16 L16 12" stroke="url(#blueprintGrad)" strokeWidth="2" fill="none" />
                <path d="M52 16 L48 16 L48 12" stroke="url(#blueprintGrad)" strokeWidth="2" fill="none" />
                <path d="M12 48 L16 48 L16 52" stroke="url(#blueprintGrad)" strokeWidth="2" fill="none" />
                <path d="M52 48 L48 48 L48 52" stroke="url(#blueprintGrad)" strokeWidth="2" fill="none" />
                {/* Center element */}
                <circle cx="32" cy="32" r="8" stroke="url(#blueprintGrad)" strokeWidth="2" fill="none" />
                <circle cx="32" cy="32" r="3" fill="url(#blueprintGrad)" />
            </g>
        </svg>
    );
}

// Build Icon - gears assembling
export function BuildIcon({ className = '', size = 64 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="buildGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1EAEF7" />
                    <stop offset="100%" stopColor="#5FFBFD" />
                </linearGradient>
                <filter id="buildGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#buildGlow)">
                {/* Large gear */}
                <circle cx="24" cy="28" r="14" stroke="url(#buildGrad)" strokeWidth="2" fill="none" />
                <circle cx="24" cy="28" r="5" stroke="url(#buildGrad)" strokeWidth="2" fill="none" />
                {/* Gear teeth */}
                <rect x="22" y="12" width="4" height="4" fill="url(#buildGrad)" />
                <rect x="22" y="40" width="4" height="4" fill="url(#buildGrad)" />
                <rect x="8" y="26" width="4" height="4" fill="url(#buildGrad)" />
                <rect x="36" y="26" width="4" height="4" fill="url(#buildGrad)" />
                {/* Small gear */}
                <circle cx="44" cy="40" r="10" stroke="url(#buildGrad)" strokeWidth="2" fill="none" />
                <circle cx="44" cy="40" r="4" stroke="url(#buildGrad)" strokeWidth="2" fill="none" />
                {/* Connection spark */}
                <path d="M36 34 L38 36" stroke="url(#buildGrad)" strokeWidth="2" />
            </g>
        </svg>
    );
}

// Support Icon - shield with pulse
export function SupportIcon({ className = '', size = 64 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="supportGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1EAEF7" />
                    <stop offset="100%" stopColor="#5FFBFD" />
                </linearGradient>
                <filter id="supportGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#supportGlow)">
                {/* Shield */}
                <path
                    d="M32 8 L52 16 L52 32 C52 44 42 52 32 56 C22 52 12 44 12 32 L12 16 L32 8Z"
                    stroke="url(#supportGrad)"
                    strokeWidth="2"
                    fill="none"
                />
                {/* Checkmark */}
                <path
                    d="M22 32 L28 38 L42 24"
                    stroke="url(#supportGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </g>
        </svg>
    );
}

// Brain System Icon - neural network
export function BrainSystemIcon({ className = '', size = 64 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1EAEF7" />
                    <stop offset="100%" stopColor="#5FFBFD" />
                </linearGradient>
                <filter id="brainGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#brainGlow)">
                {/* Central node */}
                <circle cx="32" cy="32" r="8" fill="url(#brainGrad)" opacity="0.8" />
                {/* Outer nodes */}
                <circle cx="16" cy="20" r="4" fill="url(#brainGrad)" opacity="0.6" />
                <circle cx="48" cy="20" r="4" fill="url(#brainGrad)" opacity="0.6" />
                <circle cx="16" cy="44" r="4" fill="url(#brainGrad)" opacity="0.6" />
                <circle cx="48" cy="44" r="4" fill="url(#brainGrad)" opacity="0.6" />
                <circle cx="32" cy="12" r="3" fill="url(#brainGrad)" opacity="0.4" />
                <circle cx="32" cy="52" r="3" fill="url(#brainGrad)" opacity="0.4" />
                {/* Connection lines */}
                <line x1="20" y1="22" x2="28" y2="28" stroke="url(#brainGrad)" strokeWidth="1.5" opacity="0.7" />
                <line x1="44" y1="22" x2="36" y2="28" stroke="url(#brainGrad)" strokeWidth="1.5" opacity="0.7" />
                <line x1="20" y1="42" x2="28" y2="36" stroke="url(#brainGrad)" strokeWidth="1.5" opacity="0.7" />
                <line x1="44" y1="42" x2="36" y2="36" stroke="url(#brainGrad)" strokeWidth="1.5" opacity="0.7" />
                <line x1="32" y1="15" x2="32" y2="24" stroke="url(#brainGrad)" strokeWidth="1.5" opacity="0.5" />
                <line x1="32" y1="40" x2="32" y2="49" stroke="url(#brainGrad)" strokeWidth="1.5" opacity="0.5" />
                {/* Orbiting ring */}
                <circle cx="32" cy="32" r="20" stroke="url(#brainGrad)" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="4 4" />
            </g>
        </svg>
    );
}

// Skills Icon - modular blocks
export function SkillsIcon({ className = '', size = 64 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="skillsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F47920" />
                    <stop offset="100%" stopColor="#f79d4e" />
                </linearGradient>
                <filter id="skillsGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#skillsGlow)">
                {/* Block 1 */}
                <rect x="8" y="8" width="20" height="20" rx="3" stroke="url(#skillsGrad)" strokeWidth="2" fill="none" />
                <circle cx="18" cy="18" r="4" fill="url(#skillsGrad)" opacity="0.5" />
                {/* Block 2 */}
                <rect x="36" y="8" width="20" height="20" rx="3" stroke="url(#skillsGrad)" strokeWidth="2" fill="none" />
                <rect x="42" y="14" width="8" height="8" fill="url(#skillsGrad)" opacity="0.5" />
                {/* Block 3 */}
                <rect x="8" y="36" width="20" height="20" rx="3" stroke="url(#skillsGrad)" strokeWidth="2" fill="none" />
                <path d="M14 46 L22 46 M18 42 L18 50" stroke="url(#skillsGrad)" strokeWidth="2" />
                {/* Connection block (highlighted) */}
                <rect x="36" y="36" width="20" height="20" rx="3" fill="url(#skillsGrad)" opacity="0.3" stroke="url(#skillsGrad)" strokeWidth="2" />
                <path d="M42 46 L50 46 M46 42 L46 50" stroke="url(#skillsGrad)" strokeWidth="2" />
                {/* Connection lines */}
                <line x1="28" y1="18" x2="36" y2="18" stroke="url(#skillsGrad)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <line x1="18" y1="28" x2="18" y2="36" stroke="url(#skillsGrad)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <line x1="28" y1="46" x2="36" y2="46" stroke="url(#skillsGrad)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
            </g>
        </svg>
    );
}

// Guard Icon - radar/monitoring
export function GuardIcon({ className = '', size = 64 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="guardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5FFBFD" />
                    <stop offset="100%" stopColor="#1EAEF7" />
                </linearGradient>
                <filter id="guardGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#guardGlow)">
                {/* Radar circles */}
                <circle cx="32" cy="32" r="24" stroke="url(#guardGrad)" strokeWidth="1.5" fill="none" opacity="0.3" />
                <circle cx="32" cy="32" r="16" stroke="url(#guardGrad)" strokeWidth="1.5" fill="none" opacity="0.5" />
                <circle cx="32" cy="32" r="8" stroke="url(#guardGrad)" strokeWidth="1.5" fill="none" opacity="0.7" />
                {/* Center dot */}
                <circle cx="32" cy="32" r="3" fill="url(#guardGrad)" />
                {/* Radar sweep */}
                <path
                    d="M32 32 L32 8"
                    stroke="url(#guardGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                {/* Detection points */}
                <circle cx="40" cy="20" r="2" fill="url(#guardGrad)" opacity="0.8" />
                <circle cx="24" cy="44" r="2" fill="url(#guardGrad)" opacity="0.6" />
                {/* Cross hairs */}
                <line x1="32" y1="4" x2="32" y2="12" stroke="url(#guardGrad)" strokeWidth="1" opacity="0.4" />
                <line x1="32" y1="52" x2="32" y2="60" stroke="url(#guardGrad)" strokeWidth="1" opacity="0.4" />
                <line x1="4" y1="32" x2="12" y2="32" stroke="url(#guardGrad)" strokeWidth="1" opacity="0.4" />
                <line x1="52" y1="32" x2="60" y2="32" stroke="url(#guardGrad)" strokeWidth="1" opacity="0.4" />
            </g>
        </svg>
    );
}

// Guarantee Icon - medal/badge
export function GuaranteeIcon({ className = '', size = 64 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="guaranteeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
                <filter id="guaranteeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#guaranteeGlow)">
                {/* Medal circle */}
                <circle cx="32" cy="28" r="18" stroke="url(#guaranteeGrad)" strokeWidth="2" fill="none" />
                <circle cx="32" cy="28" r="14" stroke="url(#guaranteeGrad)" strokeWidth="1" fill="none" opacity="0.5" />
                {/* Star points */}
                <path
                    d="M32 14 L34 22 L42 22 L36 27 L38 35 L32 30 L26 35 L28 27 L22 22 L30 22 Z"
                    fill="url(#guaranteeGrad)"
                    opacity="0.7"
                />
                {/* Ribbon */}
                <path d="M20 40 L24 46 L24 58 L28 54 L32 58 L32 46" stroke="url(#guaranteeGrad)" strokeWidth="2" fill="none" />
                <path d="M44 40 L40 46 L40 58 L36 54 L32 58 L32 46" stroke="url(#guaranteeGrad)" strokeWidth="2" fill="none" />
            </g>
        </svg>
    );
}

// Old Way X Icon - Broken chain/warning style (matches complexity of other icons)
export function OldWayXIcon({ className = '', size = 20 }: IconProps) {
    const id = useId();
    const uniqueId = `oldWay-${id.replace(/:/g, '')}`;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={`${uniqueId}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#991B1B" />
                </linearGradient>
                <filter id={`${uniqueId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter={`url(#${uniqueId}-glow)`}>
                {/* Broken chain link left */}
                <ellipse cx="20" cy="32" rx="10" ry="14" stroke={`url(#${uniqueId}-grad)`} strokeWidth="3" fill="none" />
                <line x1="30" y1="26" x2="34" y2="22" stroke={`url(#${uniqueId}-grad)`} strokeWidth="3" strokeLinecap="round" />
                <line x1="30" y1="38" x2="34" y2="42" stroke={`url(#${uniqueId}-grad)`} strokeWidth="3" strokeLinecap="round" />

                {/* Broken chain link right */}
                <ellipse cx="44" cy="32" rx="10" ry="14" stroke={`url(#${uniqueId}-grad)`} strokeWidth="3" fill="none" />

                {/* Break marks / sparks */}
                <circle cx="37" cy="24" r="2" fill={`url(#${uniqueId}-grad)`} opacity="0.8" />
                <circle cx="35" cy="32" r="1.5" fill={`url(#${uniqueId}-grad)`} opacity="0.6" />
                <circle cx="37" cy="40" r="2" fill={`url(#${uniqueId}-grad)`} opacity="0.8" />

                {/* Warning accent corners */}
                <path d="M8 8 L14 8 L8 14 Z" fill={`url(#${uniqueId}-grad)`} opacity="0.4" />
                <path d="M56 8 L56 14 L50 8 Z" fill={`url(#${uniqueId}-grad)`} opacity="0.4" />
                <path d="M8 56 L14 56 L8 50 Z" fill={`url(#${uniqueId}-grad)`} opacity="0.4" />
                <path d="M56 56 L50 56 L56 50 Z" fill={`url(#${uniqueId}-grad)`} opacity="0.4" />

                {/* Outer frame */}
                <rect x="4" y="4" width="56" height="56" rx="8" stroke={`url(#${uniqueId}-grad)`} strokeWidth="1.5" fill="none" opacity="0.3" />
            </g>
        </svg>
    );
}

// New Way Check Icon - Shield with connected nodes (matches BrainSystem/Support style)
export function NewWayCheckIcon({ className = '', size = 20 }: IconProps) {
    const id = useId();
    const uniqueId = `newWay-${id.replace(/:/g, '')}`;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={`${uniqueId}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5FFBFD" />
                    <stop offset="50%" stopColor="#1EAEF7" />
                    <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <filter id={`${uniqueId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter={`url(#${uniqueId}-glow)`}>
                {/* Shield shape - like Support icon */}
                <path
                    d="M32 4 L56 14 L56 32 C56 46 44 56 32 60 C20 56 8 46 8 32 L8 14 L32 4Z"
                    stroke={`url(#${uniqueId}-grad)`}
                    strokeWidth="2"
                    fill="none"
                />
                <path
                    d="M32 10 L50 18 L50 32 C50 42 40 50 32 54 C24 50 14 42 14 32 L14 18 L32 10Z"
                    fill={`url(#${uniqueId}-grad)`}
                    opacity="0.15"
                />

                {/* Checkmark inside */}
                <path
                    d="M20 32 L28 40 L44 24"
                    stroke={`url(#${uniqueId}-grad)`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {/* Connection nodes like BrainSystem */}
                <circle cx="10" cy="10" r="3" fill={`url(#${uniqueId}-grad)`} opacity="0.5" />
                <circle cx="54" cy="10" r="3" fill={`url(#${uniqueId}-grad)`} opacity="0.5" />
                <line x1="13" y1="11" x2="29" y2="7" stroke={`url(#${uniqueId}-grad)`} strokeWidth="1" opacity="0.4" />
                <line x1="51" y1="11" x2="35" y2="7" stroke={`url(#${uniqueId}-grad)`} strokeWidth="1" opacity="0.4" />

                {/* Bottom accent */}
                <circle cx="32" cy="58" r="2" fill={`url(#${uniqueId}-grad)`} opacity="0.6" />
            </g>
        </svg>
    );
}

