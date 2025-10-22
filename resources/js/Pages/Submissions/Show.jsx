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

export default function Show({ auth, submission, fileUrl, canApprove }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [signatureMethod, setSignatureMethod] = useState("draw");
    const [uploadedSignature, setUploadedSignature] = useState(null);
    // New state for watermark position and size
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
                // 2MB limit
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

    // Handler for drag
    const handleDrag = (e, data) => {
        setWatermark((w) => ({ ...w, x: data.x, y: data.y }));
    };
    // Handler for resize
    const handleResize = (event, { size }) => {
        setWatermark((w) => ({ ...w, width: size.width, height: size.height }));
    };

    const handleApprove = () => {
        let signature = "";

        if (signatureMethod === "draw") {
            if (signatureRef.current.isEmpty()) {
                alert("Mohon berikan tanda tangan Anda");
                return;
            }
            signature = signatureRef.current.toDataURL();
        } else {
            if (!uploadedSignature) {
                alert("Mohon upload gambar tanda tangan Anda");
                return;
            }
            signature = uploadedSignature;
        }

        post(route("submissions.approve", submission.id), {
            ...data,
            signature,
            signatureMethod,
            watermark_x: watermark.x,
            watermark_y: watermark.y,
            watermark_width: watermark.width,
            watermark_height: watermark.height,
            onSuccess: () => {
                setShowApproveModal(false);
                reset();
                window.location.reload();
            },
        });
    };

    const handleReject = () => {
        if (!data.approval_note.trim()) {
            alert("Mohon berikan alasan penolakan");
            return;
        }

        post(route("submissions.reject", submission.id), {
            onSuccess: () => {
                setShowRejectModal(false);
                reset();
                window.location.reload();
            },
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
                            <div className="mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">
                                            {submission.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            Diajukan oleh:{" "}
                                            {submission.user.name} (
                                            {submission.division.name})
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
                                                className="flex items-center gap-2"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line
                                                        x1="12"
                                                        y1="15"
                                                        x2="12"
                                                        y2="3"
                                                    />
                                                </svg>
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

                            <div className="mb-6">
                                <h4 className="font-semibold mb-2">Dokumen</h4>
                                {submission.status !== "pending" &&
                                    submission.approval_note && (
                                        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                                            <h4 className="font-semibold mb-2">
                                                {submission.status ===
                                                "approved"
                                                    ? "Catatan Persetujuan:"
                                                    : "Alasan Penolakan:"}
                                            </h4>
                                            <p className="text-gray-700">
                                                {submission.approval_note}
                                            </p>
                                        </div>
                                    )}

                                <div className="border rounded-lg p-4 relative">
                                    {showApproveModal &&
                                        signatureMethod === "upload" &&
                                        uploadedSignature && (
                                            <Draggable
                                                bounds="parent"
                                                defaultPosition={{
                                                    x: watermark.x,
                                                    y: watermark.y,
                                                }}
                                                onStop={handleDrag}
                                            >
                                                <ResizableBox
                                                    width={watermark.width}
                                                    height={watermark.height}
                                                    onResize={handleResize}
                                                    minConstraints={[100, 50]}
                                                    maxConstraints={[300, 150]}
                                                    className="absolute"
                                                    style={{ zIndex: 10 }}
                                                >
                                                    <div className="border-2 border-dashed border-blue-500 bg-white bg-opacity-50">
                                                        <img
                                                            src={
                                                                uploadedSignature
                                                            }
                                                            alt="Signature Preview"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                </ResizableBox>
                                            </Draggable>
                                        )}
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
                            </div>

                            {auth.user.role === "manager" &&
                                submission.status === "pending" && (
                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setShowRejectModal(true)
                                            }
                                            className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
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

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2">
                                                Pilih Metode Tanda Tangan
                                            </label>
                                            <div className="flex mb-4 border rounded-lg overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSignatureMethod(
                                                            "draw"
                                                        )
                                                    }
                                                    className={`flex-1 px-4 py-2 text-sm ${
                                                        signatureMethod ===
                                                        "draw"
                                                            ? "bg-blue-50 text-blue-700 font-medium"
                                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    Gambar Tangan
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSignatureMethod(
                                                            "upload"
                                                        )
                                                    }
                                                    className={`flex-1 px-4 py-2 text-sm ${
                                                        signatureMethod ===
                                                        "upload"
                                                            ? "bg-blue-50 text-blue-700 font-medium"
                                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    Upload Gambar
                                                </button>
                                            </div>

                                            {signatureMethod === "draw" ? (
                                                <div>
                                                    <div className="border rounded-lg bg-white">
                                                        <SignatureCanvas
                                                            ref={signatureRef}
                                                            canvasProps={{
                                                                className:
                                                                    "w-full h-40",
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() =>
                                                            signatureRef.current.clear()
                                                        }
                                                    >
                                                        Hapus Tanda Tangan
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={
                                                            handleSignatureUpload
                                                        }
                                                        className="hidden"
                                                        ref={fileInputRef}
                                                    />

                                                    <div
                                                        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-500"
                                                        onClick={() =>
                                                            fileInputRef.current.click()
                                                        }
                                                    >
                                                        {uploadedSignature ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={
                                                                        uploadedSignature
                                                                    }
                                                                    alt="Tanda tangan"
                                                                    className="max-h-40 mx-auto"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setUploadedSignature(
                                                                            null
                                                                        );
                                                                    }}
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-500">
                                                                <svg
                                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                                    stroke="currentColor"
                                                                    fill="none"
                                                                    viewBox="0 0 48 48"
                                                                >
                                                                    <path
                                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                                <p className="mt-1">
                                                                    Klik untuk
                                                                    upload tanda
                                                                    tangan
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    (PNG, JPG,
                                                                    maksimal
                                                                    2MB)
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {signatureMethod ===
                                                        "upload" && (
                                                        <div className="mt-4">
                                                            <label className="block text-sm font-medium mb-1">
                                                                Pilih Posisi
                                                                Tanda Tangan
                                                            </label>
                                                            <select
                                                                className="w-full border rounded p-2"
                                                                value={
                                                                    data.signature_position ||
                                                                    "bottom-right"
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "signature_position",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            >
                                                                <option value="bottom-right">
                                                                    Kanan Bawah
                                                                </option>
                                                                <option value="bottom-left">
                                                                    Kiri Bawah
                                                                </option>
                                                                <option value="top-right">
                                                                    Kanan Atas
                                                                </option>
                                                                <option value="top-left">
                                                                    Kiri Atas
                                                                </option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
