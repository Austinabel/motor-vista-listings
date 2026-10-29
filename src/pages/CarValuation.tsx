import { Calculator } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

// The previous page produced a price from a fixed formula, not market data, so it was removed.
const CarValuation = () => (
  <ComingSoon
    icon={Calculator}
    title="Car valuation"
    description="Valuations based on real Motorcars listing prices for the same make, model, year and condition."
    meanwhile="Until then, compare asking prices for similar cars on Motorcars to judge a fair price."
  />
);

export default CarValuation;
