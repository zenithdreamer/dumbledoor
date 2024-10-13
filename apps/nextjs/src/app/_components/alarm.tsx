import { useEffect, useState } from "react";

import {
  AlarmTRPCReactProvider,
  DoorTRPCReactProvider,
  trpc,
} from "~/trpc/react";

const AlarmPage: React.FC = () => {
  const [currentAlarm, setCurrentAlarm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newAlarm, setNewAlarm] = useState({ name: "", doorId: "" });

  const { data: alarms, refetch: refetchAlarms } =
    trpc.alarm.admin.getAllAlarms.useQuery();

  const createAlarm = trpc.alarm.admin.createAlarm.useMutation({
    onSuccess: () => {
      refetchAlarms();
    },
  });

  const deleteAlarm = trpc.alarm.admin.deleteAlarm.useMutation({
    onSuccess: () => {
      refetchAlarms();
    },
  });

  const handleDeleteAlarm = async (alarm: any) => {
    setCurrentAlarm(alarm.id);
    try {
      await deleteAlarm.mutateAsync(alarm.id);
      console.log("Deleted alarm:", alarm);
    } catch (error) {
      console.error("Failed to delete alarm:", error);
    }
  };

  const handleAddAlarm = () => {
    setShowModal(true);
  };

  const handleCreateAlarm = async () => {
    try {
      const newAlarmData = {
        alarmname: newAlarm.name,
        doorid: newAlarm.doorId,
      };

      await createAlarm.mutateAsync(newAlarmData);

      setShowModal(false);
      console.log("Created new alarm:", newAlarmData);
    } catch (error) {
      console.error("Failed to create alarm:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {alarms?.map((alarm) => (
          <div
            key={alarm.id}
            className="rounded-lg bg-yellow-500 p-4 shadow-md"
          >
            <h2 className="text-xl font-bold">{alarm.name}</h2>
            <p className="text-gray-800">Door: {alarm.name}</p>
            <p className="text-gray-800">Id: {alarm.id}</p>
            <button
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              onClick={() => handleDeleteAlarm(alarm)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Button to Add New Alarm */}
      <button
        className="fixed bottom-16 right-6 rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700"
        onClick={handleAddAlarm}
      >
        Add New Alarm
      </button>

      {/* Modal for Creating New Alarm */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Create New Alarm</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAlarm();
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Alarm Name</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newAlarm.name}
                  onChange={(e) =>
                    setNewAlarm({ ...newAlarm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Door</label>
                <DoorSelectWithTRPC
                  onChange={(doorId) => setNewAlarm({ ...newAlarm, doorId })}
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

const DoorSelect: React.FC<{
  onChange: (doorId: string) => void;
}> = (props) => {
  const { data: doors } = trpc.door.admin.getAllDoors.useQuery();
  const [selectedDoor, setSelectedDoor] = useState("");

  return (
    <select
      className="w-full rounded border px-3 py-2"
      value={selectedDoor}
      onChange={(e) => {
        setSelectedDoor(e.target.value);
        props.onChange(e.target.value);
      }}
    >
      <option value="">Select a door</option>
      {doors?.map((door) => (
        <option key={door.id} value={door.id}>
          {door.name}
        </option>
      ))}
    </select>
  );
};

const DoorSelectWithTRPC: React.FC<{
  onChange: (doorId: string) => void;
}> = (props) => {
  return (
    <DoorTRPCReactProvider>
      <DoorSelect onChange={props.onChange} />
    </DoorTRPCReactProvider>
  );
};

const AlarmPageWithTRPC = () => (
  <AlarmTRPCReactProvider>
    <AlarmPage />
  </AlarmTRPCReactProvider>
);

export default AlarmPageWithTRPC;
