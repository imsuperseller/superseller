"use client";

import Link from "next/link";
import { Video, ArrowLeft } from "lucide-react";
import CreateVideoForm from "./CreateVideoForm";

export default function CreateVideoPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link href="/video" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={14} /> Back to My Videos
            </Link>

            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#f47920]/10 border border-[#f47920]/20">
                    <Video className="w-6 h-6 text-[#f47920]" />
                </div>
                <h1 className="text-2xl font-bold">Create AI Property Tour</h1>
            </div>
            <p className="text-gray-400 mb-8">
                Paste a Zillow URL, upload your headshot, and get a cinematic video tour in minutes.
            </p>

            <CreateVideoForm />
        </div>
    );
}
