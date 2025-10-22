import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

export default function Index({ auth, users, divisions }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
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

    const handleDelete = (user) => {
        if (confirm("Are you sure you want to delete this user?")) {
            router.delete(route("users.destroy", user.id));
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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="p-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-lg font-medium">Users</h3>
                            <Button onClick={() => setShowCreateModal(true)}>
                                Add User
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Division
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap capitalize">
                                                {user.role}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.division?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setData({
                                                            name: user.name,
                                                            email: user.email,
                                                            role: user.role,
                                                            division_id:
                                                                user.division_id,
                                                            password: "",
                                                            password_confirmation:
                                                                "",
                                                        });
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(user)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingUser) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-6">
                        <h3 className="text-lg font-medium mb-4">
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
                                        required
                                    />
                                    {errors.name && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.name}
                                        </div>
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
                                        required
                                    />
                                    {errors.email && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(value) =>
                                            setData("role", value)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manager">
                                                Manager
                                            </SelectItem>
                                            <SelectItem value="employee">
                                                Employee
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.role}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="division">Division</Label>
                                    <Select
                                        value={data.division_id}
                                        onValueChange={(value) =>
                                            setData("division_id", value)
                                        }
                                        required
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
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.division_id}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password">
                                        Password{" "}
                                        {editingUser &&
                                            "(leave blank to keep current)"}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        required={!editingUser}
                                    />
                                    {errors.password && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                        required={!editingUser}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-2">
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
