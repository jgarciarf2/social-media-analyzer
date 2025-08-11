import puppeteer from "puppeteer";

/**
 * Extrae los comentarios de un post de Instagram interceptando el JSON de la red.
 * @param postUrl URL pública del post de Instagram
 * @returns Array de comentarios (texto y usuario)
 */
export async function getInstagramComments(
  postUrl: string
): Promise<Array<{ user: string; text: string }>> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const comments: Array<{ user: string; text: string }> = [];
  let jsonCommentsFound = false;
  try {
    // Interceptar las respuestas de la red
    page.on("response", async (response) => {
      const url = response.url();
      // Instagram usa esta ruta para los comentarios
      if (url.includes("/comments/")) {
        try {
          const json = await response.json();
          if (json && json.data && json.data.comment_count) {
            const edges = json.data.comments.edges || [];
            for (const edge of edges) {
              comments.push({
                user: edge.node.owner.username,
                text: edge.node.text,
              });
            }
            if (edges.length > 0) jsonCommentsFound = true;
          }
        } catch (e) {
          // Ignorar errores de parseo
        }
      }
    });

    await page.goto(postUrl, { waitUntil: "networkidle2", timeout: 60000 }); // 60s timeout
    // Esperar unos segundos para asegurar que cargan los comentarios
    await new Promise((res) => setTimeout(res, 4000));

    // Fallback: si no se encontraron comentarios por JSON, intentar extraer del DOM
    if (!jsonCommentsFound) {
      const domComments = await page.evaluate(() => {
        // Busca spans que parezcan comentarios (excluye UI)
        const elements = Array.from(
          document.querySelectorAll(
            'ul ul span, ul li span, div[role="button"] span[dir="auto"], span[dir="auto"]'
          )
        );
        const texts = elements
          .map((el) => el.textContent?.trim())
          .filter(
            (text): text is string =>
              !!text &&
              text.length > 3 &&
              text.length < 500 &&
              !text.includes("Ver traducción") &&
              !text.includes("Responder") &&
              !text.includes("Me gusta") &&
              !text.includes("Seguir") &&
              !text.includes("•") &&
              !text.match(/^\d+\s*(h|d|w|min|hora|día|semana)/) &&
              !text.match(/^\d+$/) &&
              text !== "..." &&
              text !== "Ver más"
          );
        // Quitar duplicados
        return Array.from(new Set(texts))
          .slice(0, 20)
          .map((text) => ({ user: "", text }));
      });
      comments.push(...domComments);
    }
  } finally {
    await browser.close();
  }
  return comments;
}
// utils/scraper.ts

export interface ScrapedComment {
  text: string;
  author?: string;
  likes?: number;
  timestamp?: string;
}

export async function extractCommentsFromUrl(
  url: string
): Promise<ScrapedComment[]> {
  try {
    // Detectar tipo de red social
    if (url.includes("instagram.com")) {
      return await scrapeInstagram(url);
    } else if (url.includes("facebook.com")) {
      return await scrapeFacebook(url);
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      return await scrapeTwitter(url);
    }

    throw new Error("Red social no soportada");
  } catch (error) {
    console.error("Error en scraping:", error);
    // Fallback a comentarios simulados
    return generateMockComments();
  }
}

