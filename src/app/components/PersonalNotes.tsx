"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

// Define the types for the client notes data structure
export interface ClientNote {
  id: string;
  clientName: string;
  kidsSports?: string[];
  hobbies?: string[];
  placesVisited?: string[];
  lastMeetingNotes?: string;
  customFields?: { [key: string]: string };
  lastUpdated: string;
}

// Props interface for the component
interface PersonalNotesProps {
  timezone: string;
}

export default function PersonalNotes({ timezone }: PersonalNotesProps) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timezoneNotes, setTimezoneNotes] = useState<ClientNote[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientNote | null>(null);
  
  // Form state for new/editing client
  const [formData, setFormData] = useState<Omit<ClientNote, 'id' | 'lastUpdated'>>({
    clientName: '',
    kidsSports: [],
    hobbies: [],
    placesVisited: [],
    lastMeetingNotes: '',
    customFields: {}
  });

  // Load notes for the current timezone from API
  const fetchClients = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/clients?timezone=${encodeURIComponent(timezone)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      
      const data = await response.json();
      setTimezoneNotes(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchClients();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [timezone, user, authLoading]);

  // Toggle expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Open modal to add a new client
  const handleAddClient = () => {
    setEditingClient(null);
    setFormData({
      clientName: '',
      kidsSports: [],
      hobbies: [],
      placesVisited: [],
      lastMeetingNotes: '',
      customFields: {}
    });
    setIsModalOpen(true);
  };

  // Open modal to edit an existing client
  const handleEditClient = (client: ClientNote) => {
    setEditingClient(client);
    setFormData({
      clientName: client.clientName,
      kidsSports: client.kidsSports || [],
      hobbies: client.hobbies || [],
      placesVisited: client.placesVisited || [],
      lastMeetingNotes: client.lastMeetingNotes || '',
      customFields: client.customFields || {}
    });
    setIsModalOpen(true);
  };

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle array field changes (comma-separated values)
  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setFormData(prev => ({
      ...prev,
      [name]: arrayValue
    }));
  };

  // Save client data to API
  const handleSaveClient = async () => {
    if (!formData.clientName.trim()) {
      alert('Client name is required');
      return;
    }

    if (!user) {
      alert('You must be logged in to save client data');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let response;

      if (editingClient) {
        // Update existing client
        response = await fetch(`http://localhost:3001/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData
          })
        });
      } else {
        // Create new client
        response = await fetch('http://localhost:3001/api/clients', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            timezone
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save client');
      }

      // Refresh client list
      fetchClients();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please try again.');
    }
  };

  // Delete a client
  const handleDeleteClient = async (clientId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/clients/${clientId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete client');
        }

        // Remove client from local state
        setTimezoneNotes(prev => prev.filter(client => client.id !== clientId));
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="mt-4 border border-gray-700 rounded-lg p-4 bg-gray-800">
        <p className="text-center text-gray-300">
          <a href="/login" className="text-blue-400 hover:underline">Login</a> to add personal client notes
        </p>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="mt-4 border border-gray-700 rounded-lg p-4 bg-gray-800">
        <p className="text-center text-gray-300">Loading client notes...</p>
      </div>
    );
  }

  return (
    <div className="mt-4 border border-gray-700 rounded-lg p-2 bg-gray-800 transition-all duration-300">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={toggleExpand}
      >
        <h3 className="text-sm font-medium text-gray-300 flex items-center">
          <span className="mr-2">⭐</span>
          Personal Notes
        </h3>
        <button 
          className="text-gray-400 hover:text-white transition-colors"
          aria-label={isExpanded ? "Collapse notes" : "Expand notes"}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-3">
          {timezoneNotes.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center">No clients added yet</p>
          ) : (
            timezoneNotes.map(client => (
              <div key={client.id} className="border border-gray-700 rounded-lg p-2 bg-gray-900">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-white">{client.clientName}</h4>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditClient(client)} 
                      className="text-xs text-blue-400 hover:text-blue-300"
                      aria-label={`Edit ${client.clientName}'s information`}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client.id)} 
                      className="text-xs text-red-400 hover:text-red-300"
                      aria-label={`Delete ${client.clientName}'s information`}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  {client.kidsSports && client.kidsSports.length > 0 && (
                    <p className="text-gray-300">
                      <span className="mr-2">🏅</span>
                      <span className="font-medium">Kids' Sports:</span> {client.kidsSports.join(', ')}
                    </p>
                  )}
                  
                  {client.hobbies && client.hobbies.length > 0 && (
                    <p className="text-gray-300">
                      <span className="mr-2">🎨</span>
                      <span className="font-medium">Hobbies:</span> {client.hobbies.join(', ')}
                    </p>
                  )}
                  
                  {client.placesVisited && client.placesVisited.length > 0 && (
                    <p className="text-gray-300">
                      <span className="mr-2">🌍</span>
                      <span className="font-medium">Places Visited:</span> {client.placesVisited.join(', ')}
                    </p>
                  )}
                  
                  {client.lastMeetingNotes && (
                    <p className="text-gray-300">
                      <span className="mr-2">📝</span>
                      <span className="font-medium">Last Meeting:</span> {client.lastMeetingNotes}
                    </p>
                  )}
                  
                  {client.customFields && Object.keys(client.customFields).map(key => (
                    <p key={key} className="text-gray-300">
                      <span className="mr-2">📋</span>
                      <span className="font-medium">{key}:</span> {client.customFields?.[key]}
                    </p>
                  ))}
                  
                  <p className="text-gray-500 text-xs italic">
                    Last updated: {new Date(client.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
          
          <button 
            onClick={handleAddClient}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            aria-label="Add new client"
          >
            <span className="mr-1">➕</span> Add Client
          </button>
        </div>
      )}

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingClient ? `Edit ${editingClient.clientName}` : 'Add New Client'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-300 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="kidsSports" className="block text-sm font-medium text-gray-300 mb-1">
                  Kids' Sports (comma-separated)
                </label>
                <input
                  type="text"
                  id="kidsSports"
                  name="kidsSports"
                  value={formData.kidsSports?.join(', ') || ''}
                  onChange={handleArrayChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                  placeholder="Basketball, Soccer, Tennis"
                />
              </div>
              
              <div>
                <label htmlFor="hobbies" className="block text-sm font-medium text-gray-300 mb-1">
                  Hobbies (comma-separated)
                </label>
                <input
                  type="text"
                  id="hobbies"
                  name="hobbies"
                  value={formData.hobbies?.join(', ') || ''}
                  onChange={handleArrayChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                  placeholder="Photography, Travel, Reading"
                />
              </div>
              
              <div>
                <label htmlFor="placesVisited" className="block text-sm font-medium text-gray-300 mb-1">
                  Places Visited (comma-separated)
                </label>
                <input
                  type="text"
                  id="placesVisited"
                  name="placesVisited"
                  value={formData.placesVisited?.join(', ') || ''}
                  onChange={handleArrayChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                  placeholder="France, Japan, Australia"
                />
              </div>
              
              <div>
                <label htmlFor="lastMeetingNotes" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Meeting Notes
                </label>
                <textarea
                  id="lastMeetingNotes"
                  name="lastMeetingNotes"
                  value={formData.lastMeetingNotes || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                  rows={3}
                  placeholder="Important details from your last meeting"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClient}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 