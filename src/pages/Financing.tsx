import { Landmark } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

// The previous page showed loan offers and forms with no lender or backend behind them.
const Financing = () => (
  <ComingSoon
    icon={Landmark}
    title="Car financing"
    description="Car loans from licensed lenders, offered only where a real partner provides them."
    meanwhile="Motorcars does not arrange financing yet. Ask the dealer whether they offer payment plans."
  />
);

export default Financing;
