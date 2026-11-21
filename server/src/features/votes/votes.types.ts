export interface Vote {
  id: number;
  userId: number;
  mascotId: number;
  roomCode: string;
  xpAwarded: number;
  // pg devuelve un Date; al enviarlo como JSON viaja como texto ISO
  createdAt: Date;
}