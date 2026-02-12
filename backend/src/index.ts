import app from "./app";
import { env } from "./config/env";
import { startRecurringScheduler } from "./services/recurringService";

app.listen(env.PORT, () => {
  console.log(`API running on port ${env.PORT}`);
});

startRecurringScheduler();
