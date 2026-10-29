import {
  BatteryCharging, Car, ClipboardCheck, Cog, Package, Paintbrush, PanelTop, ScanSearch, Snowflake, Truck, Wrench,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { platformCapabilities } from "@/services/platform";

const SERVICE_TYPES: { label: string; hint: string; icon: LucideIcon }[] = [
  { label: "Mechanics", hint: "Servicing and repairs", icon: Wrench },
  { label: "Auto electricians", hint: "Wiring, batteries, starters", icon: BatteryCharging },
  { label: "Panel beaters", hint: "Body and dent repair", icon: Car },
  { label: "Painters", hint: "Spraying and finishing", icon: Paintbrush },
  { label: "Diagnostics", hint: "Computer fault checks", icon: ScanSearch },
  { label: "Tyres and wheels", hint: "Fitting, alignment, balancing", icon: Cog },
  { label: "AC technicians", hint: "Air-conditioning repair", icon: Snowflake },
  { label: "Vehicle inspection", hint: "Pre-purchase checks", icon: ClipboardCheck },
  { label: "Spare parts", hint: "Genuine and used parts", icon: Package },
  { label: "Auto glass", hint: "Windscreens and windows", icon: PanelTop },
  { label: "Vehicle transport", hint: "Towing and delivery", icon: Truck },
];

export const ServicesSection = () => {
  // No provider directory exists yet, so the tiles describe what is coming and link nowhere
  const available = platformCapabilities.serviceDirectory.provider !== "unavailable";

  return (
    <section id="services" className="scroll-mt-24 border-y bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeading
            title="Auto services near you"
            subtitle="Mechanics, electricians, panel beaters and inspectors, in the same place you find your car."
            icon={Wrench}
          />
          {!available && (
            <span className="self-start rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-gold-foreground">Coming soon</span>
          )}
        </div>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SERVICE_TYPES.map(({ label, hint, icon: Icon }) => (
            <li key={label} className="flex items-center gap-4 rounded-2xl border bg-card p-4 md:p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-gold">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="font-bold">{label}</p>
                <p className="text-sm text-muted-foreground">{hint}</p>
              </div>
            </li>
          ))}
        </ul>

        {!available && (
          <p className="mt-6 text-sm text-muted-foreground">
            We are onboarding service providers now; none can be booked through Motorcars yet. Until then, ask the seller
            about an inspection before you visit.
          </p>
        )}
      </div>
    </section>
  );
};
