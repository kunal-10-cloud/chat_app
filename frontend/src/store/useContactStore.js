import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useContactStore = create((set) => ({
  contacts: [],
  sentRequests: [],
  receivedRequests: [],
  searchResults: [],
  isLoading: false,
  error: null,

  // Search for users
  searchUsers: async (query) => {
    if (!query || query.length < 2) {
      set({ searchResults: [] });
      return [];
    }

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/api/contacts/search?query=${encodeURIComponent(query)}`);
      set({ searchResults: response.data });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to search users',
        searchResults: [] 
      });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // Send contact request
  sendContactRequest: async (recipientId, message = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/api/contacts/requests', {
        recipientId,
        message
      });
      
      // Update sent requests
      set(state => ({
        sentRequests: [...state.sentRequests, response.data],
        searchResults: state.searchResults.filter(user => user._id !== recipientId)
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending contact request:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to send contact request'
      });
      return { success: false, error: error.response?.data?.message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Respond to contact request
  respondToRequest: async (requestId, action) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/api/contacts/requests/${requestId}/respond`, {
        action
      });

      // Update state based on action
      if (action === 'accept') {
        set(state => ({
          receivedRequests: state.receivedRequests.filter(req => req._id !== requestId),
          contacts: [...state.contacts, state.receivedRequests.find(req => req._id === requestId).sender]
        }));
      } else {
        set(state => ({
          receivedRequests: state.receivedRequests.filter(req => req._id !== requestId)
        }));
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error responding to contact request:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to process request'
      });
      return { success: false, error: error.response?.data?.message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Load contact requests
  loadContactRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/api/contacts/requests');
      set({ 
        sentRequests: response.data.sent,
        receivedRequests: response.data.received
      });
      return response.data;
    } catch (error) {
      console.error('Error loading contact requests:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to load contact requests'
      });
      return { sent: [], received: [] };
    } finally {
      set({ isLoading: false });
    }
  },

  // Load contacts
  loadContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/api/contacts');
      set({ contacts: response.data });
      return response.data;
    } catch (error) {
      console.error('Error loading contacts:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to load contacts',
        contacts: []
      });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // Clear search results
  clearSearchResults: () => set({ searchResults: [] }),

  // Reset state
  reset: () => set({ 
    contacts: [],
    sentRequests: [],
    receivedRequests: [],
    searchResults: [],
    isLoading: false,
    error: null
  })
}));
