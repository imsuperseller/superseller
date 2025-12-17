// This layout bypasses the global header/footer for the workflow dashboard
export default function WorkflowDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
