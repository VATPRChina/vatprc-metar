import { createServer } from "node:http";

if (!process.env["RUDI_METAR_SERVER"]) {
  console.error(
    "Rudi's metar server address is not provided. Please provide it in RUDI_METAR_SERVER environment variable.",
  );
  process.exit(1);
}
const rudiMetarServer = process.env["RUDI_METAR_SERVER"];
let cache = "";
let cacheTime = 0;

const server = createServer((req, res) => {
  try {
    if (Date.now() - cacheTime > 1000 * 120) {
      console.log(
        `Update METAR data ${new Date().toISOString()} - ${new Date(cacheTime).toISOString()}`,
      );
      fetch(rudiMetarServer)
        .then((r) => r.text())
        .then((r) => {
          console.log(`Fetched new METAR data at ${new Date().toISOString()}`);
          cache = r;
          cacheTime = Date.now();
        })
        .catch(console.error);
    }

    const url = new URL(`http://localhost${req.url}`);
    const id = url.searchParams.get("id");
    if (!id) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("No METAR found");
    } else if (id === "ALL") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(cache);
    } else {
      const metar = cache
        .split("\n")
        .filter((l) => l.startsWith(id))
        .join("\n");
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(metar);
    }
  } catch (e) {
    console.error(e, req.url);

    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

const main = () => {
  server.listen(3000);

  console.log("vatprc metar listening on 3000");
};

main();
