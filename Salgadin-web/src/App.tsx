import { MotionConfig } from "framer-motion";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  // "user": respeita a preferência "reduzir movimento" do sistema em todo o app.
  return (
    <MotionConfig reducedMotion="user">
      <AppRoutes />
    </MotionConfig>
  );
}
