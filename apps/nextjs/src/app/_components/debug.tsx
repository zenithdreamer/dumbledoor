import React from "react";

import { trpc, UserTRPCReactProvider } from "~/trpc/react";

const Debug = () => {
  return (
    <div>
      <h1>Debug</h1>
      <RemoveInvalidAllUserButtonWithTrpc />
    </div>
  );
};

const RemoveInvalidAllUserButton: React.FC = () => {
  const removeAllInvalidUsers = trpc.user.admin.purgeInvalidUsers.useMutation();
  return (
    <div className="p-4">
      <button
        className="w-full rounded-lg bg-pink-600 py-2 text-white hover:bg-pink-700"
        onClick={async () => {
          try {
            const data = await removeAllInvalidUsers.mutateAsync();
            alert(
              data ? "All invalid users removed" : "No invalid users found",
            );
          } catch (error) {
            console.error(error);
            alert(error);
          }
        }}
      >
        Remove all invalid users
      </button>
    </div>
  );
};

const RemoveInvalidAllUserButtonWithTrpc: React.FC = () => {
  return (
    <UserTRPCReactProvider>
      <RemoveInvalidAllUserButton />
    </UserTRPCReactProvider>
  );
};

export default Debug;
