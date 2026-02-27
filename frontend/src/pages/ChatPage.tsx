import { useEffect, useState, useRef } from "react";
import { messagesAPI, chatAPI } from "../services/api";
import type { Message } from "../types";
import { Send, User as UserIcon, Bot } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SimpleUser {
  id: string;
  fullName: string;
  profilePic?: string;
  role: string;
}

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await messagesAPI.getAll();
        const uniqueUsers = new Map<string, SimpleUser>();
        res.data.messages.forEach((m) => {
          if (m.senderId !== currentUser?.id && m.sender) {
            uniqueUsers.set(m.senderId, { id: m.senderId, fullName: m.sender.fullName, profilePic: m.sender.profilePic, role: 'USER' });
          }
          if (m.receiverId !== currentUser?.id && m.receiver) {
            uniqueUsers.set(m.receiverId, { id: m.receiverId, fullName: m.receiver.fullName, profilePic: m.receiver.profilePic, role: 'USER' });
          }
        });
        setUsers(Array.from(uniqueUsers.values()));
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchUsers();
  }, [currentUser?.id]);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const res = await messagesAPI.getAll(selectedUser);
          setMessages(res.data.messages);
        } catch (err) {
          console.error("Failed to fetch messages", err);
        }
      };
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await messagesAPI.send({
        receiverId: selectedUser!,
        content: newMessage,
      });
      setMessages([...messages, res.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userMsg = aiMessage;
    setAiMessage("");
    setSending(true);

    try {
      const res = await chatAPI.sendMessage(userMsg);
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          senderId: currentUser?.id || "",
          receiverId: "ai",
          content: userMsg,
          read: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: (Date.now() + 1).toString(),
          senderId: "ai",
          receiverId: currentUser?.id || "",
          content: res.data.reply,
          read: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Failed to chat with AI", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {aiMode ? "AI Assistant" : "Messages"}
          </h1>
          <p className="text-gray-500">
            {aiMode ? "Chat with our AI mentor" : "Connect with mentors and peers"}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-200px)]">
          {/* Mode Toggle */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setAiMode(false)}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                !aiMode ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserIcon size={20} />
                Messages
              </div>
            </button>
            <button
              onClick={() => setAiMode(true)}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                aiMode ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Bot size={20} />
                AI Assistant
              </div>
            </button>
          </div>

          {aiMode ? (
            /* AI Chat Mode */
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.filter(m => m.senderId === "ai" || m.senderId === currentUser?.id).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        msg.senderId === currentUser?.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleAiChat} className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="Ask the AI assistant..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Regular Messages */
            <div className="flex h-full">
              {/* User List */}
              <div className="w-80 border-r border-gray-100 overflow-y-auto">
                {users.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <UserIcon className="mx-auto mb-2" size={32} />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        selectedUser === user.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.fullName[0]}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedUser ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                              msg.senderId === currentUser?.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={sending}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <UserIcon className="mx-auto mb-2" size={48} />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}