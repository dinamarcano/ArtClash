import { mascotsRepository } from "../mascots/mascots.repository";
import { usersRepository } from "../users/users.repository";
import { roomsRepository } from "./rooms.repository";
import { RecentVote, RoomState } from "./rooms.types";

const XP_PER_VOTE = 50;
const FEED_SIZE = 6;

// Número pseudoaleatorio determinista entre 0 y 1: misma semilla, mismo resultado
const seeded = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const votesAt = (rate: number, seconds: number): number =>
  Math.floor(rate * seconds);

export const roomsService = {
  getByCode: async (
    code: string,
    now: number = Date.now()
  ): Promise<RoomState | null> => {
    const room = await roomsRepository.findByCode(code);
    if (!room) return null;

    const [mascotA, mascotB] = await Promise.all([
      mascotsRepository.findById(room.mascotAId),
      mascotsRepository.findById(room.mascotBId),
    ]);
    if (!mascotA || !mascotB) return null;

    const users = await usersRepository.findAll();

    // Ciclo repetitivo: votación + pantalla de resultado, y vuelve a empezar
    const cycle = room.voteDurationSeconds + room.resultDurationSeconds;
    const secondsSinceEpoch = Math.max(
      0,
      Math.floor((now - room.epochMs) / 1000)
    );
    const round = Math.floor(secondsSinceEpoch / cycle);
    const elapsed = secondsSinceEpoch % cycle;
    const isLive = elapsed < room.voteDurationSeconds;
    const votingSeconds = Math.min(elapsed, room.voteDurationSeconds);

    // Votos por segundo de cada lado; cada cuarta ronda termina en empate
    const rateA = 0.6 + seeded(round * 2 + 1) * 1.2;
    const rateB = round % 4 === 3 ? rateA : 0.6 + seeded(round * 2 + 2) * 1.2;

    const votesA = votesAt(rateA, votingSeconds);
    const votesB = votesAt(rateB, votingSeconds);
    const totalVotes = votesA + votesB;
    const percentA =
      totalVotes === 0 ? 50 : Math.round((votesA / totalVotes) * 100);

    const isTie = !isLive && votesA === votesB;
    const winnerMascotId =
      isLive || isTie ? null : votesA > votesB ? mascotA.id : mascotB.id;

    // Feed de votos recientes, coherente con los totales
    const recentVotes: RecentVote[] = [];
    const sides = [
      { mascot: mascotA, rate: rateA },
      { mascot: mascotB, rate: rateB },
    ];
    for (
      let s = votingSeconds - 1;
      s >= 0 && recentVotes.length < FEED_SIZE;
      s--
    ) {
      for (const side of sides) {
        const count = votesAt(side.rate, s + 1) - votesAt(side.rate, s);
        for (let i = 0; i < count && recentVotes.length < FEED_SIZE; i++) {
          const seed = round * 1000 + s * 10 + i + side.mascot.id;
          const user = users[Math.floor(seeded(seed) * users.length)];
          recentVotes.push({
            username: user.username,
            mascotName: side.mascot.name,
            xpAwarded: XP_PER_VOTE,
            secondsAgo: votingSeconds - s,
          });
        }
      }
    }

    return {
      code: room.code,
      round: round + 1,
      status: isLive ? "live" : "finished",
      secondsRemaining: isLive
        ? room.voteDurationSeconds - elapsed
        : cycle - elapsed,
      durationSeconds: room.voteDurationSeconds,
      contenders: [
        { mascot: mascotA, votes: votesA, percentage: percentA },
        { mascot: mascotB, votes: votesB, percentage: 100 - percentA },
      ],
      totalVotes,
      winnerMascotId,
      isTie,
      recentVotes,
    };
  },
};