import React, { useState } from "react";

import { AccessTRPCReactProvider, trpc } from "~/trpc/react";

const RoleTable: React.FC = () => {
  const roles = trpc.access.admin.getRoles.useQuery();
  const createRole = trpc.access.admin.createRole.useMutation();
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewUser] = useState({
    name: "",
    description: "",
  });

  const handleCreateRole = async () => {
    const today = new Date().toLocaleDateString();
    const newUserData = { ...newRole, createDate: today };

    try {
      await createRole.mutateAsync(newUserData);
    } catch (error) {
      console.error(error);
    }

    void roles.refetch();

    setShowModal(false);
  };

  const openModal = () => {
    setNewUser({
      name: "",
      description: "",
    });
    setShowModal(true);
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
            </svg>{" "}
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
                  {role.doors.length}
                </td>
                {/* <td className="whitespace-nowrap px-4 py-2">
                  <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.status === "Good"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status} 
                    </span>
                  Nyan
                </td> */}
                <td
                  className="whitespace-nowrap px-4 py-2 text-sm text-gray-500"
                  suppressHydrationWarning
                >
                  {new Date(role.created_at).toLocaleString()}
                </td>

                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {role.id}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-right text-sm font-medium">
                  <a
                    href="#"
                    className="m-2 text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </a>
                  <a
                    href="#"
                    className="m-2 text-red-600 hover:text-indigo-900"
                  >
                    Delete
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Create New Role</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreateRole();
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewUser({ ...newRole, name: e.target.value })
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
                    setNewUser({ ...newRole, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
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
