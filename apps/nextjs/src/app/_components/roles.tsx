import React, { useState } from "react";

import type { RouterOutputs } from "@dumbledoor/access-api";

import { AccessTRPCReactProvider, trpc } from "~/trpc/react";

const RoleTable: React.FC = () => {
  const roles = trpc.access.admin.getRoles.useQuery();
  const createRole = trpc.access.admin.createRole.useMutation();
  const updateRole = trpc.access.admin.updateRole.useMutation();
  const deleteRoleTrpc = trpc.access.admin.deleteRole.useMutation();

  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState<
    RouterOutputs["admin"]["getRoles"][0] | null
  >(null);
  const [deleteRole, setDeleteRole] = useState<
    RouterOutputs["admin"]["getRoles"][0] | null
  >(null);

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
  });

  const handleCreateRole = async () => {
    await createRole.mutateAsync(newRole);
    setShowModal(false);
    void roles.refetch();
  };

  const handleEditRole = async () => {
    if (!editRole) return;
    await updateRole.mutateAsync({
      ...editRole,
      name: newRole.name,
      description: newRole.description,
    });
    setShowModal(false);
    setEditRole(null);
    void roles.refetch();
  };

  const handleDeleteRole = async () => {
    if (!deleteRole) return;
    await deleteRoleTrpc.mutateAsync(deleteRole.id);
    setDeleteRole(null);
    void roles.refetch();
  };

  const openModal = () => {
    setNewRole({
      name: "",
      description: "",
    });
    setShowModal(true);
  };

  const openEditModal = (role: RouterOutputs["admin"]["getRoles"][0]) => {
    setEditRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
    });
    setShowModal(true);
  };

  const openDeleteModal = (role: RouterOutputs["admin"]["getRoles"][0]) => {
    setDeleteRole(role);
  };

  return (
    <div className="relative flex-1 bg-gray-100 p-8">
      <div className="overflow-x-auto">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">Roles</h1>
          <button
            className="rounded bg-blue-600 px-2 py-2 text-white hover:bg-pink-600"
            onClick={openModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Doors
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Users
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Create Date
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {roles.isPending && (
              <tr>
                <td colSpan={7} className="py-4 text-center">
                  Loading...
                </td>
              </tr>
            )}
            {roles.error && (
              <tr>
                <td colSpan={7} className="py-4 text-center">
                  {roles.error.message}
                </td>
              </tr>
            )}
            {roles.data?.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center">
                  No data
                </td>
              </tr>
            )}
            {roles.data?.map((role) => (
              <tr key={role.id}>
                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                  {role.name}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {role.description}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {role.role_doors.length}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {role.role_users.length}
                </td>
                <td
                  className="whitespace-nowrap px-4 py-2 text-sm text-gray-500"
                  suppressHydrationWarning
                >
                  {new Date(role.created_at).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {role.id}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-left text-sm font-medium">
                  <button
                    className="m-2 text-indigo-600 hover:text-indigo-900"
                    onClick={() => openEditModal(role)}
                  >
                    Edit
                  </button>
                  <button
                    className="m-2 text-red-600 hover:text-indigo-900"
                    onClick={() => openDeleteModal(role)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating/Editing a Role */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">
              {editRole ? "Edit Role" : "Create New Role"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editRole) {
                  void handleEditRole();
                } else {
                  void handleCreateRole();
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Description</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Doors</label>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Door
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Granted Access Level
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {editRole?.role_doors.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-4 text-center">
                          No doors
                        </td>
                      </tr>
                    )}

                    {editRole?.role_doors.map((door) => (
                      <tr key={door.door_id}>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          {door.door_id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          {door.granted_access_level}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Users</label>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Username
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        User ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {editRole?.role_users.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-4 text-center">
                          No users
                        </td>
                      </tr>
                    )}

                    {editRole?.role_users.map((user) => (
                      <tr key={user.user_id}>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          {user.user_id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          {user.user_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                  onClick={() => {
                    setShowModal(false);
                    setEditRole(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {editRole ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteRole && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Delete Role</h2>
            <p>Are you sure you want to delete role "{deleteRole.name}"?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="mr-4 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                onClick={() => setDeleteRole(null)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={handleDeleteRole}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RoleTableWithTRPC() {
  return (
    <AccessTRPCReactProvider>
      <RoleTable />
    </AccessTRPCReactProvider>
  );
}
