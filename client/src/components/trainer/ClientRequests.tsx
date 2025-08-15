import { useState, useEffect } from 'react';
import { trainerApi } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar, Clock, User, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';

interface ClientRequestsProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface TrainingSessionRequest {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

export const ClientRequests = ({ showToast }: ClientRequestsProps) => {
  const [requests, setRequests] = useState<TrainingSessionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await trainerApi.getRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        showToast('Failed to load session requests', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [showToast]);

  const handleRequest = async (id: number, action: 'accept' | 'reject') => {
    try {
      await trainerApi.updateRequest(id, action);
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: action === 'accept' ? 'confirmed' : 'rejected' } : req
      ));
      
      showToast(`Session request ${action}ed successfully`, 'success');
    } catch (error) {
      console.error('Failed to update request:', error);
      showToast('Failed to update request', 'error');
    }
  };

  const refreshRequests = async () => {
    try {
      setLoading(true);
      const data = await trainerApi.getRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to refresh requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading session requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
          Session Requests
        </h1>
        <p className="text-gray-300 text-base max-w-2xl mx-auto">
          Review and manage pending training session requests from members.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-lg">
          <CardContent className="pt-4 text-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <ClockIcon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-yellow-400 mb-1">
              {requests.filter(r => r.status === 'pending').length}
            </p>
            <p className="text-yellow-300 text-xs font-medium">Pending</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 shadow-lg">
          <CardContent className="pt-4 text-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-green-400 mb-1">
              {requests.filter(r => r.status === 'confirmed').length}
            </p>
            <p className="text-green-300 text-xs font-medium">Confirmed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/50 shadow-lg">
          <CardContent className="pt-4 text-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-red-400 mb-1">
              {requests.filter(r => r.status === 'rejected').length}
            </p>
            <p className="text-red-300 text-xs font-medium">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white">Session Requests</CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  {requests.length} total requests
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={refreshRequests}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-lg font-medium text-gray-300 mb-2">No session requests</p>
              <p className="text-sm">When members request training sessions, they will appear here for your review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className={`p-4 border rounded-lg transition-all ${
                  request.status === 'pending' 
                    ? 'border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-orange-500/10' 
                    : request.status === 'confirmed'
                    ? 'border-green-500 bg-gradient-to-r from-green-500/10 to-emerald-500/10'
                    : 'border-red-500 bg-gradient-to-r from-red-500/10 to-pink-500/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-500 text-white text-sm">
                          {request.first_name[0]}{request.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {request.first_name} {request.last_name}
                        </h4>
                        <p className="text-gray-300 text-xs">{request.email}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-300">
                              {new Date(request.session_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-300">
                              {request.start_time} - {request.end_time}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                            {request.session_type}
                          </Badge>
                          {request.notes && (
                            <span className="text-xs text-gray-400 italic">"{request.notes}"</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          request.status === 'pending' 
                            ? 'border-yellow-500 text-yellow-400' 
                            : request.status === 'confirmed'
                            ? 'border-green-500 text-green-400'
                            : 'border-red-500 text-red-400'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleRequest(request.id, 'accept')}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 h-8"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRequest(request.id, 'reject')}
                            size="sm"
                            variant="destructive"
                            className="text-xs px-3 py-1 h-8"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
