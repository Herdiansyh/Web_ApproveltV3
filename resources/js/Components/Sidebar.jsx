import React, { useEffect, useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import {
    FileText,
    ListCheck,
    User2,
    UserCircle2,
    CheckCircle2,
    LogOut,
    Menu,
    ListChecks,
    Workflow,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const [logoutDialog, setLogoutDialog] = useState(false);
    const user = usePage().props.auth.user;

    useEffect(() => {
        const handleResize = () => setOpen(window.innerWidth >= 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const confirmLogout = () => {
        router.post(route("logout"));
    };

    const navItems = [
        {
            label: "Dashboard",
            href: route("dashboard"),
            active: route().current("dashboard"),
            icon: <FileText className="h-5 w-5" />,
        },
        // 🔹 Lihat List Persetujuan (khusus divisi yang menerima pengajuan)
        {
            label: "Lihat List Persetujuan",
            href: route("submissions.forDivision"),
            active: route().current("submissions.forDivision"),
            icon: <ListCheck className="h-5 w-5" />,
        },

        // 🔹 Lihat Pengajuan (untuk melihat pengajuan yang dibuat user)
        {
            label: "Lihat Pengajuan",
            href: route("submissions.index"),
            active: route().current("submissions.index"),
            icon: <CheckCircle2 className="h-5 w-5" />,
        },
        ...(user.role === "admin"
            ? [
                  {
                      label: "Division Management",
                      href: route("divisions.index"),
                      active: route().current("divisions.index"),
                      icon: <UserCircle2 className="h-5 w-5" />,
                  },
                  {
                      label: "User Management",
                      href: route("users.index"),
                      active: route().current("users.*"),
                      icon: <User2 className="h-5 w-5" />,
                  },
                  {
                      label: "Workflow Management",
                      href: route("workflows.index"),
                      active: route().current("workflows.*"),
                      icon: <Workflow className="h-5 w-5" />,
                  },
              ]
            : []),
    ];

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "flex flex-col transition-all duration-300 border-r bg-sidebar text-sidebar-foreground",
                    open ? "min-w-64 px-4 py-5" : "w-20 items-center px-2 py-5"
                )}
            >
                <div className="flex items-center justify-end mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setOpen(!open)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex flex-col gap-3">
                    {navItems.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                                        item.active
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                                    )}
                                >
                                    {item.icon}
                                    {open && <span>{item.label}</span>}
                                </Link>
                            </TooltipTrigger>
                            {!open && (
                                <TooltipContent side="right">
                                    {item.label}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    ))}

                    <Separator className="my-3 bg-sidebar-border" />

                    <Button
                        variant="ghost"
                        className="justify-start gap-3 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all"
                        onClick={() => setLogoutDialog(true)}
                    >
                        <LogOut className="h-5 w-5" />
                        {open && <span>Logout</span>}
                    </Button>
                </nav>
            </aside>

            <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Logout</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Apakah Anda yakin ingin keluar dari aplikasi?
                    </p>
                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setLogoutDialog(false)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={confirmLogout}>
                            Ya, Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
