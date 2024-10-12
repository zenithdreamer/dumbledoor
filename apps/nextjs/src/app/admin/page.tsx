"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Door from "../_components/add_door";
import Card from "../_components/card";
import Debug from "../_components/debug";
import Log from "../_components/log";
import Roles from "../_components/roles";
import Sidebar from "../_components/sidebar";
import Users from "../_components/users";
import HomePage from "../page";

const App: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState("user");
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (selectedSection === "log-out") {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [selectedSection, router]);

  const renderContent = () => {
    switch (selectedSection) {
      case "users":
        return <Users />;
      case "roles":
        return <Roles />;
      case "cards":
        return <Card />;
      case "debug":
        return <Debug />;
      case "log":
        return <Log />;
      case "demo":
        return <HomePage />;
      case "doors":
        return <Door />;

      default:
        // Default to users
        return <Users />;
      //return <div>Select an option from the sidebar.</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <div className="fixed h-full w-[15%] bg-[#F0A8D0]">
        <Sidebar onSelect={setSelectedSection} />
      </div>
      <div className="flex-1 p-4 ml-[15%] overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
