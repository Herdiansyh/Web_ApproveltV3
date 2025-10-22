import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
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
import { useForm } from "@inertiajs/react";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import Sidebar from "@/Components/Sidebar";

export default function Index({ auth, users, divisions, roles }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        role: "",
        division_id: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(route("users.update", editingUser.id), {
                onSuccess: () => {
                    setEditingUser(null);
                    reset();
                },
            });
        } else {
            post(route("users.store"), {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            division_id: user.division_id,
        });
    };

    const handleDelete = (userId) => {
        if (confirm("Are you sure you want to delete this user?")) {
            router.delete(route("users.destroy", userId));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    User Management
                </h2>
            }
        >
            <Head title="User Management" />
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />

                <div className="py-12 w-full">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Users</h3>
                                <Button
                                    onClick={() => {
                                        setEditingUser(null);
                                        reset();
                                        setShowCreateModal(true);
                                    }}
                                >
                                    Add New User
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Division</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.role
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    user.role.slice(1)}
                                            </TableCell>
                                            <TableCell>
                                                {user.division?.name || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(user)
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    {user.id !==
                                                        auth.user.id && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
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

            {/* Create/Edit Modal */}
            {(showCreateModal || editingUser) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingUser ? "Edit User" : "Create New User"}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password">
                                        {editingUser
                                            ? "Password (leave blank to keep current)"
                                            : "Password"}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(value) =>
                                            setData("role", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role}
                                                    value={role}
                                                >
                                                    {role
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        role.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.role}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="division">Division</Label>
                                    <Select
                                        value={data.division_id}
                                        onValueChange={(value) =>
                                            setData("division_id", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select division" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {divisions.map((division) => (
                                                <SelectItem
                                                    key={division.id}
                                                    value={division.id}
                                                >
                                                    {division.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.division_id && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.division_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingUser(null);
                                        reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {editingUser ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
