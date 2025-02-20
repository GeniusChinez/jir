import { z } from "zod";

// Regex pattern for a general chess move in algebraic notation
export const chessMoveSchema = z
  .string()
  .regex(
    /^(?:(K|Q|R|B|N|)([a-h][1-8])(?:x([a-h][1-8]))?|([a-h][1-8])(?:x([a-h][1-8])))(=[QRBN])?([+#])?$/,
    {
      message: "Invalid chess move notation",
    },
  );

// Explanation of Regex:
// - The first part matches moves like "Nf3", "Qd5", "e5" (for pawns, no piece letter)
// - The second part matches captures, e.g., "Nxe5" or "exd5"
// - The third part optionally matches promotion, e.g., "e8=Q"
// - The final part optionally matches check ("+") or checkmate ("#") signs
