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
import DivisionModal from "./Create.jsx";
import { Input } from "@/Components/ui/input.jsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select.jsx";
import { X } from "lucide-react";

export default function Index({ auth, divisions }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDivision, setEditingDivision] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const filteredDivisions = divisions.filter((division) => {
        const matchSearch = division.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchSelect =
            selectedDivision === "" ||
            division.name.toLowerCase() === selectedDivision.toLowerCase();

        return matchSearch && matchSelect;
    });

    const handleEdit = (division) => {
        setEditingDivision(division);
        setIsModalOpen(true);
    };

    const handleDelete = (divisionId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("divisions.destroy", divisionId), {
                    onSuccess: () => {
                        Swal.fire(
                            "Deleted!",
                            "The division has been deleted.",
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
                    Division Management
                </h2>
            }
        >
            <Head title="Division Management" />

            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <div className="py-12 w-full overflow-auto relative">
                    <div className="mx-auto p-6 lg:px-8">
                        <h1 className="text-2xl font-bold absolute top-5">
                            Divisions
                        </h1>

                        <Card className="p-6">
                            {/* Filter dan tombol tambah */}
                            <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
                                <div className="flex flex-col md:flex-row gap-2 w-full">
                                    <Input
                                        className="md:w-1/2"
                                        placeholder="Search Division..."
                                        style={{ borderRadius: "8px" }}
                                        value={search}
                                        onChange={handleSearch}
                                    />
                                    <Select
                                        value={selectedDivision}
                                        onValueChange={(value) =>
                                            setSelectedDivision(value)
                                        }
                                    >
                                        <SelectTrigger
                                            className="md:w-1/4 border border-gray-300"
                                            style={{ borderRadius: "8px" }}
                                        >
                                            <SelectValue placeholder="Filter by Division..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {divisions.map((division) => (
                                                <SelectItem
                                                    key={division.id}
                                                    value={division.name}
                                                >
                                                    {division.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    onClick={() => {
                                        setEditingDivision(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="w-[180px] h-9 text-sm"
                                    style={{ borderRadius: "8px" }}
                                >
                                    + Add New Division
                                </Button>
                            </div>

                            {/* Chip filter aktif */}
                            {selectedDivision && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <div
                                        className="flex items-center  gap-1 bg-gray-100 text-gray-800 px-2 py-1  text-[0.7rem]"
                                        style={{ borderRadius: "8px" }}
                                    >
                                        {selectedDivision}
                                        <X
                                            size={10}
                                            className="cursor-pointer hover:text-red-500 "
                                            onClick={() =>
                                                setSelectedDivision("")
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tabel Divisions */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDivisions.length > 0 ? (
                                        filteredDivisions.map((division) => (
                                            <TableRow key={division.id}>
                                                <TableCell>
                                                    {division.name}
                                                </TableCell>
                                                <TableCell>
                                                    {division.description ||
                                                        "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    division
                                                                )
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
                                                                    division.id
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
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center text-gray-500"
                                            >
                                                No divisions found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </div>

            <DivisionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingDivision(null);
                }}
                division={editingDivision}
            />
        </AuthenticatedLayout>
    );
}
