import React from "react";

const sampleuserdata = [
  {
    id: "1",
    name: "Dtto",
    status: "Good",
    role: "My Goat",
    createDate: "8/10/2024",
    assignedBy: "Me",
  },
  {
    id: "2",
    name: "Aqua",
    status: "Bad",
    role: "My Goat",
    createDate: "8/10/2024",
    assignedBy: "Me",
  },
  {
    id: "3",
    name: "Ayame",
    status: "Good",
    role: "My Love",
    createDate: "8/10/2024",
    assignedBy: "Me",
  },
];

const samplecarddata = [
  {
    id: "1",
    name: "Dtto",
    role: "My Goat",
    level: 2,
  },
  {
    id: "2",
    name: "Aqua",
    role: "My Goat",
    level: 3,
  },
  {
    id: "3",
    name: "Ayame",
    role: "My Love",
    level: 1,
  },
];

const Card: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {samplecarddata.map((card) => {
          const userData = sampleuserdata.find((user) => user.id === card.id);
          return (
            <div key={card.id} className="border rounded-lg overflow-hidden shadow-lg">
              <div className="h-48 w-full bg-yellow-500 p-4 flex flex-col justify-center text-black">
                <h2 className="text-xl font-semibold">{card.name}</h2>
                <p>{card.role}</p>
                <p>{card.id}</p>
                <p>Level: {card.level}</p>
              </div>

              {userData && (
                <div className="p-4 bg-gray-100">
                  <h2 className="text-xl font-semibold">{userData.name}</h2>
                  <p className="text-gray-600">{userData.role}</p>
                  <p className="text-gray-500">Status: {userData.status}</p>
                  <p className="text-gray-500">Assigned By: {userData.assignedBy}</p>
                  <p className="text-gray-500">Create Date: {userData.createDate}</p>
                </div>
              )}

              <div className="p-4">
                <button className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700">
                  Select this card
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Card;
