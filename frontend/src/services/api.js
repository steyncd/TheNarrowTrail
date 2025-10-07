export const API_URL = 'https://hiking-portal-api-554106646136.us-central1.run.app';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  getAuthHeaders(token) {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}, token = null) {
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(token),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { success: false, error: error.message || 'Connection error' };
    }
  }

  // Hikes
  async getHikes(token) {
    const response = await fetch(`${this.baseURL}/api/hikes`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async createHike(hikeData, token) {
    return this.request('/api/hikes', {
      method: 'POST',
      body: JSON.stringify(hikeData)
    }, token);
  }

  async updateHike(hikeId, hikeData, token) {
    return this.request(`/api/hikes/${hikeId}`, {
      method: 'PUT',
      body: JSON.stringify(hikeData)
    }, token);
  }

  async deleteHike(hikeId, token) {
    return this.request(`/api/hikes/${hikeId}`, {
      method: 'DELETE'
    }, token);
  }

  async getHikeById(hikeId, token) {
    // This endpoint should work without authentication for public viewing
    const headers = token ? this.getAuthHeaders(token) : { 'Content-Type': 'application/json' };
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}`, {
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to fetch hike details');
    }
    return response.json();
  }

  async toggleInterest(hikeId, token) {
    return this.request(`/api/hikes/${hikeId}/interest`, {
      method: 'POST'
    }, token);
  }

  async confirmAttendance(hikeId, token) {
    return this.request(`/api/hikes/${hikeId}/confirm-attendance`, {
      method: 'POST'
    }, token);
  }

  async getHikeStatus(hikeId, token) {
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}/my-status`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getInterestedUsers(hikeId, token) {
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}/interested`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getAttendees(hikeId, token) {
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}/attendees`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async addAttendee(hikeId, attendeeData, token) {
    return this.request(`/api/hikes/${hikeId}/attendees`, {
      method: 'POST',
      body: JSON.stringify(attendeeData)
    }, token);
  }

  async updateAttendee(hikeId, userId, attendeeData, token) {
    return this.request(`/api/hikes/${hikeId}/attendees/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(attendeeData)
    }, token);
  }

  async removeAttendee(hikeId, userId, token) {
    return this.request(`/api/hikes/${hikeId}/attendees/${userId}`, {
      method: 'DELETE'
    }, token);
  }

  // My Hikes
  async getMyHikes(token) {
    const response = await fetch(`${this.baseURL}/api/my-hikes`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  // Comments
  async getComments(hikeId, token) {
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}/comments`, {
      headers: this.getAuthHeaders(token)
    });
    if (response.ok) {
      return response.json();
    }
    return [];
  }

  async addComment(hikeId, comment, token) {
    return this.request(`/api/hikes/${hikeId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    }, token);
  }

  async deleteComment(hikeId, commentId, token) {
    return this.request(`/api/hikes/${hikeId}/comments/${commentId}`, {
      method: 'DELETE'
    }, token);
  }

  // Carpooling
  async getCarpoolOffers(hikeId, token) {
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}/carpool-offers`, {
      headers: this.getAuthHeaders(token)
    });
    if (response.ok) {
      return response.json();
    }
    return [];
  }

  async getCarpoolRequests(hikeId, token) {
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}/carpool-requests`, {
      headers: this.getAuthHeaders(token)
    });
    if (response.ok) {
      return response.json();
    }
    return [];
  }

  async submitCarpoolOffer(hikeId, offerData, token) {
    return this.request(`/api/hikes/${hikeId}/carpool-offers`, {
      method: 'POST',
      body: JSON.stringify(offerData)
    }, token);
  }

  async submitCarpoolRequest(hikeId, requestData, token) {
    return this.request(`/api/hikes/${hikeId}/carpool-requests`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    }, token);
  }

  // Packing List
  async getPackingList(hikeId, token) {
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}/packing-list`, {
      headers: this.getAuthHeaders(token)
    });
    if (response.ok) {
      return response.json();
    }
    return { items: [] };
  }

  async updatePackingList(hikeId, items, token) {
    return this.request(`/api/hikes/${hikeId}/packing-list`, {
      method: 'PUT',
      body: JSON.stringify({ items })
    }, token);
  }

  async getDefaultPackingList(hikeId, token) {
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}/default-packing-list`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async saveDefaultPackingList(hikeId, items, token) {
    return this.request(`/api/hikes/${hikeId}/default-packing-list`, {
      method: 'PUT',
      body: JSON.stringify({ items })
    }, token);
  }

  // Emergency Contacts
  async getEmergencyContact(token) {
    const response = await fetch(`${this.baseURL}/api/profile/emergency-contact`, {
      headers: this.getAuthHeaders(token)
    });
    if (response.ok) {
      return response.json();
    }
    return {
      emergency_contact_name: '',
      emergency_contact_phone: '',
      medical_info: ''
    };
  }

  async updateEmergencyContact(contactData, token) {
    return this.request('/api/profile/emergency-contact', {
      method: 'PUT',
      body: JSON.stringify(contactData)
    }, token);
  }

  async getHikeEmergencyContacts(hikeId, token) {
    const response = await fetch(`${this.baseURL}/api/hikes/${hikeId}/emergency-contacts`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  // Photos
  async getPhotos(token) {
    const response = await fetch(`${this.baseURL}/api/photos`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async addPhoto(photoData, token) {
    return this.request('/api/photos', {
      method: 'POST',
      body: JSON.stringify(photoData)
    }, token);
  }

  async deletePhoto(photoId, token) {
    return this.request(`/api/photos/${photoId}`, {
      method: 'DELETE'
    }, token);
  }

  // Admin - Users
  async getPendingUsers(token) {
    const response = await fetch(`${this.baseURL}/api/admin/pending-users`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getUsers(token) {
    const response = await fetch(`${this.baseURL}/api/admin/users`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async approveUser(userId, token) {
    return this.request(`/api/admin/users/${userId}/approve`, {
      method: 'PUT'
    }, token);
  }

  async rejectUser(userId, token) {
    return this.request(`/api/admin/users/${userId}/reject`, {
      method: 'DELETE'
    }, token);
  }

  async deleteUser(userId, token) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    }, token);
  }

  async addUser(userData, token) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, token);
  }

  async updateUser(userId, userData, token) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }, token);
  }

  async resetUserPassword(userId, newPassword, token) {
    return this.request(`/api/admin/users/${userId}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword })
    }, token);
  }

  async promoteToAdmin(userId, token) {
    return this.request(`/api/admin/users/${userId}/promote`, {
      method: 'PUT'
    }, token);
  }

  // Admin - Notifications
  async getNotifications(token) {
    const response = await fetch(`${this.baseURL}/api/admin/notifications`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async sendTestNotification(notificationData, token) {
    return this.request('/api/admin/test-notification', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    }, token);
  }

  // Profile
  async getUserProfile(userId, token) {
    const response = await fetch(`${this.baseURL}/api/profile/${userId}`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getUserStats(userId, token) {
    const response = await fetch(`${this.baseURL}/api/profile/${userId}/stats`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async updateProfile(profileData, token) {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }, token);
  }

  // Analytics (Admin only)
  async getAnalyticsOverview(token) {
    const response = await fetch(`${this.baseURL}/api/analytics/overview`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getUserAnalytics(token) {
    const response = await fetch(`${this.baseURL}/api/analytics/users`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getHikeAnalytics(token) {
    const response = await fetch(`${this.baseURL}/api/analytics/hikes`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getEngagementMetrics(token) {
    const response = await fetch(`${this.baseURL}/api/analytics/engagement`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  // Logs (Admin only)
  async getSigninLogs(params, token) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/logs/signin?${queryString}`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getActivityLogs(params, token) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/logs/activity?${queryString}`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getActivityStats(token) {
    const response = await fetch(`${this.baseURL}/api/logs/stats`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  // Feedback
  async submitFeedback(feedbackData, token) {
    return this.request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    }, token);
  }

  async getAllFeedback(params, token) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/feedback?${queryString}`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getFeedbackStats(token) {
    const response = await fetch(`${this.baseURL}/api/feedback/stats`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async updateFeedbackStatus(id, statusData, token) {
    return this.request(`/api/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    }, token);
  }

  async deleteFeedback(id, token) {
    return this.request(`/api/feedback/${id}`, {
      method: 'DELETE'
    }, token);
  }

  // Suggestions
  async submitSuggestion(suggestionData, token) {
    return this.request('/api/suggestions', {
      method: 'POST',
      body: JSON.stringify(suggestionData)
    }, token);
  }

  async getAllSuggestions(params, token) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/suggestions?${queryString}`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async getSuggestionStats(token) {
    const response = await fetch(`${this.baseURL}/api/suggestions/stats`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async updateSuggestionStatus(id, statusData, token) {
    return this.request(`/api/suggestions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    }, token);
  }

  async deleteSuggestion(id, token) {
    return this.request(`/api/suggestions/${id}`, {
      method: 'DELETE'
    }, token);
  }

  // Long-lived tokens
  async generateLongLivedToken(name, token) {
    return this.request('/api/tokens/generate', {
      method: 'POST',
      body: JSON.stringify({ name })
    }, token);
  }

  async listLongLivedTokens(token) {
    const response = await fetch(`${this.baseURL}/api/tokens`, {
      headers: this.getAuthHeaders(token)
    });
    return response.json();
  }

  async revokeLongLivedToken(id, token) {
    return this.request(`/api/tokens/${id}`, {
      method: 'DELETE'
    }, token);
  }
}

export const api = new ApiService();
export default api;
