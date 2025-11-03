import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Proxy fetch for external Excalidraw JSON files with basic validation
    "/api/fetch": {
      async OPTIONS(req) {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      },
      async GET(req) {
        try {
          const urlParam = new URL(req.url).searchParams.get("url");
          if (!urlParam) {
            return new Response(
              JSON.stringify({ error: "Missing 'url' query parameter" }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              },
            );
          }

          // Basic SSRF guard: only allow http/https
          if (!/^https?:\/\//i.test(urlParam)) {
            return new Response(
              JSON.stringify({ error: "Only http(s) URLs are allowed" }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              },
            );
          }

          const upstream = await fetch(urlParam, {
            // Forward a simple Accept header for JSON/text
            headers: { Accept: "application/json,text/plain;q=0.9,*/*;q=0.8" },
          });

          if (!upstream.ok) {
            return new Response(
              JSON.stringify({
                error: `Upstream responded with ${upstream.status}`,
              }),
              {
                status: 502,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              },
            );
          }

          // Try to preserve JSON content-type; default to application/json
          const contentType =
            upstream.headers.get("content-type") ?? "application/json";
          const body = await upstream.text();

          return new Response(body, {
            status: 200,
            headers: {
              "Content-Type": contentType.startsWith("application/json")
                ? "application/json"
                : "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch the provided URL" }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }
      },
    },

    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
