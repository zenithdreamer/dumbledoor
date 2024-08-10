import React, { useState } from "react";

const sample_data = [
  {
    id: "#1",
    name: "Dtto",
    status: "Good",
    role: "My Goat",
    createDate: "8/10/2024",
    assignedBy: "Me",
  },
  {
    id: "#2",
    name: "Aqua",
    status: "Bad",
    role: "My Goat",
    createDate: "8/10/2024",
    assignedBy: "Me",
  },
];

const UserTable: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ id: "", name: "", assignedBy: "", role: "" });

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
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ID
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Create Date
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Assigned By
              </th>
              <th scope="col" className="relative px-4 py-2">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sample_data.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">{user.id}</td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">{user.name}</td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">{user.role}</td>
                <td className="whitespace-nowrap px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.status === "Good" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">{user.createDate}</td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">{user.assignedBy}</td>
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
        className="absolute bottom-0 right-0 bg-blue-600 text-white px-4 py-1 rounded hover:bg-pink-600"
        onClick={openModal}
      >
        Create New User
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
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
                  className="w-full px-3 py-2 border rounded"
                  value={newUser.id}
                  onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Role</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
				  //Add role here
                  <option value="My Goat">My Goat</option>

                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Assigned By</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={newUser.assignedBy}
                  onChange={(e) => setNewUser({ ...newUser, assignedBy: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
