"use client";

import React, { useState } from 'react';

interface Client {
  id: string;
  name: string;
  kidsSports: string[];
  hobbies: string[];
  placesVisited: string[];
  lastMeeting: string;
  lastUpdated: string;
}

export default function GuidesPage() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Client2',
      kidsSports: [],
      hobbies: ['Travel'],
      placesVisited: ['Iceland'],
      lastMeeting: 'Needs project report by Tuesday EOD',
      lastUpdated: '3/12/2023, 8:00:37 PM'
    },
    {
      id: '2',
      name: 'Pramod',
      kidsSports: ['Tennis'],
      hobbies: ['Film'],
      placesVisited: ['Alaska'],
      lastMeeting: 'Test, test, test',
      lastUpdated: '3/12/2023, 7:59:44 PM'
    }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [expandedNote, setExpandedNote] = useState<string | null>('1');
  const [newClient, setNewClient] = useState({
    name: '',
    kidsSports: '',
    hobbies: '',
    placesVisited: '',
    lastMeeting: ''
  });

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const handleAddClient = () => {
    if (!newClient.name.trim()) return;
    
    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      kidsSports: newClient.kidsSports ? newClient.kidsSports.split(',').map(s => s.trim()) : [],
      hobbies: newClient.hobbies ? newClient.hobbies.split(',').map(s => s.trim()) : [],
      placesVisited: newClient.placesVisited ? newClient.placesVisited.split(',').map(s => s.trim()) : [],
      lastMeeting: newClient.lastMeeting,
      lastUpdated: new Date().toLocaleString()
    };
    
    setClients([...clients, client]);
    setNewClient({
      name: '',
      kidsSports: '',
      hobbies: '',
      placesVisited: '',
      lastMeeting: ''
    });
    setShowModal(false);
  };

  const toggleNote = (id: string) => {
    setExpandedNote(expandedNote === id ? null : id);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">World Clock Guides</h1>
      
      <div className="space-y-8">
        {/* Tips & Tricks */}
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Tips & Tricks</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Keyboard Shortcuts</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>↑/↓: Navigate in 30-minute increments</li>
                <li>Page Up/Down: Navigate hours</li>
                <li>Home: Jump to current time</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Pro Tips</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Hover over DST indicators for transition details</li>
                <li>Use AI Scheduler for optimal meeting times</li>
                <li>Check analytics for team productivity insights</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Personal Notes Section */}
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <div className="flex flex-wrap -mx-2">
            {/* First column with client notes */}
            <div className="w-full md:w-1/5 px-2 mb-4">
              <div className="bg-gray-900/30 border border-gray-700 rounded-lg h-full p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-2">★</span>
                    <h3 className="text-lg font-medium">Personal Notes</h3>
                  </div>
                  <span className={`transform transition-transform ${expandedNote === '1' ? 'rotate-0' : 'rotate-180'}`}>▲</span>
                </div>

                <div className="mt-4">
                  {clients.map(client => (
                    <div key={client.id} className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg">{client.name}</h4>
                        <div>
                          <button className="text-blue-400 text-sm mr-2">Edit</button>
                          <button 
                            className="text-red-400 text-sm"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-gray-300 text-sm">
                        {client.kidsSports.length > 0 && (
                          <div className="flex items-start">
                            <span className="text-yellow-400 mr-2">🏅</span>
                            <span>Kids' Sports: {client.kidsSports.join(', ')}</span>
                          </div>
                        )}
                        {client.hobbies.length > 0 && (
                          <div className="flex items-start">
                            <span className="text-pink-400 mr-2">🎭</span>
                            <span>Hobbies: {client.hobbies.join(', ')}</span>
                          </div>
                        )}
                        {client.placesVisited.length > 0 && (
                          <div className="flex items-start">
                            <span className="text-cyan-400 mr-2">🌎</span>
                            <span>Places Visited: {client.placesVisited.join(', ')}</span>
                          </div>
                        )}
                        {client.lastMeeting && (
                          <div className="flex items-start">
                            <span className="text-gray-400 mr-2">📝</span>
                            <span>Last Meeting: {client.lastMeeting}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Last updated: {client.lastUpdated}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center mt-4"
                    onClick={() => setShowModal(true)}
                  >
                    <span className="mr-2">+</span>
                    Add Client
                  </button>
                </div>
              </div>
            </div>

            {/* Remaining columns (empty) */}
            {[1, 2, 3, 4].map((colIndex) => (
              <div key={colIndex} className="w-full md:w-1/5 px-2 mb-4">
                <div className="bg-gray-900/30 border border-gray-700 rounded-lg h-full p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-2">★</span>
                      <h3 className="text-lg font-medium">Personal Notes</h3>
                    </div>
                    <span className="transform rotate-180">▲</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Add New Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Client Name *</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1">Kids' Sports (comma-separated)</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  placeholder="Basketball, Soccer, Tennis"
                  value={newClient.kidsSports}
                  onChange={(e) => setNewClient({...newClient, kidsSports: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1">Hobbies (comma-separated)</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  placeholder="Photography, Travel, Reading"
                  value={newClient.hobbies}
                  onChange={(e) => setNewClient({...newClient, hobbies: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1">Places Visited (comma-separated)</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  placeholder="France, Japan, Australia"
                  value={newClient.placesVisited}
                  onChange={(e) => setNewClient({...newClient, placesVisited: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1">Last Meeting Notes</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  rows={3}
                  placeholder="Important details from your last meeting"
                  value={newClient.lastMeeting}
                  onChange={(e) => setNewClient({...newClient, lastMeeting: e.target.value})}
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-2">
              <button 
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={handleAddClient}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 