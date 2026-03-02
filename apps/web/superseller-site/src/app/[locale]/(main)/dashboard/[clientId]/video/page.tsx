
import VideoGenerationDashboard from "@/components/dashboard/VideoGeneration";

export default async function VideoPage({
    params,
    searchParams
}: {
    params: Promise<{ clientId: string }>;
    searchParams: Promise<{ jobId?: string }>;
}) {
    const { clientId } = await params;
    const { jobId } = await searchParams;

    // If no jobId provided, try to find the latest active job for this client from DB
    // For now, we'll rely on the query param or show a "No active job" state in the component
    // In a real implementation, we'd query the SQL DB (via API) or Firestore here to find the active job ID.

    // For the demo/test context (Job d31f0082), we can default to it if not provided, 
    // or just pass undefined and let the component handle it (it shows "No Job ID").

    return (
        <VideoGenerationDashboard jobId={jobId} />
    );
}
