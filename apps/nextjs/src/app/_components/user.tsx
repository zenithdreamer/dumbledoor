import React, { useState } from "react";

import { api } from "~/trpc/react";

const UserTable: React.FC = () => {
  const users = api.admin.getUsers.useQuery();
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    id: "",
    name: "",
    assignedBy: "",
    role: "",
  });

  const handleCreateUser = () => {
    const today = new Date().toLocaleDateString();
    const newUserData = { ...newUser, createDate: today, status: "Good" };
    //NewUserdata here
    console.log(newUserData);

    setShowModal(false);
  };

  const openModal = () => {
    setNewUser({ id: "", name: "", assignedBy: "", role: "" });
    setShowModal(true);
  };

  return (
    <div className="relative flex-1 bg-gray-100 p-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                Status
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
                Assigned By
              </th>
              <th scope="col" className="relative px-4 py-2">
                <span className="sr-only">Action</span>
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

            {users.data?.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                  {user.id}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {user.first_name} {user.last_name}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {"Role"}
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  {/* <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.status === "Good"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status} 
                    </span>*/}
                  Nyan
                </td>
                <td
                  className="whitespace-nowrap px-4 py-2 text-sm text-gray-500"
                  suppressHydrationWarning
                >
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {""}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">
                    delete
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="absolute bottom-0 right-0 rounded bg-blue-600 px-4 py-1 text-white hover:bg-pink-600"
        onClick={openModal}
      >
        Create New User
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Create New User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateUser();
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">ID</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newUser.id}
                  onChange={(e) =>
                    setNewUser({ ...newUser, id: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Role</label>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  required
                >
                  <option value="">Select Role</option>
                  //Add role here
                  <option value="My Goat">My Goat</option>
                  <option value="My Goat">My Love</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Assigned By</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newUser.assignedBy}
                  onChange={(e) =>
                    setNewUser({ ...newUser, assignedBy: e.target.value })
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

export default UserTable;
