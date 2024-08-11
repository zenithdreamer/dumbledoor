import React from "react";

interface SidebarProps {
  onSelect: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelect }) => {
  return (
    <div className="h-screen  bg-pink-700 text-white">
      <div className="p-6">
        <h2 className="text-2xl font-semibold">Admin</h2>
      </div>
      <ul className="mt-6 space-y-2">
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => {
            onSelect("users");
          }}
        >
          <span className="text-sm font-medium">User</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => {
            onSelect("roles");
          }}
        >
          <span className="text-sm font-medium">Roles</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => onSelect("card")}
        >
          <span className="text-sm font-medium">Card</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => onSelect("door")}
        >
          <span className="text-sm font-medium">Door</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => onSelect("edit-access")}
        >
          <span className="text-sm font-medium">Edit Access</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => onSelect("log")}
        >
          <span className="text-sm font-medium">Log</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => onSelect("log-out")}
        >
          <span className="text-sm font-medium">Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
