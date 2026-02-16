import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import VideoNav from "@/components/video/VideoNav";

export default async function VideoRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  if (!session.isValid) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#0a0a0a" }}>
      <VideoNav
        email={session.email || ""}
        clientId={session.clientId || ""}
      />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
