import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message } from '../types';
import { agentsApi, sessionsApi } from '../services/api';

const ChatInterface: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [agentName, setAgentName] = useState('Vx+ Agent');
  const [agentId, setAgentId] = useState<string | null>(null);
  const [sessionPlatform, setSessionPlatform] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [agentAvatar, setAgentAvatar] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{ base64: string, type: string, name: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!sessionId) return;
    const fetchHistory = async () => {
      try {
        const history = await sessionsApi.getMessages(sessionId);
        setMessages(history);
        // Fetch session details to get agent name/platform
        const sessions = await sessionsApi.listSessions();
        const current = sessions.find(s => s.id === sessionId);
        if (current) {
          // Supabase join might return 'agents' as the key
          const agentData = (current as any).agents || current.agent;
          const name = agentData?.custom_name || 'Agente Vx';
          setAgentName(name);
          setAgentAvatar(agentData?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&eyes=default&eyebrow=default&mouth=smile`);
          setAgentId(agentData?.id || (current as any).agent_id || null);
          setSessionPlatform(current.platform);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    fetchHistory();
  }, [sessionId]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };
  
  useEffect(() => {
    if (!isInitializing) {
      const behavior = isFirstLoad.current ? "auto" : "smooth";
      const timer = setTimeout(() => {
        scrollToBottom(behavior);
        if (isFirstLoad.current && messages.length > 0) {
          isFirstLoad.current = false;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, isInitializing]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        base64: reader.result as string,
        type: file.type,
        name: file.name
      });
      setIsPreviewOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading || !sessionId) return;

    const userText = input;
    const fileToUpload = selectedFile;
    
    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      image_url: fileToUpload?.base64, // Use base64 for immediate local UI feedback
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInput('');
    setSelectedFile(null);
    setIsPreviewOpen(false);
    setIsLoading(true);

    try {
      if (!agentId) {
        // Fallback: try to find it again if missing
        const sessions = await sessionsApi.listSessions();
        const current = sessions.find(s => s.id === sessionId);
        const fetchedAgentId = (current as any).agents?.id || current?.agent?.id || (current as any).agent_id;
        if (!fetchedAgentId) throw new Error("No agent found for this session");
        setAgentId(fetchedAgentId);
        
        const { reply } = await agentsApi.sendMessage(fetchedAgentId, userText, fileToUpload?.base64);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: reply,
          created_at: new Date().toISOString()
        }]);
      } else {
        const { reply } = await agentsApi.sendMessage(agentId, userText, fileToUpload?.base64);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: reply,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error enviando el mensaje. Reintenta.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[5000]">
        <div className="w-10 h-10 border-4 border-vx-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isTG = sessionPlatform === 'telegram';
  const theme = isTG ? {
    chatBg: 'bg-[#99badd]',
    userBubble: 'bg-[#EEFFDE] text-black rounded-2xl rounded-tr-none',
    aiBubble: 'bg-white text-black rounded-2xl rounded-tl-none',
    headerBg: 'bg-[#f6f6f6]/95 border-b border-gray-300',
    accent: 'text-[#0088cc]'
  } : {
    chatBg: 'bg-[#efe6dd]',
    userBubble: 'bg-[#DCF8C6] text-black rounded-2xl rounded-tr-none',
    aiBubble: 'bg-white text-black rounded-2xl rounded-tl-none',
    headerBg: 'bg-[#f0f2f5]/95 border-b border-gray-300',
    accent: 'text-[#075e54]'
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 backdrop-blur-md">
       <button 
          onClick={() => navigate('/')} 
          aria-label="Cerrar chat"
          className="absolute top-6 right-8 text-white/60 hover:text-white flex-col items-center hidden md:flex"
        >
          <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mb-1"><i className="fas fa-times" aria-hidden="true"></i></div>
          <span className="text-[10px] font-mono tracking-widest uppercase">Cerrar</span>
       </button>

       <div className={`w-full h-full md:w-[375px] md:h-[812px] md:max-h-[90vh] md:rounded-[40px] md:border-[10px] md:border-gray-900 bg-white flex flex-col overflow-hidden relative shadow-2xl`}>
          
          {/* Header */}
          <div className={`${theme.headerBg} p-4 flex items-center justify-between z-10 shrink-0`}>
             <button onClick={() => navigate('/')} aria-label="Volver al inicio" className={`${theme.accent} flex items-center gap-1`}>
                <i className="fas fa-chevron-left" aria-hidden="true"></i> <span className="text-sm font-medium">Atrás</span>
             </button>
             <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                   {agentAvatar && <img src={agentAvatar} alt={agentName} className="w-8 h-8 rounded-full bg-gray-700 object-cover" />}
                   <span className="font-bold text-black text-sm">{agentName}</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">En línea</span>
             </div>
             <div className={`${theme.accent} flex gap-4`}>
                <i className="fas fa-video"></i>
                <i className="fas fa-phone"></i>
             </div>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 relative ${theme.chatBg}`}>
             {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 shadow-sm ${m.role === 'user' ? theme.userBubble : theme.aiBubble}`}>
                       {m.image_url && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-black/5">
                             {m.image_url.includes('video') || m.image_url.endsWith('.mp4') ? (
                                <video src={m.image_url} controls className="max-w-full h-auto" />
                             ) : (
                                <img src={m.image_url} alt="Evidence" className="max-w-full h-auto object-cover" />
                             )}
                          </div>
                       )}
                       {m.content && <p className="text-[15px] whitespace-pre-wrap">{m.content}</p>}
                       <div className="text-[9px] text-gray-500 text-right mt-1">
                          {new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(m.created_at))}
                       </div>
                    </div>
                </div>
             ))}
             {isLoading && (
                <div className="flex justify-start">
                   <div className={`${theme.aiBubble} px-4 py-2`}>
                      <div className="flex gap-1"><div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150"></div></div>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="bg-[#f0f2f5] p-3 flex flex-col border-t border-gray-300 pb-8 md:pb-4">
             {isPreviewOpen && selectedFile && (
                <div className="mb-2 p-2 bg-white rounded-xl border border-gray-200 flex items-center gap-3 animate-fade-in">
                   <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                      {selectedFile.type.startsWith('image/') ? (
                         <img src={selectedFile.base64} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                         <i className="fas fa-video text-gray-400"></i>
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-black truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Listo para enviar</p>
                   </div>
                   <button 
                      type="button" 
                      onClick={() => { setSelectedFile(null); setIsPreviewOpen(false); }}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                   >
                      <i className="fas fa-times text-[10px]"></i>
                   </button>
                </div>
             )}
             
             <div className="flex items-end gap-3 w-full">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,video/mp4,video/quicktime" 
                  className="hidden" 
                />
                <i 
                  className="fas fa-plus text-[#007aff] text-xl mb-1.5 cursor-pointer hover:scale-110 active:scale-95 transition-transform" 
                  aria-hidden="true" 
                  title="Añadir adjunto"
                  onClick={handleFileClick}
                ></i>
                <div className="flex-1 bg-white rounded-2xl border border-gray-300 px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#007aff]/50 transition-shadow">
                   <input 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     placeholder="Mensaje…"
                     className="w-full bg-transparent focus:outline-none text-black text-[15px]"
                   />
                </div>
                <button type="submit" className="mb-1" aria-label={(input.trim() || selectedFile) ? "Enviar mensaje" : "Grabar audio"}>
                   <i className={`fas ${(input.trim() || selectedFile) ? 'fa-paper-plane' : 'fa-microphone'} text-[#007aff] text-xl`} aria-hidden="true"></i>
                </button>
             </div>
          </form>

       </div>
    </div>
  );
};

export default ChatInterface;
