import React, { useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import SignatureCanvas from "react-signature-canvas";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import Sidebar from "@/Components/Sidebar";
import Swal from "sweetalert2";

export default function Show({ auth, submission, fileUrl, canApprove }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [signatureMethod, setSignatureMethod] = useState("draw");
    const [uploadedSignature, setUploadedSignature] = useState(null);
    const [watermark, setWatermark] = useState({
        x: 50,
        y: 50,
        width: 120,
        height: 60,
    });
    const signatureRef = useRef();
    const fileInputRef = useRef();

    const { data, setData, post, processing, errors, reset } = useForm({
        approval_note: "",
        signature: "",
    });

    const handleSignatureUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File terlalu besar. Maksimal ukuran file adalah 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedSignature(reader.result);
                setData("signature", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrag = (e, data) => {
        setWatermark((w) => ({ ...w, x: data.x, y: data.y }));
    };

    const handleResize = (event, { size }) => {
        setWatermark((w) => ({ ...w, width: size.width, height: size.height }));
    };

    const handleApprove = () => {
        post(route("submissions.approve", submission.id), {
            data: {
                approval_note: data.approval_note || "",
            },
            onSuccess: () => {
                setShowApproveModal(false);
                reset();
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Pengajuan telah disetujui.",
                    confirmButtonText: "OK",
                }).then(() => {
                    window.location.reload();
                });
            },
            onError: () => {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: "Terjadi kesalahan saat menyetujui pengajuan.",
                    confirmButtonText: "OK",
                });
            },
        });
    };

    const handleReject = () => {
        if (!data.approval_note.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Perhatian",
                text: "Mohon berikan alasan penolakan",
                confirmButtonText: "OK",
            });
            return;
        }

        // Konfirmasi sebelum reject
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Dokumen akan ditolak!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, tolak",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                post(route("submissions.reject", submission.id), {
                    onSuccess: () => {
                        setShowRejectModal(false);
                        reset();
                        Swal.fire({
                            icon: "success",
                            title: "Berhasil",
                            text: "Dokumen telah ditolak",
                            confirmButtonText: "OK",
                        }).then(() => {
                            window.location.reload();
                        });
                    },
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Detail Pengajuan
                </h2>
            }
        >
            <Head title="Detail Pengajuan" />
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="py-12 w-full">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <Card className="p-6">
                            {/* Detail Submission */}
                            <div className="mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">
                                            {submission.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            Diajukan oleh:{" "}
                                            {submission.user.name} (
                                            {submission.user.division?.name ??
                                                "Tidak ada divisi"}
                                            )
                                        </p>
                                        <p className="text-gray-600">
                                            Status:{" "}
                                            <span
                                                className={`font-semibold ${
                                                    submission.status ===
                                                    "approved"
                                                        ? "text-green-600"
                                                        : submission.status ===
                                                          "rejected"
                                                        ? "text-red-600"
                                                        : "text-yellow-600"
                                                }`}
                                            >
                                                {submission.status === "pending"
                                                    ? "Menunggu Persetujuan"
                                                    : submission.status ===
                                                      "approved"
                                                    ? "Disetujui"
                                                    : "Ditolak"}
                                            </span>
                                        </p>
                                        {submission.approved_by && (
                                            <p className="text-gray-600 mt-2">
                                                {submission.status ===
                                                "approved"
                                                    ? "Disetujui"
                                                    : "Ditolak"}{" "}
                                                oleh: {submission.approver.name}
                                            </p>
                                        )}
                                        {submission.approval_note && (
                                            <p className="text-gray-600 mt-2">
                                                Catatan:{" "}
                                                {submission.approval_note}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Button asChild variant="secondary">
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {submission.status ===
                                                "approved"
                                                    ? "Unduh Dokumen Bertanda Tangan"
                                                    : "Unduh Dokumen"}
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                                {submission.description && (
                                    <p className="mt-4">
                                        {submission.description}
                                    </p>
                                )}
                            </div>
                            {/* PDF Viewer */}
                            <div className="mb-6">
                                <object
                                    data={fileUrl}
                                    type="application/pdf"
                                    className="w-full h-[600px]"
                                >
                                    <div className="text-center p-4">
                                        <p>
                                            Tidak dapat menampilkan dokumen
                                            secara langsung.
                                        </p>
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Buka Dokumen
                                        </a>
                                    </div>
                                </object>
                            </div>
                            {/* Approve / Reject Buttons */}
                            {canApprove && submission.status === "pending" && (
                                <div className="flex justify-end space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowRejectModal(true)}
                                        className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700"
                                    >
                                        Tolak Pengajuan
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            setShowApproveModal(true)
                                        }
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        Setujui Pengajuan
                                    </Button>
                                </div>
                            )}
                            {/* Approve Modal */}
                            {showApproveModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                                    <Card className="w-full max-w-md p-6">
                                        <h3 className="text-lg font-semibold mb-4">
                                            Setujui Pengajuan
                                        </h3>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-1">
                                                Catatan (Opsional)
                                            </label>
                                            <Textarea
                                                value={data.approval_note}
                                                onChange={(e) =>
                                                    setData(
                                                        "approval_note",
                                                        e.target.value
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setShowApproveModal(false)
                                                }
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                onClick={handleApprove}
                                                disabled={processing}
                                            >
                                                Setujui
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            )}
                            {/* Reject Modal */}
                            {showRejectModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                                    <Card className="w-full max-w-md p-6">
                                        <h3 className="text-lg font-semibold mb-4">
                                            Tolak Pengajuan
                                        </h3>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-1">
                                                Alasan Penolakan
                                            </label>
                                            <Textarea
                                                value={data.approval_note}
                                                onChange={(e) =>
                                                    setData(
                                                        "approval_note",
                                                        e.target.value
                                                    )
                                                }
                                                rows={3}
                                                required
                                            />
                                            {errors.approval_note && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {errors.approval_note}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setShowRejectModal(false)
                                                }
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleReject}
                                                disabled={processing}
                                            >
                                                Tolak
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
