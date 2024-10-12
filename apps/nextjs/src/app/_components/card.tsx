import { useState } from "react";
import { useRouter } from "next/navigation";

import type { RouterOutputs } from "@dumbledoor/card-api";

import {
  CardTRPCReactProvider,
  trpc,
  UserTRPCReactProvider,
} from "~/trpc/react";

const Card: React.FC = () => {
  const cards = trpc.card.admin.getAllCards.useQuery();
  const createCard = trpc.card.admin.create.useMutation();
  const updateCard = trpc.card.admin.editCard.useMutation();
  const deleteCard = trpc.card.admin.deleteCard.useMutation();
  
  const [showModal, setShowModal] = useState(false);
  const [newCard, setNewCard] = useState({
    name: "",
    userId: "",
  });

  const [editCardData, setEditCardData] = useState<
    RouterOutputs["admin"]["getAllCards"][0] | null
  >(null);

  const handleAddCard = () => {
    setEditCardData(null);
    setNewCard({ name: "", userId: "" });
    setShowModal(true);
  };

  const [currentCard, setCurrentCard] = useState("");
  const router = useRouter();

  const handleSelectCard = (card: RouterOutputs["admin"]["getAllCards"][0]) => {
    setCurrentCard(card.id); // Update the state with the selected card's ID

    console.log("Selected card data:", card.id);

    // Navigate to the homepage and pass the card ID as a query parameter
    router.push(`/?retrive_card=${card.id}`);
  };

  const handleEditCard = (card: RouterOutputs["admin"]["getAllCards"][0]) => {
    setEditCardData(card);
    setNewCard({
      name: card.name,
      userId: card.user.id,
    });
    setShowModal(true);
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      await deleteCard.mutateAsync(id);
      void cards.refetch();
    } catch (error) {
      console.error("Failed to delete card:", error);
    }
  };

  const handleCreateCard = async () => {
    try {
      await createCard.mutateAsync({
        name: newCard.name,
        userId: newCard.userId,
      });
      setShowModal(false);
      void cards.refetch();
    } catch (error) {
      console.error("Failed to create card:", error);
    }
  };

  const handleUpdateCard = async () => {
    if (!editCardData) return;

    try {
      await updateCard.mutateAsync({
        id: editCardData.id,
        name: newCard.name,
        userId: newCard.userId,
      });
      setShowModal(false);
      void cards.refetch();
    } catch (error) {
      console.error("Failed to update card:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {cards.isSuccess &&
          cards.data.map((card) => (
            <div
              key={card.id}
              className="overflow-hidden rounded-lg border shadow-lg"
            >
              <div className={`p-2 ${
                  card.access.access_level === 0 ? 'bg-gradient-to-b from-[#B7E0FF] from-55% via-white via-60% to-white to-90%' : 
                  card.access.access_level === 1 ? 'bg-gradient-to-b from-[#F3C623] from-55% via-white via-60% to-white to-90%' : 
                  card.access.access_level === 2 ? 'bg-gradient-to-b from-[#EC8305] from-55% via-white via-60% to-white to-90%' : 
                  card.access.access_level === 3 ? 'bg-gradient-to-b from-[#C92E2E] from-55% via-white via-60% to-white to-90%' : 
                  ''
                }`}>
                <div className="flex h-56 w-full flex-col justify-center bg-transparent text-black border-2 border-gray-500 rounded-lg">
                  <div className="flex justify-between items-center m-1">
                    <div>
                      <p className="text-4xl font-bold mb-2">Dumble</p>
                      <p className="text-4xl font-bold mb-2">Door</p>
                    </div>
                    <img src="/images/triangle.png" className="object-contain h-16 w-16 mt-16" />
                  </div>
                  <div className="py-3 rounded-b-md m-1">
                    <h2 className="text-2xl font-bold">{card.name}</h2>
                    <p className="text-lg mt-1">CID: {card.id}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-200 p-4">
                <h2 className="text-xl font-semibold">
                  {card.user.first_name} {card.user.last_name}
                </h2>
                <p>{card.access.role?.name ?? "No role"}</p>
                <p className="text-gray-500">Access Level: {card.access.access_level}</p>
                <p className="text-gray-500">
                  Assigned By:{" "}
                  {card.assigned_by_user
                    ? `${card.assigned_by_user.first_name} ${card.assigned_by_user.last_name}`
                    : card.assigned_by}
                </p>
                <p className="text-gray-500" suppressHydrationWarning>
                  Create Date: {new Date(card.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-200 p-4">
                <button
                  className="mb-2 w-full rounded-lg py-2 text-gray-900 bg-[#F7B5CA] hover:bg-[#F0A8D0]"
                  onClick={() => handleSelectCard(card)}
                >
                  Select this card
                </button>
                <button
                  className="w-full rounded-lg py-2 text-gray-900 bg-[#F7B5CA] hover:bg-[#F0A8D0]"
                  onClick={() => handleEditCard(card)}
                >
                  Edit
                </button>
                <button
                  className="mt-2 w-full rounded-lg bg-red-400 py-2 text-white hover:bg-red-500"
                  onClick={() => {
                    void handleDeleteCard(card.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      <button
        className="fixed bottom-16 right-6 rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700"
        aria-label="Add new card"
        onClick={handleAddCard}
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
              {editCardData ? "Edit Card" : "Create New Card"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editCardData) {
                  void handleUpdateCard();
                } else {
                  void handleCreateCard();
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newCard.name}
                  onChange={(e) =>
                    setNewCard({ ...newCard, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">User</label>
                <UserSelectWithTRPC
                  onChange={(userId) => setNewCard({ ...newCard, userId })}
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
                  {editCardData ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function CardWithTrpc() {
  return (
    <CardTRPCReactProvider>
      <Card />
    </CardTRPCReactProvider>
  );
}

const UserSelect: React.FC<{
  onChange: (role: string) => void;
}> = (props) => {
  const users = trpc.user.admin.getUsers.useQuery();
  const [selectedUser, setSelectedUser] = useState("");

  return (
    <select
      className="w-full rounded border px-3 py-2"
      value={selectedUser}
      onChange={(e) => {
        setSelectedUser(e.target.value);
        props.onChange(e.target.value);
      }}
    >
      <option value={""}>Select a user</option>

      {users.isSuccess &&
        users.data.map((user) => (
          <option key={user.id} value={user.id}>
            {user.first_name} {user.last_name}
          </option>
        ))}
    </select>
  );
};

const UserSelectWithTRPC: React.FC<{
  ignoreIds?: string[];
  onChange: (user: string) => void;
}> = (props) => {
  return (
    <UserTRPCReactProvider>
      <UserSelect onChange={props.onChange} />
    </UserTRPCReactProvider>
  );
};

export default CardWithTrpc;
