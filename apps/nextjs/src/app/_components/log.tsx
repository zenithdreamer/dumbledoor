import React from "react";

import { LogTRPCReactProvider, trpc } from "~/trpc/react";

const LogTable = () => {
  const log = trpc.log.admin.getAllLogs.useQuery();

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {log.isSuccess && log.data.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="whitespace-nowrap px-6 py-4 text-sm text-gray-900"
                >
                  No logs found
                </td>
              </tr>
            )}
            {log.isError && (
              <tr>
                <td
                  colSpan={3}
                  className="whitespace-nowrap px-6 py-4 text-sm text-gray-900"
                >
                  {log.error.message}
                </td>
              </tr>
            )}
            {log.isSuccess &&
              log.data.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {log.user_id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">
                    {log.action}
                  </td>
                  <td
                    className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                    suppressHydrationWarning
                  >
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function LogTableWithTrpc() {
  return (
    <LogTRPCReactProvider>
      <LogTable />
    </LogTRPCReactProvider>
  );
}
