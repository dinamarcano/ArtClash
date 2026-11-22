import { app } from "./app";
import { config } from "./config";

if (!config.isVercel) {
  app.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port}`);
  });
}

export default app;
