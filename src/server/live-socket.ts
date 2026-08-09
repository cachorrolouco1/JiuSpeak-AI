import { Server as SocketServer } from 'socket.io';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  belt: string;
  isTeacher: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
}

interface Room {
  id: string;
  teacherId: string;
  participants: Map<string, Participant>;
  createdAt: number;
}

const rooms = new Map<string, Room>();

export function getActiveRooms() {
  const result: any[] = [];
  rooms.forEach((room, roomId) => {
    if (room.participants.size > 0) {
      result.push({
        roomId,
        teacherId: room.teacherId,
        participantCount: room.participants.size,
        participants: Array.from(room.participants.values()).map(p => ({ name: p.name, avatar: p.avatar, belt: p.belt })),
        createdAt: room.createdAt,
      });
    }
  });
  return result;
}

export function initLiveSocket(httpServer: any) {
  const io = new SocketServer(httpServer, { cors: { origin: '*' }, path: '/live-socket' });

  io.on('connection', (socket) => {
    socket.on('join-room', (data: { roomId: string; participant: Participant }) => {
      const { roomId, participant } = data;
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { id: roomId, teacherId: 'marcos', participants: new Map(), createdAt: Date.now() });
      }
      const room = rooms.get(roomId)!;
      participant.id = socket.id;
      room.participants.set(socket.id, participant);
      socket.join(roomId);
      io.to(roomId).emit('participants-updated', Array.from(room.participants.values()));
    });

    socket.on('toggle-mute', (roomId: string) => {
      const room = rooms.get(roomId);
      if (room?.participants.has(socket.id)) {
        room.participants.get(socket.id)!.isMuted = !room.participants.get(socket.id)!.isMuted;
        io.to(roomId).emit('participants-updated', Array.from(room.participants.values()));
      }
    });

    socket.on('toggle-camera', (roomId: string) => {
      const room = rooms.get(roomId);
      if (room?.participants.has(socket.id)) {
        room.participants.get(socket.id)!.isCameraOn = !room.participants.get(socket.id)!.isCameraOn;
        io.to(roomId).emit('participants-updated', Array.from(room.participants.values()));
      }
    });

    socket.on('leave-room', (roomId: string) => handleLeave(socket, roomId, io));
    socket.on('disconnect', () => { rooms.forEach((_, rid) => { if (rooms.get(rid)?.participants.has(socket.id)) handleLeave(socket, rid, io); }); });
  });
  return io;
}

function handleLeave(socket: any, roomId: string, io: any) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.participants.delete(socket.id);
  socket.leave(roomId);
  if (room.participants.size === 0) rooms.delete(roomId);
  else io.to(roomId).emit('participants-updated', Array.from(room.participants.values()));
}
