import puppeteer from "puppeteer";

/**
 * Extrae los comentarios de un post de Instagram interceptando el JSON de la red.
 * @param postUrl URL pública del post de Instagram
 * @returns Array de comentarios (texto y usuario)
 */
export async function getInstagramComments(
  postUrl: string
): Promise<Array<{ user: string; text: string }>> {
  const browser = await puppeteer.launch({
    headless: false, // Cambiar a false para debug
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
    ],
  });
  const page = await browser.newPage();
  const comments: Array<{ user: string; text: string }> = [];
  let jsonCommentsFound = false;

  try {
    // Configurar headers realistas ANTES de configurar interceptor
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1920, height: 1080 });

    // Configurar cookies/headers extras
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });

    console.log("🔧 Configurando interceptor de red...");

    // Interceptar las respuestas de la red ANTES de navegar
    page.on("response", async (response) => {
      const url = response.url();
      console.log(`📡 Interceptada URL: ${url.substring(0, 100)}...`);

      // Interceptar específicamente la respuesta HTML del post de Instagram
      if (
        url === postUrl ||
        (url.includes("instagram.com/p/") && !url.includes("?"))
      ) {
        console.log(`🎯 Interceptando página principal del post: ${url}`);

        try {
          const responseText = await response.text();
          console.log(`📄 HTML tamaño: ${responseText.length} chars`);

          // Buscar todos los JSON embebidos en el HTML
          const scriptMatches = responseText.match(
            /<script[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g
          );

          if (scriptMatches) {
            console.log(
              `📋 Encontrados ${scriptMatches.length} scripts JSON en HTML`
            );

            for (const scriptMatch of scriptMatches) {
              const jsonContent = scriptMatch
                .replace(/<script[^>]*>/, "")
                .replace(/<\/script>/, "")
                .trim();

              if (
                jsonContent.includes('"require"') &&
                jsonContent.includes('"text"')
              ) {
                console.log(
                  "🎯 Encontrado JSON con require y comentarios en HTML"
                );

                try {
                  const jsonData = JSON.parse(jsonContent);
                  const foundComments = findCommentsRecursively(jsonData);

                  if (foundComments.length > 0) {
                    console.log(
                      `📊 Encontrados ${foundComments.length} comentarios en JSON embebido`
                    );
                    comments.push(...foundComments);
                    jsonCommentsFound = true;
                  }
                } catch (e) {
                  console.log("❌ Error parseando JSON embebido:", e);
                }
              }
            }
          }
        } catch (e) {
          console.log(`❌ Error procesando HTML: ${e}`);
        }
      }

      // Solo procesar URLs que pueden contener comentarios o cualquier respuesta grande de Instagram
      const shouldProcess =
        url.includes("/comments") ||
        url.includes("PolarisPostComments") ||
        url.includes("comment") ||
        url.includes("graphql") ||
        url.includes("/api/");

      if (shouldProcess) {
        console.log(
          `🎯 URL candidata para comentarios: ${url.substring(0, 150)}...`
        );

        try {
          const responseText = await response.text();
          console.log(`📄 Respuesta tamaño: ${responseText.length} chars`);

          // Buscar CUALQUIER respuesta que contenga "require" y comentarios
          if (
            responseText.includes('"require"') &&
            responseText.includes('"text"')
          ) {
            console.log(
              "🎯 Interceptada respuesta con estructura 'require' y comentarios"
            );

            try {
              const jsonData = JSON.parse(responseText);
              console.log(
                "🔍 Estructura del JSON con require:",
                Object.keys(jsonData)
              );

              // Usar la función recursiva
              const foundComments = findCommentsRecursively(jsonData);
              if (foundComments.length > 0) {
                console.log(
                  `📊 Encontrados ${foundComments.length} comentarios en estructura require`
                );
                comments.push(...foundComments);
                jsonCommentsFound = true;
              }
            } catch (e) {
              console.log("❌ Error parseando JSON con require:", e);
            }
          }

          // Buscar el patrón específico de comentarios de Instagram
          else if (
            responseText.includes(
              "xdt_api__v1__media__media_id__comments__connection"
            )
          ) {
            console.log(
              "🎯 Interceptada respuesta con comentarios de Instagram"
            );

            try {
              // Parsear el JSON complejo
              const jsonData = JSON.parse(responseText);

              // Navegar por la estructura anidada para encontrar los comentarios
              if (jsonData.require) {
                for (const requireItem of jsonData.require) {
                  if (requireItem[1] === "handle" && requireItem[3]) {
                    for (const handleItem of requireItem[3]) {
                      if (handleItem.__bbox?.require) {
                        for (const bboxRequire of handleItem.__bbox.require) {
                          if (bboxRequire[1] === "next" && bboxRequire[3]) {
                            for (const nextItem of bboxRequire[3]) {
                              const result = nextItem[1]?.__bbox?.result?.data;
                              const commentsConnection =
                                result?.xdt_api__v1__media__media_id__comments__connection;

                              if (commentsConnection?.edges) {
                                console.log(
                                  `📊 Encontrados ${commentsConnection.edges.length} comentarios en JSON`
                                );

                                for (const edge of commentsConnection.edges) {
                                  if (
                                    edge.node?.text &&
                                    edge.node?.user?.username
                                  ) {
                                    console.log(
                                      `👤 @${edge.node.user.username}: ${edge.node.text}`
                                    );
                                    comments.push({
                                      user: edge.node.user.username,
                                      text: edge.node.text,
                                    });
                                  }
                                }

                                if (commentsConnection.edges.length > 0) {
                                  jsonCommentsFound = true;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            } catch (e) {
              console.log(
                "❌ Error parseando JSON con comentarios específicos:",
                e
              );
            }
          } else if (
            responseText.includes("comments") ||
            responseText.includes("comment")
          ) {
            console.log(
              "🔍 Respuesta contiene 'comments' pero no la estructura esperada"
            );

            // Debug: Mostrar estructura alternativa de comentarios
            if (responseText.length > 50000) {
              console.log("📋 Analizando respuesta grande para comentarios...");

              // Buscar patrones alternativos
              if (
                responseText.includes('"edges"') &&
                responseText.includes('"text"')
              ) {
                console.log("🎯 Encontrados edges y text en respuesta");

                try {
                  const jsonData = JSON.parse(responseText);
                  console.log("🔍 Estructura del JSON:", Object.keys(jsonData));

                  // Debug: explorar la estructura 'data'
                  if (jsonData.data) {
                    console.log("📋 Keys en data:", Object.keys(jsonData.data));

                    // Buscar cualquier campo que contenga 'comment'
                    for (const [key, value] of Object.entries(jsonData.data)) {
                      if (key.includes("comment") || key.includes("media")) {
                        console.log(`🔍 Campo ${key}:`, typeof value);
                        if (typeof value === "object" && value !== null) {
                          console.log(`📋 Keys en ${key}:`, Object.keys(value));
                        }
                      }
                    }
                  }

                  // Buscar recursivamente comentarios
                  const foundComments = findCommentsRecursively(jsonData);
                  if (foundComments.length > 0) {
                    console.log(
                      `📊 Encontrados ${foundComments.length} comentarios por búsqueda recursiva`
                    );
                    comments.push(...foundComments);
                    jsonCommentsFound = true;
                  }
                } catch (e) {
                  console.log("❌ Error parseando JSON alternativo:", e);
                }
              }
            }
          }
        } catch (e) {
          console.log(`❌ Error procesando respuesta: ${e}`);
        }
      }
    });

    console.log("🌐 Navegando a Instagram...");
    await page.goto(postUrl, { waitUntil: "networkidle2", timeout: 60000 }); // 60s timeout

    console.log("⏳ Esperando carga de comentarios...");
    // Esperar más tiempo para asegurar que cargan los comentarios
    await new Promise((res) => setTimeout(res, 8000));

    // NO hacer fallback al DOM - solo usar JSON interceptado
  } finally {
    await browser.close();
  }

  // DEDUPLICACIÓN: Eliminar comentarios duplicados usando Map
  const uniqueComments = new Map<string, { user: string; text: string }>();
  for (const comment of comments) {
    const key = `${comment.user}:${comment.text}`;
    uniqueComments.set(key, comment);
  }

  const finalComments = Array.from(uniqueComments.values());

  if (jsonCommentsFound) {
    console.log(
      `🟢 Comentarios extraídos desde JSON: ${finalComments.length} únicos (de ${comments.length} totales)`
    );
  } else {
    console.log(`⚠️ No se encontraron comentarios en JSON interceptado`);
  }
  return finalComments;
}

// Función auxiliar para buscar comentarios recursivamente en cualquier estructura
function findCommentsRecursively(
  obj: any
): Array<{ user: string; text: string }> {
  const comments: Array<{ user: string; text: string }> = [];

  function searchRecursively(current: any, path: string = "") {
    if (typeof current !== "object" || current === null) return;

    // Búsqueda específica para la estructura de Instagram
    if (current.require && Array.isArray(current.require)) {
      for (const requireItem of current.require) {
        if (
          Array.isArray(requireItem) &&
          requireItem[1] === "handle" &&
          requireItem[3]
        ) {
          for (const handleItem of requireItem[3]) {
            if (handleItem.__bbox?.require) {
              for (const bboxRequire of handleItem.__bbox.require) {
                if (
                  Array.isArray(bboxRequire) &&
                  bboxRequire[1] === "next" &&
                  bboxRequire[3]
                ) {
                  for (const nextItem of bboxRequire[3]) {
                    if (nextItem[1]?.__bbox?.result?.data) {
                      const data = nextItem[1].__bbox.result.data;
                      const commentsConnection =
                        data.xdt_api__v1__media__media_id__comments__connection;

                      if (
                        commentsConnection?.edges &&
                        Array.isArray(commentsConnection.edges)
                      ) {
                        console.log(
                          `🎯 Encontrados ${commentsConnection.edges.length} comentarios en estructura específica`
                        );

                        for (const edge of commentsConnection.edges) {
                          if (edge.node?.text && edge.node?.user?.username) {
                            console.log(
                              `👤 @${edge.node.user.username}: ${edge.node.text}`
                            );
                            comments.push({
                              user: edge.node.user.username,
                              text: edge.node.text,
                            });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Búsqueda genérica para otros casos
    if (Array.isArray(current)) {
      for (const item of current) {
        if (item?.node?.text && item?.node?.user?.username) {
          console.log(`👤 @${item.node.user.username}: ${item.node.text}`);
          comments.push({
            user: item.node.user.username,
            text: item.node.text,
          });
        }
        searchRecursively(item, path + "[array]");
      }
    }

    // Si es un objeto, buscar en sus propiedades
    if (typeof current === "object") {
      for (const [key, value] of Object.entries(current)) {
        searchRecursively(value, path + "." + key);
      }
    }
  }

  searchRecursively(obj);
  return comments;
}

// Interfaces adicionales para compatibilidad
export interface ScrapedComment {
  text: string;
  author?: string;
  likes?: number;
  timestamp?: string;
}

/**
 * Función unificada para extraer comentarios de diferentes redes sociales
 * @param url URL del post de la red social
 * @returns Array de comentarios extraídos
 */
export async function extractCommentsFromUrl(
  url: string
): Promise<ScrapedComment[]> {
  try {
    // Detectar tipo de red social
    if (url.includes("instagram.com")) {
      const instagramComments = await getInstagramComments(url);
      // Convertir formato para compatibilidad
      return instagramComments.map((comment) => ({
        text: comment.text,
        author: comment.user,
      }));
    } else if (url.includes("facebook.com")) {
      throw new Error("Facebook scraping requires login - use mock data");
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      throw new Error("Twitter scraping blocked - use mock data");
    }

    throw new Error("Red social no soportada");
  } catch (error) {
    console.error("Error en scraping:", error);
    // Fallback a comentarios simulados
    return generateMockComments();
  }
}

/**
 * Genera comentarios simulados para testing o fallback
 */
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
