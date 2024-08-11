import React, { useState } from "react";

import type { RouterOutputs } from "@dumbledoor/user-api";

import {
  AccessTRPCReactProvider,
  trpc,
  UserTRPCReactProvider,
} from "~/trpc/react";

const UserTable: React.FC = () => {
  const users = trpc.user.admin.getUsers.useQuery();
  const createUser = trpc.user.admin.createUser.useMutation();
  const updateUser = trpc.user.admin.updateUser.useMutation();
  const deleteUserTrpc = trpc.user.admin.deleteUser.useMutation();

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<
    RouterOutputs["admin"]["getUsers"][0] | null
  >(null);
  const [deleteUser, setDeleteUser] = useState<
    RouterOutputs["admin"]["getUsers"][0] | null
  >(null);

  const [newUser, setNewUser] = useState<{
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    accessLevel: number;
    role: string | null;
    admin: boolean;
  }>({
    userName: "",
    password: "",
    firstName: "",
    lastName: "",
    accessLevel: 0,
    role: null,
    admin: false,
  });

  const doCreateUser = async () => {
    await createUser.mutateAsync({
      username: newUser.userName,
      password: newUser.password,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      accessLevel: newUser.accessLevel,
      admin: newUser.admin,
    });

    setShowModal(false);
    void users.refetch();
  };

  const doEditUser = async () => {
    if (!editUser) return;

    console.log(newUser);
    await updateUser.mutateAsync({
      id: editUser.id,
      username: newUser.userName,
      password: newUser.password,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      accessLevel: newUser.accessLevel,
      admin: newUser.admin,
    });

    setShowModal(false);
    setEditUser(null);
    void users.refetch();
  };

  const handleEditUser = (user: RouterOutputs["admin"]["getUsers"][0]) => {
    setEditUser(user);
    setNewUser({
      userName: user.username,
      firstName: user.first_name,
      password: "",
      lastName: user.last_name,
      accessLevel: user.access_level,
      role: user.role_id,
      admin: user.admin,
    });
    setShowModal(true);
  };

  const handleDeleteUser = (user: RouterOutputs["admin"]["getUsers"][0]) => {
    setDeleteUser(user);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUser) return;

    await deleteUserTrpc.mutateAsync(deleteUser.id);
    void users.refetch();
    setDeleteUser(null);
  };

  const cancelDeleteUser = () => {
    setDeleteUser(null);
  };

  const openModal = () => {
    setNewUser({
      userName: "",
      password: "",
      firstName: "",
      lastName: "",
      accessLevel: 0,
      role: null,
      admin: false,
    });
    setShowModal(true);
  };

  return (
    <div className="relative flex-1 bg-gray-100 p-8">
      <div className="overflow-x-auto">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <button
            className="rounded bg-blue-600 p-2 text-white hover:bg-pink-600"
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
                Username
              </th>
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
                Role
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Access Level
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
                Flags
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
            {users.isPending && (
              <tr>
                <td colSpan={7} className="py-4 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {users.error && (
              <tr>
                <td colSpan={7} className="py-4 text-center">
                  {users.error.message}
                </td>
              </tr>
            )}

            {users.data?.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center">
                  No data
                </td>
              </tr>
            )}

            {users.data?.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {user.first_name} {user.last_name}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {user.role !== null ? user.role.name : "No role"}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {user.access_level}
                </td>
                <td
                  className="whitespace-nowrap px-4 py-2 text-sm text-gray-500"
                  suppressHydrationWarning
                >
                  {new Date(user.created_at).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      !user.admin
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.admin ? "Admin" : "User"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {user.id}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-right text-sm font-medium">
                  <a
                    href="#"
                    className="m-2 text-indigo-600 hover:text-indigo-900"
                    onClick={() => handleEditUser(user)}
                  >
                    Edit
                  </a>
                  <a
                    href="#"
                    className="m-2 text-red-600 hover:text-indigo-900"
                    onClick={() => handleDeleteUser(user)}
                  >
                    Delete
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating/Editing a User */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">
              {editUser ? "Edit User" : "Create New User"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editUser) {
                  void doEditUser();
                } else {
                  void doCreateUser();
                }
              }}
            >
              {/* Form Fields */}
              <div className="mb-4">
                <label className="block text-gray-700">Username</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newUser.userName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, userName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">
                  {editUser ? "New Password" : "Password"}
                </label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder={
                    editUser
                      ? "Leave blank to keep the same password"
                      : "Password"
                  }
                  required={editUser ? false : true}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">First name</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Last name</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Role</label>
                <RoleSelectWithTRPC
                  role={newUser.role ?? ""}
                  onChange={(role) => setNewUser({ ...newUser, role })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Access Level</label>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={newUser.accessLevel}
                  onChange={(e) => {
                    setNewUser({
                      ...newUser,
                      accessLevel: parseInt(e.target.value),
                    });
                  }}
                  required
                >
                  <option value={0}>Access level 0</option>
                  <option value={1}>Access level 1</option>
                  <option value={2}>Access level 2</option>
                  <option value={3}>Access level 3</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Admin</label>
                <input
                  type="checkbox"
                  checked={newUser.admin}
                  onChange={(e) =>
                    setNewUser({ ...newUser, admin: e.target.checked })
                  }
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                  onClick={() => {
                    setShowModal(false);
                    setEditUser(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {editUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Delete User</h2>
            <p>Are you sure you want to delete user "{deleteUser.username}"?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="mr-4 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                onClick={cancelDeleteUser}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={confirmDeleteUser}
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

export default function UsersWithTRPC() {
  return (
    <UserTRPCReactProvider>
      <UserTable />
    </UserTRPCReactProvider>
  );
}

const RoleSelect: React.FC<{
  role: string;
  onChange: (role: string) => void;
}> = (props) => {
  const roles = trpc.access.admin.getRoles.useQuery();
  const [selectedRole, setSelectedRole] = useState<string>(props.role);

  return (
    <select
      className="w-full rounded border px-3 py-2"
      value={selectedRole}
      onChange={(e) => {
        setSelectedRole(e.target.value);
        props.onChange(e.target.value);
      }}
    >
      <option value={""}>No role</option>

      {roles.data?.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
};

const RoleSelectWithTRPC: React.FC<{
  role: string;
  onChange: (role: string) => void;
}> = (props) => {
  return (
    <AccessTRPCReactProvider>
      <RoleSelect role={props.role} onChange={props.onChange} />
    </AccessTRPCReactProvider>
  );
};
