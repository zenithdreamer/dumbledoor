import React from "react";

const sample_data = [
  {
    id: "#1",
    name: "Dtto",
    status: "Good",
    createDate: "8/10/2024",
    assignedBy: "Me",
  },
  {
    id: "#2",
    name: "Aqua",
    status: "Bad",
    createDate: "8/10/2024",
    assignedBy: "Me",
  },
];

const UserTable: React.FC = () => {
  return (
    <div className="flex-1 bg-gray-100 p-8">
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
            {sample_data.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                  {user.id}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {user.name}
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.status === "Good"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {user.createDate}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {user.assignedBy}
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
    </div>
  );
};

export default UserTable;
