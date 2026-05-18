// ──────────────────────────────────────────────
// Şikâyetler Sayfası — Rol bazlı yönlendirme
// Admin/Personel → SikayetYonetimiPage
// Öğrenci → SikayetlerimPage
// ──────────────────────────────────────────────

import { useAuth } from "../../hooks/useAuth";
import SikayetlerimPage from "./SikayetlerimPage";
import SikayetYonetimiPage from "./SikayetYonetimiPage";

const SikayetlerPage = () => {
  const { role } = useAuth();
  const isAdmin = role === "Admin" || role === "Personel";

  return isAdmin ? <SikayetYonetimiPage /> : <SikayetlerimPage />;
};

export default SikayetlerPage;
