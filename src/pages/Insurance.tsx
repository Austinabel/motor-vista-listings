import { ShieldCheck } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

// The previous page showed quote forms that were never submitted anywhere.
const Insurance = () => (
  <ComingSoon
    icon={ShieldCheck}
    title="Car insurance"
    description="Insurance quotes from licensed partners for the car you are buying."
    meanwhile="Motorcars does not offer insurance yet. Speak to a licensed insurer before you drive your new car."
  />
);

export default Insurance;
