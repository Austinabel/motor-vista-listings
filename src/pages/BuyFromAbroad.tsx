import { Plane } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

// The previous page's request form was never submitted anywhere.
const BuyFromAbroad = () => (
  <ComingSoon
    icon={Plane}
    title="Buy from abroad"
    description="Sourcing, shipping and clearing a car from abroad through vetted import partners."
    meanwhile="Imported cars are already for sale on Motorcars: look for foreign used (Tokunbo) listings."
  />
);

export default BuyFromAbroad;
