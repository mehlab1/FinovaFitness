import { useState, useEffect } from 'react';
import { trainerApi } from '../../services/api';

interface ClientRequestsProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ClientRequests = ({ showToast }: ClientRequestsProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await trainerApi.getRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        showToast('Failed to load client requests', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [showToast]);

  const handleRequest = async (id: number, action: 'approve' | 'reject') => {
    try {
      const requestData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        trainer_response: action === 'approve' ? 'Request approved' : 'Request rejected',
        approved_date: action === 'approve' ? new Date().toISOString().split('T')[0] : null,
        approved_time: action === 'approve' ? '10:00' : null,
        session_price: action === 'approve' ? 75.00 : null
      };
      
      await trainerApi.updateRequest(id, requestData);
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: requestData.status } : req
      ));
      
      showToast(`Request ${action === 'approve' ? 'approved' : 'rejected'}`, 'success');
    } catch (error) {
      console.error('Failed to update request:', error);
      showToast('Failed to update request', 'error');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-pink-400 mb-4">Client Booking Requests</h3>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No client requests</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">{request.requester_name}</h4>
                    <p className="text-gray-300">
                      {request.request_type.replace('_', ' ')} • {request.preferred_date} at {request.preferred_time}
                    </p>
                    {request.message && (
                      <p className="text-sm text-gray-400 mt-1">"{request.message}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {request.is_member ? 'Member' : 'Non-member'} • {request.requester_email}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {request.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleRequest(request.id, 'approve')}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequest(request.id, 'reject')}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 rounded-lg font-semibold ${
                        request.status === 'approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
