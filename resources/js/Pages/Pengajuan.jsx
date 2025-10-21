import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Menu, FileText, CheckCircle2, LogOut } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/Components/Sidebar";

export default function Pengajuan({ auth }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Pengajuan
                </h2>
            }
        >
            <Head title="Pengajuan" />

            <div className="flex min-h-screen bg-gray-100">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {" "}
                        ini adalah pengajuan
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
