import React, { useEffect, useState } from "react";

import type { RouterOutputs } from "@dumbledoor/access-api";
import type { RouterOutputs as DoorRouterOutputs } from "@dumbledoor/door-api";
import type { RouterOutputs as UserRouterOutputs } from "@dumbledoor/user-api";

import {
  AccessTRPCReactProvider,
  DoorTRPCReactProvider,
  trpc,
  UserTRPCReactProvider,
} from "~/trpc/react";

interface SelectedDoor {
  id: string;
  //name: string;
  accessLevel: number;
}

interface SelectedUser {
  id: string;
  //username: string;
}

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

  const [selectedDoors, setSelectedDoors] = useState<SelectedDoor[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);

  const handleCreateRole = async () => {
    await createRole.mutateAsync({
      name: newRole.name,
      description: newRole.description,
      // Send selected doors and users if needed in your backend
    });
    setShowModal(false);
    void roles.refetch();
  };

  const handleEditRole = async () => {
    if (!editRole) return;
    await updateRole.mutateAsync({
      id: editRole.id,
      name: newRole.name,
      description: newRole.description,
      // Send selected doors and users if needed in your backend
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
    setSelectedDoors([]);
    setSelectedUsers([]);
    setShowModal(true);
  };

  const openEditModal = (role: RouterOutputs["admin"]["getRoles"][0]) => {
    setEditRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
    });
    setSelectedDoors(
      role.role_doors.map((door) => ({
        id: door.door_id,
        //name: door.door_name,
        accessLevel: door.granted_access_level,
      })),
    );
    setSelectedUsers(
      role.role_users.map((user) => ({
        id: user.user_id,
        //username: user.username,
      })),
    );
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
              <div className="mb-4 ">
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
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {selectedDoors.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center">
                          No doors
                        </td>
                      </tr>
                    )}

                    {selectedDoors.map((door, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          {/* {door.name} */} Door Name
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          {door.accessLevel}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          <button
                            onClick={() =>
                              setSelectedDoors((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <div className="mb-4 flex w-full justify-between">
                  <div className="flex w-full ">
                    <DoorSelectWithTRPC
                      ignoreIds={selectedDoors.map((door) => door.id)}
                      onChange={(door) => {
                        setSelectedDoors((prev) => [...prev, door]);
                      }}
                    />
                    <button
                      type="button"
                      className="ml-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
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
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {selectedUsers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center">
                          No users
                        </td>
                      </tr>
                    )}

                    {selectedUsers.map((user, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          {/* {user.username} */} User Name
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          {user.id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          <button
                            onClick={() =>
                              setSelectedUsers((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <div className="mb-4 flex w-full justify-between">
                  <div className="flex w-full ">
                    <UserSelectWithTRPC
                      ignoreIds={selectedUsers.map((user) => user.id)}
                      onChange={(user) => {
                        setSelectedUsers((prev) => [...prev, user]);
                      }}
                    />
                    <button
                      type="button"
                      className="ml-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
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

const UserSelect: React.FC<{
  ignoreIds?: string[];
  onChange: (user: SelectedUser) => void;
}> = (props) => {
  const users = trpc.user.admin.getUsers.useQuery();
  const [selectedUser, setSelectedUser] = useState<string>("");

  const [userList, setUserList] = useState<
    UserRouterOutputs["admin"]["getUsers"]
  >([]);

  useEffect(() => {
    if (users.data) {
      if (props.ignoreIds) {
        const filteredUsers = users.data.filter(
          (user) => !(props.ignoreIds ?? []).includes(user.id),
        );
        setUserList(filteredUsers);
      } else {
        setUserList(users.data);
      }
    }
  }, [props.ignoreIds, users.data]);

  return (
    <select
      className="w-full rounded border px-3 py-2"
      value={selectedUser}
      onChange={(e) => {
        const selected = userList.find((user) => user.id === e.target.value);
        if (selected) {
          props.onChange({
            id: selected.id,
            //username: selected.username,
          });
        }
        setSelectedUser(e.target.value);
      }}
    >
      <option value={""}>Select a user</option>

      {userList.map((user) => (
        <option key={user.id} value={user.id}>
          {user.first_name} {user.last_name}
        </option>
      ))}
    </select>
  );
};

const UserSelectWithTRPC: React.FC<{
  ignoreIds?: string[];
  onChange: (user: SelectedUser) => void;
}> = (props) => {
  return (
    <UserTRPCReactProvider>
      <UserSelect onChange={props.onChange} ignoreIds={props.ignoreIds} />
    </UserTRPCReactProvider>
  );
};

const DoorSelect: React.FC<{
  ignoreIds?: string[];
  onChange: (door: SelectedDoor) => void;
}> = (props) => {
  const doors = trpc.door.admin.getAllDoors.useQuery();
  const [selectedDoor, setSelectedDoor] = useState<string>("");

  const [doorList, setDoorList] = useState<
    DoorRouterOutputs["admin"]["getAllDoors"]
  >([]);

  useEffect(() => {
    if (doors.data) {
      if (props.ignoreIds) {
        const filteredDoors = doors.data.filter(
          (door) => !(props.ignoreIds ?? []).includes(door.id),
        );
        setDoorList(filteredDoors);
      } else {
        setDoorList(doors.data);
      }
    }
  }, [props.ignoreIds, doors.data]);

  return (
    <select
      className="w-full rounded border px-3 py-2"
      value={selectedDoor}
      onChange={(e) => {
        const selected = doorList.find((door) => door.id === e.target.value);
        if (selected) {
          props.onChange({
            id: selected.id,
            //name: selected.name,
            accessLevel: selected.access_level,
          });
        }
        setSelectedDoor(e.target.value);
      }}
    >
      <option value={""}>Select a door</option>

      {doorList.map((door) => (
        <option key={door.id} value={door.id}>
          {door.name}
        </option>
      ))}
    </select>
  );
};

const DoorSelectWithTRPC: React.FC<{
  ignoreIds?: string[];
  onChange: (door: SelectedDoor) => void;
}> = (props) => {
  return (
    <DoorTRPCReactProvider>
      <DoorSelect onChange={props.onChange} ignoreIds={props.ignoreIds} />
    </DoorTRPCReactProvider>
  );
};
