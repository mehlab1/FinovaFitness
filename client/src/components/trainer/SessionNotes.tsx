import { useState, useEffect } from 'react';
import { trainerApi } from '../../services/api/trainerApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Calendar, Clock, User, CheckCircle, FileText, Save, Play } from 'lucide-react';

interface SessionNotesProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface ConfirmedSession {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  client_id: number;
  client_name: string;
  notes?: string;
  status: string;
  created_at: string;
}

export const SessionNotes = ({ showToast }: SessionNotesProps) => {
  const [confirmedSessions, setConfirmedSessions] = useState<ConfirmedSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<ConfirmedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [editingNotes, setEditingNotes] = useState<{ [key: number]: string }>({});
  const [savingNotes, setSavingNotes] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Get confirmed sessions (upcoming)
      const confirmedData = await trainerApi.getConfirmedSessions();
      setConfirmedSessions(confirmedData);
      
      // Get completed sessions
      const completedData = await trainerApi.getCompletedSessions();
      setCompletedSessions(completedData);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      showToast('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotesChange = (sessionId: number, notes: string) => {
    setEditingNotes(prev => ({
      ...prev,
      [sessionId]: notes
    }));
  };

  const saveSessionNotes = async (sessionId: number) => {
    try {
      setSavingNotes(prev => ({ ...prev, [sessionId]: true }));
      
      const notes = editingNotes[sessionId] || '';
      await trainerApi.saveSessionNotes(sessionId, { notes });
      
      // Update local state
      setConfirmedSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, notes: notes }
            : session
        )
      );
      
      showToast('Session notes saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save notes:', error);
      showToast('Failed to save session notes', 'error');
    } finally {
      setSavingNotes(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const markSessionCompleted = async (sessionId: number) => {
    try {
      await trainerApi.markSessionCompleted(sessionId);
      
      // Move session from confirmed to completed
      const sessionToMove = confirmedSessions.find(s => s.id === sessionId);
      if (sessionToMove) {
        setConfirmedSessions(prev => prev.filter(s => s.id !== sessionId));
        setCompletedSessions(prev => [...prev, { ...sessionToMove, status: 'completed' }]);
      }
      
      showToast('Session marked as completed', 'success');
    } catch (error) {
      console.error('Failed to mark session completed:', error);
      showToast('Failed to mark session as completed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          SESSION DETAILS
        </h1>
        <p className="text-gray-300">Manage confirmed sessions, add notes, and track completion.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-pink-400 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Play className="w-4 h-4 inline mr-2" />
          Upcoming Sessions ({confirmedSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'completed'
              ? 'bg-green-400 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Session History ({completedSessions.length})
        </button>
      </div>

      {/* Upcoming Sessions Tab */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {confirmedSessions.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                  <p className="text-base">No upcoming confirmed sessions found.</p>
                  <p className="text-sm">Confirmed sessions will appear here for you to manage.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            confirmedSessions.map((session) => (
              <Card key={session.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">
                          {session.session_type}
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          {new Date(session.session_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })} at {session.start_time} - {session.end_time}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-600 text-white">
                        Confirmed
                      </Badge>
                      <Button
                        onClick={() => markSessionCompleted(session.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <User className="w-4 h-4" />
                      <span>Client: {session.client_name}</span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Session Notes
                      </label>
                      <Textarea
                        value={editingNotes[session.id] || session.notes || ''}
                        onChange={(e) => handleNotesChange(session.id, e.target.value)}
                        placeholder="Add session notes, client feedback, or observations..."
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={4}
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          onClick={() => saveSessionNotes(session.id)}
                          disabled={savingNotes[session.id]}
                          className="bg-pink-600 hover:bg-pink-700 text-white"
                          size="sm"
                        >
                          {savingNotes[session.id] ? (
                            <i className="fas fa-spinner fa-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Completed Sessions Tab */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedSessions.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                  <p className="text-base">No completed sessions found.</p>
                  <p className="text-sm">Completed sessions will appear here in your session history.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            completedSessions.map((session) => (
              <Card key={session.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-white">
                        {session.session_type}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {new Date(session.session_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {session.start_time} - {session.end_time}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <User className="w-4 h-4" />
                      <span>Client: {session.client_name}</span>
                    </div>
                    
                    {session.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Session Notes
                        </label>
                        <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-300">
                          {session.notes}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-600 text-white">
                        Completed
                      </Badge>
                      <span className="text-sm text-gray-400">
                        Completed on {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
