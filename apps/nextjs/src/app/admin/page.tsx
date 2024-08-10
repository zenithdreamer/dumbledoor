"use client";

import React, { useState } from "react";

import Card from "../_components/card";
import Edit_access from "../_components/edit-access";
import Log from "../_components/log";
import Sidebar from "../_components/sidebar";
import User from "../_components/user";

const App: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState("user");

  const renderContent = () => {
    switch (selectedSection) {
      case "user":
        return <User />;
      case "card":
        return <Card />;
      case "edit-access":
        return <Edit_access />;
      case "log":
        return <Log />;
      default:
        return <div>Select an option from the sidebar.</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <div className="h-full w-[15%] bg-pink-700">
        <Sidebar onSelect={setSelectedSection} />
      </div>
      <div className="flex-1 p-4">{renderContent()}</div>
    </div>
  );
};

export default App;
