export interface CharacterRevealProps {
    characterName: string;
    businessName: string;
    tagline: string;         // from CharacterBible personaDescription (truncated to ~50 chars)
    accentColor: string;     // hex color from tenant Brand or default "#C9A96E"
    bgColor: string;         // dark bg, default "#0A0A0A"
    logoUrl?: string;        // tenant logo from Brand table
    sceneClips: string[];    // R2 public URLs for 5 scene MP4s
    sceneLabels: string[];   // text labels for each scene (e.g., "Professional Studio", scenario names)
}
