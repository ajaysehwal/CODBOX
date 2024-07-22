import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Input } from "../ui/input";

export default function PreviousNotes() {
  const [searchTerm, setSearchTerm] = useState("");

  const notes = [
    { id: 1, title: "Meeting Notes", date: "2024-07-18", category: "Work" },
    { id: 2, title: "Project Ideas", date: "2024-07-17", category: "Personal" },
    { id: 3, title: "Shopping List", date: "2024-07-16", category: "Personal" },
    { id: 4, title: "Meeting Notes", date: "2024-07-18", category: "Work" },
    { id: 5, title: "Project Ideas", date: "2024-07-17", category: "Personal" },
    { id: 6, title: "Shopping List", date: "2024-07-16", category: "Personal" },
  ];

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-gradient-to-b from-blue-100 to-blue-300 p-4 flex flex-col">
      <h2 className="text-1xl font-bold mb-4 text-gray-800 border-b-2 border-gray-500">
        Previous Notes
      </h2>
      <div className="relative mb-4">
        <Input
          className="w-full h-10 pl-10 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      <ul className="flex-grow w-full h-[490px] overflow-y-auto space-y-3 pr-2 backdrop-blur-sm scrollbar-thin scrollbar-thumb-blue-500 hover:scrollbar-thumb-blue-700 transition-all duration-200 scrollbar-track-blue-100">
        {filteredNotes.map((note) => (
          <li
            key={note.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <Link href={`/notes/${note.id}`} className="block p-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-500">{note.date}</p>
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                    {note.category}
                  </span>
                </div>
                <ChevronRight className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
