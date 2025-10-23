import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
    CheckCircle2,
    FileText,
    LogOut,
    Menu,
    User,
    User2,
} from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import Modal from "./Modal";
import NavLink from "./NavLink";
import Dropdown from "./Dropdown";

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const [showingLogoutModal, setShowingLogoutModal] = useState(false);

    const confirmLogout = () => {
        router.post(route("logout"));
    };
    const user = usePage().props.auth.user;
    // Mengecek ukuran layar saat pertama kali render
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setOpen(false);
            } else {
                setOpen(true);
            }
        };

        // Jalankan saat mount
        handleResize();

        // Tambahkan listener untuk resize
        window.addEventListener("resize", handleResize);

        // Cleanup listener saat unmount
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            {" "}
            {/* Sidebar */}
            <div
                className={`bg-white shadow-md  transition-all   duration-300  ${
                    open ? "w-64 min-w-64 " : "w-20 flex flex-col items-center"
                } p-4`}
            >
                <div className="flex items-center justify-end">
                    <button
                        variant="outline"
                        size="icon"
                        onClick={() => setOpen(!open)}
                    >
                        <Menu className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <nav className="mt-6 space-y-3 flex flex-col">
                    <NavLink
                        href={route("dashboard")}
                        active={route().current("dashboard")}
                        className="flex ml-1 items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        <FileText className="w-5 h-5" />
                        {open && <span>Dashboard</span>}
                    </NavLink>
                    <NavLink
                        href={route("submissions.forDivision")}
                        active={route().current("submissions.forDivision")}
                        className="flex ml-1 items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        <FileText className="w-5 h-5" />
                        {open && <span>lihat list pengajuan</span>}
                    </NavLink>
                    {(user.role === "employee" || user.role === "manager") && (
                        <NavLink
                            href={route("submissions.index")}
                            active={route().current("submissions.*")}
                            className="flex ml-1 items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            {open && (
                                <>
                                    {user.role === "employee" && (
                                        <span>Pengajuan</span>
                                    )}
                                    {user.role === "manager" && (
                                        <span>Lihat list Pengajuan</span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    )}{" "}
                    {user.role === "manager" && (
                        <NavLink
                            href={route("users.index")}
                            active={route().current("users.*")}
                            className="flex ml-1 items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            <User2 className="w-5 h-5" />
                            {open && <span>User Management</span>}
                        </NavLink>
                    )}
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
