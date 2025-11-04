import { useEffect, useState } from 'react';
import { Search, Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { useContactStore } from '../store/useContactStore';
import ContactItem from './ContactItem';
import toast from 'react-hot-toast';

const ContactsList = ({ onSelectContact }) => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    contacts, 
    sentRequests, 
    receivedRequests, 
    searchResults,
    isLoading,
    searchUsers,
    sendContactRequest,
    respondToRequest,
    loadContactRequests,
    loadContacts,
    clearSearchResults
  } = useContactStore();

  useEffect(() => {
    // Load initial data
    loadContacts();
    loadContactRequests();
  }, [loadContacts, loadContactRequests]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchUsers(searchQuery);
    }
  };

  const handleSendRequest = async (userId) => {
    const { success, error } = await sendContactRequest(userId);
    if (success) {
      toast.success('Contact request sent');
      setSearchQuery('');
      clearSearchResults();
    } else {
      toast.error(error || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    const { success, error } = await respondToRequest(requestId, 'accept');
    if (success) {
      toast.success('Contact request accepted');
    } else {
      toast.error(error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const { success, error } = await respondToRequest(requestId, 'reject');
    if (success) {
      toast.success('Contact request rejected');
    } else {
      toast.error(error || 'Failed to reject request');
    }
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center text-gray-500">
          Searching...
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No users found
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-100">
        {searchResults.map((user) => (
          <div key={user._id} className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user.profilePic ? (
                  <img
                    className="w-10 h-10 rounded-full"
                    src={user.profilePic}
                    alt={user.username || user.email}
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
                    <UserPlus className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.username || user.email}
                </p>
                {user.fullName && (
                  <p className="text-xs text-gray-500">{user.fullName}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleSendRequest(user._id)}
              className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    if (searchQuery) {
      return renderSearchResults();
    }

    switch (activeTab) {
      case 'contacts':
        return (
          <div className="divide-y divide-gray-100">
            {contacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No contacts yet. Search for users to add them as contacts.
              </div>
            ) : (
              contacts.map((contact) => (
                <div 
                  key={contact._id} 
                  onClick={() => onSelectContact(contact)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <ContactItem user={contact} type="contact" />
                </div>
              ))
            )}
          </div>
        );
      
      case 'received':
        return (
          <div className="divide-y divide-gray-100">
            {receivedRequests.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No pending requests
              </div>
            ) : (
              receivedRequests.map((request) => (
                <ContactItem
                  key={request._id}
                  user={request.sender}
                  type="received"
                  requestId={request._id}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                />
              ))
            )}
          </div>
        );
      
      case 'sent':
        return (
          <div className="divide-y divide-gray-100">
            {sentRequests.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No sent requests
              </div>
            ) : (
              sentRequests.map((request) => (
                <ContactItem
                  key={request._id}
                  user={request.recipient}
                  type="pending"
                  requestId={request._id}
                />
              ))
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-sm font-medium text-center ${
            activeTab === 'contacts' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('contacts')}
        >
          <div className="flex items-center justify-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Contacts ({contacts.length})</span>
          </div>
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium text-center ${
            activeTab === 'received' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('received')}
        >
          <div className="flex items-center justify-center space-x-1">
            <UserPlus className="w-4 h-4" />
            <span>Requests ({receivedRequests.length})</span>
          </div>
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium text-center ${
            activeTab === 'sent' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          <div className="flex items-center justify-center space-x-1">
            <UserCheck className="w-4 h-4" />
            <span>Sent ({sentRequests.length})</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ContactsList;
