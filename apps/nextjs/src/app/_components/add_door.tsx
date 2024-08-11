import React from "react";

const sampleDoorData = [
  {
    id: "1",
    name: "Main Entrance",
    access_level: 2,
    created_by: "Me",
    created_at: "2024-08-10T12:00:00Z",
    updated_at: "2024-08-12T14:00:00Z",
  },
  {
    id: "2",
    name: "Side Door",
    access_level: 3,
    created_by: "Me",
    created_at: "2024-08-10T12:00:00Z",
    updated_at: "2024-08-11T10:30:00Z",
  },
  {
    id: "3",
    name: "Garage Door",
    access_level: 1,
    created_by: "Me",
    created_at: "2024-08-10T12:00:00Z",
    updated_at: "2024-08-12T08:45:00Z",
  },
];

const Card: React.FC = () => {
  return (
    <div className="relative container mx-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sampleDoorData.map((door) => (
          <div key={door.id} className="border rounded-lg overflow-hidden shadow-lg">
            <div className="h-48 w-full bg-yellow-500 p-4 flex flex-col justify-center text-black">
              <h2 className="text-xl font-semibold">{door.name}</h2>
              <p>ID: {door.id}</p>
              <p>Access Level: {door.access_level}</p>
              <p>Created By: {door.created_by}</p>
              <p>Created At: {new Date(door.created_at).toLocaleDateString()}</p>
              <p>Updated At: {new Date(door.updated_at).toLocaleDateString()}</p>
            </div>

            <div className="p-4">
              <button className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700">
                delete this door
              </button>
            </div>
          </div>
        ))}
      </div>

      
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
        aria-label="Add new door"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default Card;
