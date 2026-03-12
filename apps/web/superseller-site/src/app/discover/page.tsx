import { Metadata } from "next";
import SmartDiscovery from "./SmartDiscovery";

export const metadata: Metadata = {
  title: "Discover What's Possible | SuperSeller AI",
  description:
    "See how AI-powered marketing can transform your business. Free personalized analysis in 60 seconds.",
  robots: { index: false, follow: false },
};

export default function DiscoverPage() {
  return <SmartDiscovery />;
}
