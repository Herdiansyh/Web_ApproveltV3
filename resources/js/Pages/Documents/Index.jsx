import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import Sidebar from "@/Components/Sidebar";
import Swal from "sweetalert2";
import DocumentModal from "./Create.jsx";

export default function Index({ auth, documents }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);

    const handleEdit = (document) => {
        setEditingDocument(document);
        setIsModalOpen(true);
    };

    const handleDelete = (documentId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This document type will be deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("documents.destroy", documentId), {
                    onSuccess: () => {
                        Swal.fire(
                            "Deleted!",
                            "The document type has been deleted.",
                            "success"
                        );
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
                    Document Management
                </h2>
            }
        >
            <Head title="Document Management" />
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="py-12 w-full overflow-auto">
                    <div className="mx-auto p-6 lg:px-8">
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">
                                    Documents
                                </h3>
                                <Button
                                    onClick={() => {
                                        setEditingDocument(null);
                                        setIsModalOpen(true);
                                    }}
                                    style={{
                                        borderRadius: "15px",
                                    }}
                                >
                                    Add New Document
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((document) => (
                                        <TableRow key={document.id}>
                                            <TableCell>
                                                {document.name}
                                            </TableCell>
                                            <TableCell>
                                                {document.description || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(document)
                                                        }
                                                        style={{
                                                            borderRadius:
                                                                "15px",
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                document.id
                                                            )
                                                        }
                                                        style={{
                                                            borderRadius:
                                                                "15px",
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </div>

            <DocumentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingDocument(null);
                }}
                document={editingDocument}
            />
        </AuthenticatedLayout>
    );
}
