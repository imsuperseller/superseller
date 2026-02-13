export const dynamic = "force-dynamic";

export default function VideoLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="min-h-screen text-white"
            style={{ backgroundColor: "#110d28" }}
        >
            {children}
        </div>
    );
}
