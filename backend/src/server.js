import "dotenv/config";
import app from "./app.js";

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error("Defina DATABASE_URL e JWT_SECRET no arquivo .env");
  process.exit(1);
}

const porta = Number(process.env.PORT) || 3333;

app.listen(porta, () => {
  console.log(`API rodando em http://localhost:${porta}`);
});
