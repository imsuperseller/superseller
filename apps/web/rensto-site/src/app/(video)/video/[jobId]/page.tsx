import VideoGenerationDashboard from "@/components/dashboard/VideoGeneration";

export default async function VideoViewPage({
    params,
}: {
    params: Promise<{ jobId: string }>;
}) {
    const { jobId } = await params;
    return <VideoGenerationDashboard jobId={jobId} />;
}
