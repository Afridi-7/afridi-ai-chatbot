import React, { useState, useEffect } from 'react';
import { ChatSession } from '../types/chat';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search, 
  Settings, 
  Moon, 
  Sun, 
  Monitor,
  Star,
  Archive,
  Filter,
  Sparkles,
  Bot,
  Edit3,
  Download,
  Upload,
  Clock,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Bookmark,
  Tag,
  Calendar,
  Activity
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { chatApi } from '../services/chatApi';

interface SidebarProps {
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ 
  currentSessionId, 
  onSessionSelect, 
  onNewChat, 
  onDeleteSession,
  isOpen,
  onClose 
}: SidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'starred' | 'archived'>('all');
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    recent: true,
    starred: true,
    archived: false
  });
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const [showQuickStats] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const response = await chatApi.getAllSessions();
    if (response.success && response.data) {
      const formattedSessions = response.data.map(session => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }));
      setSessions(formattedSessions);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'starred' && session.isStarred) ||
                         (filter === 'archived' && session.isArchived);
    return matchesSearch && matchesFilter;
  });

  const recentSessions = filteredSessions.filter(s => !s.isStarred && !s.isArchived).slice(0, 10);
  const starredSessions = filteredSessions.filter(s => s.isStarred);
  const archivedSessions = filteredSessions.filter(s => s.isArchived);

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const handleStarSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, isStarred: !session.isStarred }
        : session
    ));
  };

  const handleEditTitle = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSession(sessionId);
    setEditTitle(currentTitle);
  };

  const saveTitle = async (sessionId: string) => {
    if (editTitle.trim()) {
      const response = await chatApi.updateSessionTitle(sessionId, editTitle.trim());
      if (response.success) {
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, title: editTitle.trim() }
            : session
        ));
      }
    }
    setEditingSession(null);
    setEditTitle('');
  };

  const handleExportSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const response = await chatApi.exportSession(sessionId, 'json');
    if (response.success && response.data) {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${sessionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const quickStats = {
    totalChats: sessions.length,
    todayChats: sessions.filter(s => {
      const today = new Date();
      return s.createdAt.toDateString() === today.toDateString();
    }).length,
    totalMessages: sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0),
    starredCount: sessions.filter(s => s.isStarred).length
  };

  const renderSessionItem = (session: ChatSession, index: number) => (
    <div
      key={session.id}
      onClick={() => {
        if (editingSession !== session.id) {
          onSessionSelect(session.id);
          onClose();
        }
      }}
      onMouseEnter={() => setHoveredSession(session.id)}
      onMouseLeave={() => setHoveredSession(null)}
      className={`group relative p-3 rounded-2xl cursor-pointer transition-all duration-500 hover-lift animate-slide-in-left border ${
        currentSessionId === session.id
          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/30 shadow-lg shadow-purple-500/10'
          : 'hover:bg-white/8 border-transparent hover:border-white/10'
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Glow effect for active session */}
      {currentSessionId === session.id && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-xl -z-10" />
      )}

      <div className="flex items-start space-x-3">
        {/* Session Icon with dynamic indicator */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            currentSessionId === session.id
              ? 'bg-gradient-to-r from-purple-400 to-blue-400 shadow-lg'
              : 'bg-white/10 group-hover:bg-white/15'
          }`}>
            <MessageSquare size={18} className="text-white" />
          </div>
          
          {/* Activity indicator */}
          {session.updatedAt > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse-soft border-2 border-white/20" />
          )}
          
          {/* Star indicator */}
          {session.isStarred && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star size={10} className="text-white fill-current" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {editingSession === session.id ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => saveTitle(session.id)}
              onKeyPress={(e) => e.key === 'Enter' && saveTitle(session.id)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              autoFocus
            />
          ) : (
            <h3 className={`font-semibold truncate mb-1 transition-colors duration-300 ${
              currentSessionId === session.id
                ? 'text-white'
                : 'text-white/90 group-hover:text-white'
            }`}>
              {session.title}
            </h3>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center text-white/60">
                <MessageSquare size={12} className="mr-1" />
                {session.messageCount || 0}
              </div>
              <div className="flex items-center text-white/60">
                <Clock size={12} className="mr-1" />
                {session.updatedAt.toLocaleDateString()}
              </div>
            </div>
            
            {/* Session tags */}
            {session.tags && session.tags.length > 0 && (
              <div className="flex space-x-1">
                {session.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/70">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover Actions */}
      <div className={`absolute top-2 right-2 flex space-x-1 transition-all duration-300 ${
        hoveredSession === session.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
      }`}>
        <button
          onClick={(e) => handleStarSession(session.id, e)}
          className={`p-1.5 hover:bg-white/20 rounded-lg transition-all duration-300 hover-scale ${
            session.isStarred ? 'text-yellow-400' : 'text-white/60 hover:text-yellow-400'
          }`}
          title="Star conversation"
        >
          <Star size={14} />
        </button>

        <button
          onClick={(e) => handleEditTitle(session.id, session.title, e)}
          className="p-1.5 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-all duration-300 hover-scale"
          title="Edit title"
        >
          <Edit3 size={14} />
        </button>

        <div className="relative group/more">
          <button className="p-1.5 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-all duration-300 hover-scale">
            <MoreHorizontal size={14} />
          </button>
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-8 w-32 glass rounded-lg shadow-xl opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-300 z-50">
            <button
              onClick={(e) => handleExportSession(session.id, e)}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-t-lg transition-colors flex items-center space-x-2"
            >
              <Download size={12} />
              <span>Export</span>
            </button>
            <button className="w-full px-3 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
              <Bookmark size={12} />
              <span>Archive</span>
            </button>
            <button
              onClick={(e) => handleDeleteSession(session.id, e)}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-b-lg transition-colors flex items-center space-x-2"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = (title: string, sessions: ChatSession[], sectionKey: keyof typeof expandedSections, icon: React.ReactNode) => {
    if (sessions.length === 0) return null;

    return (
      <div className="mb-6">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-2 text-white/80 hover:text-white transition-colors duration-300 group"
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium">{title}</span>
            <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">{sessions.length}</span>
          </div>
          <div className="transition-transform duration-300 group-hover:scale-110">
            {expandedSections[sectionKey] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </button>
        
        <div className={`transition-all duration-500 overflow-hidden ${
          expandedSections[sectionKey] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-2 mt-2">
            {sessions.map((session, index) => renderSessionItem(session, index))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full transform transition-all duration-500 ease-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:z-auto lg:translate-x-0 sidebar-mobile sm:sidebar-tablet lg:sidebar-desktop`}>
        
        {/* Sidebar Background with enhanced glass effect */}
        <div className="h-full bg-gradient-to-b from-black/30 via-black/15 to-black/30 backdrop-blur-3xl border-r border-white/20 shadow-2xl">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/20 bg-gradient-to-r from-white/10 to-transparent">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="relative">
                <div className="avatar-assistant w-10 h-10 sm:w-12 sm:h-12 animate-float shadow-lg">
                  <Bot size={20} className="sm:hidden" />
                  <Bot size={28} className="hidden sm:block" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse-soft border-2 border-white/30 shadow-lg" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white text-glow">
                  NovaChat
                </h2>
                <p className="text-sm text-white/60 flex items-center">
                  <Sparkles size={12} className="mr-1" />
                  AI Assistant
                </p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 z-10"
            >
              ✕
            </button>
            
            <button
              onClick={onNewChat}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl transition-all duration-300 hover-lift shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group text-sm sm:text-base"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>New Chat</span>
              <Zap size={14} className="ml-auto opacity-80" />
            </button>
          </div>

          {/* Quick Stats */}
          {showQuickStats && (
            <div className="p-3 sm:p-4 border-b border-white/10">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="glass rounded-xl p-3 hover-lift">
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={16} className="text-green-400" />
                    <div>
                      <p className="text-xs text-white/60">Chats</p>
                      <p className="text-sm sm:text-lg font-bold text-white">{quickStats.totalChats}</p>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-xl p-3 hover-lift">
                  <div className="flex items-center space-x-2">
                    <Activity size={16} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-white/60">Msgs</p>
                      <p className="text-sm sm:text-lg font-bold text-white">{quickStats.totalMessages}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="p-3 sm:p-4 border-b border-white/10 space-y-3 sm:space-y-4">
            <div className="relative group">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-focus-within:text-white/60 transition-colors" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
              />
            </div>

            <div className="flex space-x-1">
              {[
                { value: 'all', label: 'All', count: sessions.length },
                { value: 'starred', label: 'Starred', count: quickStats.starredCount },
                { value: 'archived', label: 'Archived', count: archivedSessions.length }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs rounded-lg transition-all duration-300 hover-scale ${
                    filter === option.value
                      ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white border border-purple-400/30'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {option.label}
                  {option.count > 0 && (
                    <span className="ml-1 px-1 sm:px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Sessions 
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-3 sm:p-4">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 sm:py-12 animate-scale-in">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 glass rounded-2xl flex items-center justify-center">
                    <MessageSquare size={32} className="text-white/40 sm:hidden" />
                    <MessageSquare size={40} className="text-white/40 hidden sm:block" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white/80 mb-2">No conversations yet</h3>
                  <p className="text-white/60 text-xs sm:text-sm mb-4">Start chatting to see your history</p>
                  <button
                    onClick={onNewChat}
                    className="btn-secondary px-4 sm:px-6 py-2 text-xs sm:text-sm hover-lift"
                  >
                    Start First Chat
                  </button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {renderSection('Recent', recentSessions, 'recent', <Clock size={16} />)}
                  {renderSection('Starred', starredSessions, 'starred', <Star size={16} />)}
                  {renderSection('Archived', archivedSessions, 'archived', <Archive size={16} />)}
                </div>
              )}
            </div>
          </div>
          */}

          {/* Settings Panel */}

          {/* Footer 
          <div className="p-3 sm:p-4 border-t border-white/10 bg-gradient-to-r from-transparent to-white/5">
            <div className="flex items-center justify-center text-xs text-white/50">
              <span>NovaChat v1.0</span>
            </div>
          </div>
          */}
        </div>
      </div>
    </>
  );
}