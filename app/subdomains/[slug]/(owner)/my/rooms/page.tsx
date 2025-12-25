'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid

export default function RoomsDashboard() {
  const [projectName, setProjectName] = useState('');
  const router = useRouter();

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) return;

    // Create a URL-friendly slug from project name + unique ID
    const roomId = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().slice(0, 4)}`;
    
    // Redirect to the live room
    router.push(`/my/rooms/${roomId}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-2">Virtual Walkthroughs</h1>
      <p className="text-zinc-400 mb-8">Start a live room and invite your client to view the property.</p>

      <form onSubmit={handleCreateRoom} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-300">Project Name</label>
          <input
            type="text"
            placeholder="e.g. 123 Maple St Exterior"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition"
        >
          Create Live Room
        </button>
      </form>
    </div>
  );
}