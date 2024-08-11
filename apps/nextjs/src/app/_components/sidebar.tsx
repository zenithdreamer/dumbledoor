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
          <span className="text-sm font-medium">Users</span>
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
          onClick={() => onSelect("cards")}
        >
          <span className="text-sm font-medium">Cards</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => onSelect("doors")}
        >
          <span className="text-sm font-medium">Doors</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => onSelect("log")}
        >
          <span className="text-sm font-medium">Log</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => onSelect("demo")}
        >
          <span className="text-sm font-medium">Demo</span>
        </li>
        <li
          className="sidebar-item flex items-center px-6 py-3 hover:bg-pink-600"
          onClick={() => onSelect("debug")}
        >
          <span className="text-sm font-medium">Debug</span>
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
