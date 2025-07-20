import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL es requerida" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key de Gemini no configurada" },
        { status: 500 }
      );
    }

    // Simular datos para el prototipo
    // En una versión completa, aquí extraerías los comentarios reales de la URL
    const mockComments = generateMockComments();

    // Prompt para Gemini AI
    const prompt = `
    Analiza los siguientes comentarios de redes sociales y clasifícalos por sentimiento.
    Proporciona un análisis estadístico y un resumen.

    Comentarios:
    ${mockComments.join("\n")}

    Por favor responde en formato JSON con esta estructura exacta:
    {
      "positive": número de comentarios positivos,
      "negative": número de comentarios negativos,
      "neutral": número de comentarios neutros,
      "total": número total de comentarios,
      "summary": "Un resumen detallado del análisis de sentimientos y tendencias observadas"
    }
    `;

    // Llamar a Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Intentar parsear la respuesta JSON
    let analysis: SentimentAnalysis;
    try {
      // Extraer JSON de la respuesta (puede venir con markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se encontró JSON válido en la respuesta");
      }
    } catch (parseError) {
      // Fallback: crear análisis basado en respuesta de texto
      analysis = createFallbackAnalysis(mockComments, text);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error en análisis:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Generar comentarios de ejemplo para el prototipo
function generateMockComments(): string[] {
  const positiveComments = [
    "¡Me encanta esta publicación! 😍",
    "Excelente contenido, sigue así 👏",
    "¡Qué inspirador! Gracias por compartir ❤️",
    "Increíble trabajo, me motivaste mucho 🚀",
    "¡Fantástico! Definitivamente lo intentaré 🙌",
  ];

  const negativeComments = [
    "No me gusta para nada esto 😒",
    "Qué decepcionante, esperaba más",
    "No estoy de acuerdo con esta opinión 👎",
    "Muy mal contenido, no lo recomiendo",
    "Pérdida de tiempo 😴",
  ];

  const neutralComments = [
    "Interesante punto de vista",
    "Gracias por la información",
    "Ok, entiendo",
    "Buen dato para recordar",
    "Anotado ✍️",
  ];

  // Mezclar comentarios aleatoriamente
  const allComments = [
    ...positiveComments,
    ...negativeComments,
    ...neutralComments,
  ];

  // Seleccionar comentarios aleatorios
  const shuffled = allComments.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 15) + 10); // Entre 10 y 25 comentarios
}

// Crear análisis fallback si el parsing JSON falla
function createFallbackAnalysis(
  comments: string[],
  aiResponse: string
): SentimentAnalysis {
  const total = comments.length;

  // Análisis simple basado en palabras clave
  let positive = 0;
  let negative = 0;

  comments.forEach((comment) => {
    const lowerComment = comment.toLowerCase();
    if (
      lowerComment.includes("excelente") ||
      lowerComment.includes("me encanta") ||
      lowerComment.includes("fantástico") ||
      lowerComment.includes("increíble") ||
      lowerComment.includes("❤️") ||
      lowerComment.includes("😍") ||
      lowerComment.includes("👏")
    ) {
      positive++;
    } else if (
      lowerComment.includes("malo") ||
      lowerComment.includes("no me gusta") ||
      lowerComment.includes("decepcionante") ||
      lowerComment.includes("👎") ||
      lowerComment.includes("😒") ||
      lowerComment.includes("😴")
    ) {
      negative++;
    }
  });

  const neutral = total - positive - negative;

  return {
    positive,
    negative,
    neutral,
    total,
    summary:
      aiResponse ||
      "Análisis completado. Se detectaron diversos sentimientos en los comentarios analizados.",
  };
}
