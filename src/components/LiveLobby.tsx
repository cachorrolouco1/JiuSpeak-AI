import React, { useState, useEffect } from "react";
import { Video, Users, X, RefreshCw, PhoneCall } from "lucide-react";

interface LiveLobbyProps {
  teacherName: string;
  onJoinGroup: (roomId: string) => void;
  onStartIndividual: () => void;
  onClose: () => void;
}

export const LiveLobby: React.FC<LiveLobbyProps> = ({ teacherName, onJoinGroup, onStartIndividual, onClose }) => {
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/live-rooms");
      const json = await res.json();
      if (json.success) setActiveRooms(json.rooms.filter((r: any) => r.participantCount > 0));
    } catch (e) { console.warn(e); }
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); const i = setInterval(fetchRooms, 3000); return () => clearInterval(i); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}>
      <div className="w-[340px] rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: "var(--js-bg-card)", border: "1px solid var(--js-border)" }}>

        <div className="p-5 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--js-border)" }}>
          <div>
            <h3 className="text-base font-black" style={{ color: "var(--js-text-primary)" }}>Aula ao Vivo</h3>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--js-text-muted)" }}>com {teacherName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--js-text-muted)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">

          {/* Active calls */}
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ color: "var(--js-accent-purple)" }} />
            </div>
          ) : activeRooms.length > 0 ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--js-accent-amber)" }}>
                Chamadas em andamento
              </p>
              {activeRooms.map(room => (
                <button key={room.roomId}
                  onClick={() => onJoinGroup(room.roomId)}
                  className="w-full p-3 rounded-2xl flex items-center justify-between transition-all active:scale-95"
                  style={{ backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      {room.participants.slice(0, 3).map((p: any, i: number) => (
                        p.avatar ? (
                          <img key={i} src={p.avatar} className="w-8 h-8 rounded-full border-2 border-black object-cover" alt={p.name} />
                        ) : (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "var(--js-accent-purple)", color: "#fff" }}>
                            {(p.name || "?")[0].toUpperCase()}
                          </div>
                        )
                      ))}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold" style={{ color: "var(--js-text-primary)" }}>
                        {room.participants.map((p: any) => p.name).join(", ")}
                      </p>
                      <p className="text-[10px]" style={{ color: "#6ee7b7" }}>
                        {room.participantCount} aluno{room.participantCount > 1 ? "s" : ""} na chamada
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: "#16a34a", color: "#fff" }}>
                    Entrar
                  </div>
                </button>
              ))}
              <div className="pt-1" style={{ borderTop: "1px solid var(--js-border)" }} />
            </>
          ) : (
            <div className="text-center py-3">
              <p className="text-xs" style={{ color: "var(--js-text-muted)" }}>Nenhuma chamada ativa no momento</p>
            </div>
          )}

          {/* Start new individual call */}
          <button onClick={onStartIndividual}
            className="w-full p-4 rounded-2xl flex items-center space-x-4 transition-all active:scale-95"
            style={{ backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #f59e0b)" }}>
              <Video className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: "var(--js-text-primary)" }}>Nova Chamada</p>
              <p className="text-[10px]" style={{ color: "var(--js-text-muted)" }}>Outros alunos podem entrar depois</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};
