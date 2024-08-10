"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "../_components/card";
import Edit_access from "../_components/edit-access";
import Log from "../_components/log";
import Sidebar from "../_components/sidebar";
import User from "../_components/user";
import Door from "../_components/add_door"


const App: React.FC = () => {
	const [selectedSection, setSelectedSection] = useState("user");
	const router = useRouter();
	//I will do this for now
	useEffect(() => {
		if (selectedSection === "log-out") {
			router.push("/login");
		}
	}, [selectedSection, router]);

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
			case "door":
				return <Door />;

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
