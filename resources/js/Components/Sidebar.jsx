import React, { useState } from "react";
import { Button } from "./ui/button";
import { CheckCircle2, FileText, LogOut, Menu, User } from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import Modal from "./Modal";

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const [showingLogoutModal, setShowingLogoutModal] = useState(false);

    const confirmLogout = () => {
        router.post(route("logout"));
    };

    return (
        <>
            {" "}
            {/* Sidebar */}
            <div
                className={`bg-white shadow-md transition-all w-20  duration-300  ${
                    open ? "w-64 " : "w-20 flex flex-col items-center"
                } p-4`}
            >
                <div className="flex items-center justify-between">
                    <h1
                        className={`font-bold text-lg  ml-3 text-gray-700 transition-all ${
                            !open && "hidden"
                        }`}
                    >
                        E-Approval
                    </h1>
                    <button
                        variant="outline"
                        size="icon"
                        onClick={() => setOpen(!open)}
                    >
                        <Menu className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <nav className="mt-6 space-y-3">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        <FileText className="w-5 h-5" />
                        {open && <span>Dashboard</span>}
                    </Link>
                    <Link
                        href="/pengajuan"
                        className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {open && <span>Pengajuan</span>}
                    </Link>
                    <button
                        onClick={() => setShowingLogoutModal(true)}
                        className="flex w-full items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        <LogOut className="w-5 h-5" />
                        {open && <span>Logout</span>}
                    </button>
                </nav>
            </div>
            <Modal
                show={showingLogoutModal}
                onClose={() => setShowingLogoutModal(false)}
            >
                <div className="p-6 ">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Konfirmasi Logout
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Apakah Anda yakin ingin keluar dari aplikasi?
                    </p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setShowingLogoutModal(false)}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                            onClick={confirmLogout}
                        >
                            Ya, Logout
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
