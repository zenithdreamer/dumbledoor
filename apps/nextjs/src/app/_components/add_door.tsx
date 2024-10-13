import React from "react";

import type { RouterOutputs } from "@dumbledoor/door-api";

import { DoorTRPCReactProvider, trpc } from "~/trpc/react";

const Card: React.FC = () => {
  const door = trpc.door.admin.getAllDoors.useQuery();
  const createDoor = trpc.door.admin.create.useMutation();
  const deleteDoor = trpc.door.admin.deleteDoor.useMutation();
  const updateDoor = trpc.door.admin.editDoor.useMutation();

  const [showModal, setShowModal] = React.useState(false);
  const [editDoorData, setEditDoorData] = React.useState<
    RouterOutputs["admin"]["getAllDoors"][0] | null
  >(null);
  const [newDoor, setNewDoor] = React.useState({
    name: "",
    accessLevel: 0,
  });

  const handleAddDoor = () => {
    setShowModal(true);
    setNewDoor({
      name: "",
      accessLevel: 0,
    });
  };

  const handleCreateDoor = async () => {
    await createDoor.mutateAsync(newDoor);
    void door.refetch();
    setShowModal(false);
  };

  const handleDeleteDoor = async (doorId: string) => {
    await deleteDoor.mutateAsync(doorId);
    void door.refetch();
  };

  const handleEditDoor = (door: RouterOutputs["admin"]["getAllDoors"][0]) => {
    setEditDoorData(door);
    setNewDoor({
      name: door.name,
      accessLevel: door.access_level,
    });
    setShowModal(true);
  };

  const doEditDoor = async () => {
    if (!editDoorData) return;

    await updateDoor.mutateAsync({
      id: editDoorData.id,
      name: newDoor.name,
      accessLevel: newDoor.accessLevel,
    });

    setShowModal(false);
    setEditDoorData(null);
    void door.refetch();
  };

  return (
    <div className="container relative mx-auto p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {door.isPending && (
          <div className="flex w-full items-center justify-center py-8">
            <svg
              className="h-8 w-8 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zM2 12a10 10 0 0110-10V0C5.373 0 0 5.373 0 12h2z"
              ></path>
            </svg>
          </div>
        )}

        {door.error && (
          <div className="flex w-full items-center justify-center py-8">
            <div className="mx-auto w-full max-w-lg rounded-lg bg-red-100 p-4 text-center text-red-700">
              <svg
                className="mr-2 inline h-6 w-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 5.636a9 9 0 00-12.728 0M9 11l-2 2-2-2m2 2l2-2m2 4l2-2m-2 2l2-2m4-6l2 2m-2-2l2 2m2 4l2 2m-2-2l2-2"
                />
              </svg>
              <span>{door.error.message}</span>
            </div>
          </div>
        )}

        {door.data?.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="mx-auto w-full max-w-lg rounded-lg bg-yellow-100 p-4 text-center text-yellow-700">
              <svg
                className="mr-2 inline h-6 w-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 12H6"
                />
              </svg>
              <span>No doors found</span>
            </div>
          </div>
        )}

        {door.isSuccess &&
          door.data.map((door) => (
            <div
              key={door.id}
              className="relative overflow-hidden rounded-lg border shadow-lg"
            >
              <div className="rounded-t-lg bg-gray-200 p-2">
                <div className="flex h-80 w-full flex-col justify-center rounded-lg border-2 border-gray-500 bg-gray-300 p-4 text-black">
                  <div className="mb-2 flex h-28 items-center justify-center">
                    <div
                      className={`rounded-t-lg ${
                        door.access_level === 0
                          ? "bg-[#B7E0FF]"
                          : door.access_level === 1
                            ? "bg-[#F3C623]"
                            : door.access_level === 2
                              ? "bg-[#EC8305]"
                              : door.access_level === 3
                                ? "bg-[#C92E2E]"
                                : ""
                      }`}
                    >
                      <img
                        src="/images/door-logo4.png"
                        className="w-48 object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col justify-center bg-gray-200 p-4 text-black">
                <div>
                  <div className="absolute right-3">
                    <button
                      onClick={() => handleEditDoor(door)}
                      className="text-3xl"
                    >
                      +
                    </button>
                  </div>
                  <h2 className="mb-1 text-3xl font-bold">{door.name}</h2>
                </div>
                <p className="text-lg">DID: {door.id}</p>
                <p>Access Level: {door.access_level}</p>
                <p>
                  Created At: {new Date(door.created_at).toLocaleDateString()}
                </p>
                <p>
                  Updated At: {new Date(door.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-200 p-4">
                <button
                  className="w-full rounded-lg bg-red-400 py-2 text-white hover:bg-red-500"
                  onClick={() => handleDeleteDoor(door.id)}
                >
                  Delete this door
                </button>
              </div>
            </div>
          ))}
      </div>

      <button
        className="fixed bottom-16 right-6 rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700"
        aria-label="Add new door"
        onClick={() => handleAddDoor()}
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">
              {editDoorData ? "Edit Door" : "Create New Door"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editDoorData) {
                  void doEditDoor();
                } else {
                  void handleCreateDoor();
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newDoor.name}
                  onChange={(e) =>
                    setNewDoor({ ...newDoor, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Access Level</label>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={newDoor.accessLevel}
                  onChange={(e) =>
                    setNewDoor({
                      ...newDoor,
                      accessLevel: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  <option value={0}>Access level 0</option>
                  <option value={1}>Access level 1</option>
                  <option value={2}>Access level 2</option>
                  <option value={3}>Access level 3</option>
                </select>
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
                  {editDoorData ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CardWithTRPC() {
  return (
    <DoorTRPCReactProvider>
      <Card />
    </DoorTRPCReactProvider>
  );
}