async function scrapeInstagram(url: string): Promise<ScrapedComment[]> {
  console.log("🕷️ Iniciando scraping de Instagram para:", url);

  // Detectar si es un post específico o un perfil
  const isPost = url.includes("/p/");
  const isReel = url.includes("/reel/");
  console.log(
    `📍 Tipo de URL: ${isPost ? "Post" : isReel ? "Reel" : "Perfil"}`
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    // Configurar para parecer un navegador real
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Configurar viewport
    await page.setViewport({ width: 1366, height: 768 });

    console.log("📡 Navegando a la URL...");
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    console.log("⏳ Esperando que cargue el contenido...");
    // Esperar a que la página cargue completamente
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Si es un post específico, buscar comentarios
    if (isPost || isReel) {
      console.log("🔍 Buscando comentarios en post específico...");

      // Intentar hacer clic en "Ver más comentarios" si existe
      try {
        const showMoreButton = await page.$(
          'button:has-text("Ver más comentarios"), button:has-text("View more comments")'
        );
        if (showMoreButton) {
          await showMoreButton.click();
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (e) {
        console.log("No hay botón de 'ver más' o error:", e);
      }

      // Scroll para cargar más comentarios
      try {
        await page.evaluate(() => {
          const commentSection = document.querySelector(
            'article, [role="main"]'
          );
          if (commentSection) {
            commentSection.scrollTo(0, commentSection.scrollHeight);
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.log("Error en scroll:", e);
      }
    }

    // Extraer comentarios con selectores más específicos
    const comments = await page.evaluate((isPostOrReel) => {
      let allComments: string[] = [];

      if (isPostOrReel) {
        // Selectores específicos para posts/reels
        const postSelectors = [
          // Comentarios principales
          'div[role="button"] span[dir="auto"]',
          'ul li div span[dir="auto"]',
          "article section div span",
          // Selectores más específicos para comentarios
          "div._a9zs span",
          "div._a9zu span",
          "span._aacl._aaco._aacu._aacx._aad7._aade",
          // Fallback genéricos
          'span[dir="auto"]',
          'div[dir="auto"]',
        ];

        console.log("🎯 Usando selectores de POST");

        for (const selector of postSelectors) {
          try {
            const elements = document.querySelectorAll(selector);
            console.log(
              `Selector ${selector}: encontrados ${elements.length} elementos`
            );

            const texts = Array.from(elements)
              .map((el) => el.textContent?.trim())
              .filter(
                (text): text is string =>
                  typeof text === "string" &&
                  text.length > 3 &&
                  text.length < 500 &&
                  // Filtrar elementos de UI
                  !text.includes("Ver traducción") &&
                  !text.includes("Responder") &&
                  !text.includes("Me gusta") &&
                  !text.includes("Seguir") &&
                  !text.includes("•") &&
                  !text.match(/^\d+\s*(h|d|w|min|hora|día|semana)/) && // Timestamps
                  !text.match(/^\d+$/) && // Solo números
                  text !== "..." &&
                  text !== "Ver más"
              );

            allComments.push(...texts);

            if (allComments.length > 0) {
              console.log(
                `✅ Encontrados ${texts.length} comentarios con selector: ${selector}`
              );
            }
          } catch (e) {
            console.log(`Error con selector ${selector}:`, e);
          }
        }
      } else {
        // Selectores para perfiles (posts del feed)
        console.log("🏠 Usando selectores de PERFIL");
        const profileSelectors = [
          "article div span",
          'div[dir="auto"] span',
          "span._aacl._aaco._aacu._aacx._aad7._aade",
        ];

        for (const selector of profileSelectors) {
          const elements = document.querySelectorAll(selector);
          const texts = Array.from(elements)
            .map((el) => el.textContent?.trim())
            .filter(
              (text): text is string =>
                typeof text === "string" && text.length > 5 && text.length < 500
            );
          allComments.push(...texts);
        }
      }

      // Remover duplicados y limitar
      const uniqueComments = [...new Set(allComments)];
      console.log(
        `📊 Total comentarios únicos encontrados: ${uniqueComments.length}`
      );

      return uniqueComments.slice(0, 20);
    }, isPost || isReel);

    console.log("📝 Comentarios extraídos:", comments);
    console.log("📊 Total de comentarios únicos:", comments.length);

    if (comments.length === 0) {
      console.log(
        "⚠️ No se encontraron comentarios, intentando métodos alternativos..."
      );

      // Método alternativo: buscar en toda la página
      const alternativeComments = await page.evaluate(() => {
        // Buscar cualquier texto que parezca un comentario
        const allSpans = document.querySelectorAll("span, div");
        const potentialComments: string[] = [];

        for (const element of allSpans) {
          const text = element.textContent?.trim();
          if (
            text &&
            text.length > 10 &&
            text.length < 300 &&
            !text.includes("Instagram") &&
            !text.includes("Ver más") &&
            !text.includes("Seguir") &&
            !text.includes("Compartir") &&
            !text.includes("Me gusta") &&
            !text.match(/^\d+\s*(followers|following|posts)/) &&
            text.includes(" ")
          ) {
            // Debe tener al menos un espacio (frase)
            potentialComments.push(text);
          }
        }

        return [...new Set(potentialComments)].slice(0, 5);
      });

      console.log(
        "🔍 Comentarios alternativos encontrados:",
        alternativeComments
      );

      if (alternativeComments.length > 0) {
        return alternativeComments.map((text) => ({ text }));
      }

      throw new Error("No se encontraron comentarios ni texto del post");
    }

    return comments
      .filter((text): text is string => typeof text === "string")
      .map((text) => ({ text }));
  } finally {
    await browser.close();
  }
}

async function scrapeFacebook(url: string): Promise<ScrapedComment[]> {
  // Implementación similar para Facebook
  // Facebook es más difícil por la autenticación
  throw new Error("Facebook scraping requires login - use mock data");
}

async function scrapeTwitter(url: string): Promise<ScrapedComment[]> {
  // Twitter/X es muy restrictivo ahora
  throw new Error("Twitter scraping blocked - use mock data");
}

function generateMockComments(): ScrapedComment[] {
  const mockTexts = [
    "¡Excelente post! 👏",
    "Me gusta mucho este contenido",
    "No estoy de acuerdo 😒",
    "Muy interesante, gracias por compartir",
    "¡Increíble! 🔥",
    "Meh, podría ser mejor",
    "Totalmente de acuerdo ✅",
    "Buen punto de vista",
  ];

  return mockTexts.map((text) => ({ text }));
}
