"use client";

import { Video } from "lucide-react";
import CreateVideoForm from "./CreateVideoForm";

export default function CreateVideoPage() {
    return (
        <div className="min-h-screen bg-[#110d28] text-white">
            <div className="container mx-auto max-w-2xl px-4 py-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-[#fe3d51]/10 border border-[#fe3d51]/20">
                        <Video className="w-6 h-6 text-[#fe3d51]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Create AI Property Tour</h1>
                        <p className="text-sm text-slate-400">Paste Zillow URL and optionally add floorplan & realtor photo</p>
                    </div>
                </div>
                <CreateVideoForm />
            </div>
        </div>
    );
}
