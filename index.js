const app = require("./app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("\n");
  console.log(
    "\x1b[35m%s\x1b[0m",
    "Server listening on http://localhost:" + PORT
  );
  console.log(
    "\x1b[35m%s\x1b[0m",
    "View admin portal on http://localhost:" + PORT + "/admin"
  );
});

