import { useState, useEffect, useRef } from "react";
import { Send, RefreshCw, Inbox, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ADMIN_KEY = "admin@samasenegal.com";

function loadLocalMessages(): any[] {
  try { return JSON.parse(localStorage.getItem("messages") || "[]"); } catch { return []; }
}

export function MessagesAdmin() {
  const [conversations, setConversations] = useState<Record<string, any[]>>({});
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setSource("supabase");
        groupByUser(data);
      } else {
        setSource("local");
        groupByUser(loadLocalMessages());
      }
    } catch {
      setSource("local");
      groupByUser(loadLocalMessages());
    } finally {
      setLoading(false);
    }
  };

  const groupByUser = (msgs: any[]) => {
    const groups: Record<string, any[]> = {};
    msgs.forEach(m => {
      const user = m.from_user === ADMIN_KEY ? m.to_user : m.from_user;
      if (!groups[user]) groups[user] = [];
      groups[user].push(m);
    });
    setConversations(groups);
    if (!activeUser && Object.keys(groups).length > 0) {
      setActiveUser(Object.keys(groups)[0]);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeUser]);

  const unreadCount = (userKey: string) =>
    (conversations[userKey] || []).filter(m => m.to_user === ADMIN_KEY && !m.read).length;

  const sendReply = async () => {
    if (!newMsg.trim() || !activeUser || sending) return;
    setSending(true);

    const msg = {
      from_user: ADMIN_KEY,
      to_user: activeUser,
      content: newMsg.trim(),
      read: false,
      created_at: new Date().toISOString(),
    };

    // Optimiste
    setConversations(prev => ({
      ...prev,
      [activeUser]: [...(prev[activeUser] || []), { ...msg, id: Date.now().toString() }],
    }));
    setNewMsg("");

    // Supabase
    try {
      await supabase.from("messages").insert([msg]);
    } catch {}

    // localStorage sync
    try {
      const all = loadLocalMessages();
      all.push({ ...msg, id: Date.now().toString() });
      localStorage.setItem("messages", JSON.stringify(all));
      window.dispatchEvent(new Event("messagesUpdated"));
    } catch {}

    // Marquer les messages du client comme lus
    try {
      await supabase.from("messages").update({ read: true })
        .eq("from_user", activeUser).eq("to_user", ADMIN_KEY).eq("read", false);
    } catch {}

    setSending(false);
  };

  const markRead = async (userKey: string) => {
    try {
      await supabase.from("messages").update({ read: true })
        .eq("from_user", userKey).eq("to_user", ADMIN_KEY).eq("read", false);
    } catch {}
    setConversations(prev => ({
      ...prev,
      [userKey]: (prev[userKey] || []).map(m =>
        m.from_user === userKey && m.to_user === ADMIN_KEY ? { ...m, read: true } : m
      ),
    }));
  };

  const users = Object.keys(conversations);
  const activeMessages = activeUser ? conversations[activeUser] || [] : [];

  return (
    <div className="flex h-[70vh] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Sidebar utilisateurs */}
      <div className="w-64 border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">Conversations</span>
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {!loading && (
          <div className={`mx-3 mt-2 text-[10px] px-2 py-1 rounded-full w-fit font-medium ${
            source === "supabase"
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-yellow-50 text-yellow-600 border border-yellow-200"
          }`}>
            {source === "supabase" ? "✅ Supabase" : "⚠️ Local"}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-xs">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">Aucun message</p>
            </div>
          ) : (
            users.map(userKey => {
              const unread = unreadCount(userKey);
              const last = conversations[userKey].slice(-1)[0];
              return (
                <button key={userKey} onClick={() => { setActiveUser(userKey); markRead(userKey); }}
                  className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors ${
                    activeUser === userKey ? "bg-[#2C7A5C]/10" : "hover:bg-gray-50"
                  }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1A1A2E] flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800 truncate">{userKey}</span>
                        {unread > 0 && (
                          <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                      {last && (
                        <p className="text-[10px] text-gray-400 truncate">{last.content}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Zone messages */}
      <div className="flex-1 flex flex-col">
        {!activeUser ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Sélectionne une conversation</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1A1A2E] flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800">{activeUser}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMessages.map((m, i) => {
                const isAdmin = m.from_user === ADMIN_KEY;
                return (
                  <div key={m.id || i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isAdmin ? "bg-[#2C7A5C] text-white rounded-br-sm" : "bg-gray-100 text-[#1A1A2E] rounded-bl-sm"
                    }`}>
                      <p>{m.content}</p>
                      <p className={`text-[10px] mt-1 ${isAdmin ? "text-white/60 text-right" : "text-gray-400"}`}>
                        {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        {isAdmin && (m.read ? " ✓✓" : " ✓")}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                placeholder={`Répondre à ${activeUser}...`}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]"
              />
              <button onClick={sendReply} disabled={sending || !newMsg.trim()}
                className="bg-[#2C7A5C] hover:bg-[#1A1A2E] disabled:opacity-40 text-white px-4 py-2 rounded-xl transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
