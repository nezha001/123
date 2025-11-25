import { GoogleGenAI, Type } from "@google/genai";
import { Piece, Color } from '../types';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';

// Helper to convert board to text representation for LLM
const boardToText = (pieces: Map<string, Piece>): string => {
  let boardStr = "  0 1 2 3 4 5 6 7 8\n";
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    boardStr += `${y} `;
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const piece = pieces.get(`${x},${y}`);
      if (piece) {
        // Use single char abbreviation
        const char = piece.type.charAt(0).toUpperCase();
        boardStr += piece.color === 'red' ? `R${char}` : `B${char}`;
      } else {
        boardStr += ' .';
      }
      boardStr += ' ';
    }
    boardStr += '\n';
  }
  return boardStr;
};

export const getAIMove = async (
  pieces: Map<string, Piece>, 
  aiColor: Color
): Promise<{ from: { x: number, y: number }, to: { x: number, y: number } } | null> => {
  
  if (!process.env.API_KEY) {
    console.error("No API KEY");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const boardStr = boardToText(pieces);
  
  const systemInstruction = `
    You are a Grandmaster Chinese Chess (Xiangqi) engine. 
    You are playing as ${aiColor.toUpperCase()}.
    The board is 9x10.
    R = Red (Start at bottom, y=9), B = Black (Start at top, y=0).
    Piece Types: G=General, A=Advisor, E=Elephant, H=Horse, C=Chariot, N=Cannon, S=Soldier.
    
    Current Board State:
    ${boardStr}

    Rules:
    1. Analyze the board carefully.
    2. Check for checks, captures, and threats.
    3. Return the BEST valid move for ${aiColor}.
    4. Ensure the move strictly follows Xiangqi movement rules.
    5. The coordinate system is x (0-8) and y (0-9).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Make a move for ${aiColor}.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            from: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.INTEGER },
                y: { type: Type.INTEGER }
              }
            },
            to: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.INTEGER },
                y: { type: Type.INTEGER }
              }
            },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    const json = JSON.parse(text);
    return json;

  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};
