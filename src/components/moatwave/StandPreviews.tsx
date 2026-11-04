import { BadgeCheck, Boxes, Circle, Fingerprint, RefreshCw, Users } from "lucide-react";
import { PreviewPanel } from "./PreviewPanel";

const Row = ({ icon: Icon, label, value, muted = false }: { icon: typeof Fingerprint; label: string; value: string; muted?: boolean }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${muted ? "text-muted-foreground" : "text-primary"}`} />
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${muted ? "text-muted-foreground" : ""}`}>{value}</p>
    </div>
  </div>
);

/** MID for a dealer or stand: the identity number is issued only by Moatwave, so it shows as not issued. */
export const MidIdentityPreview = ({ businessName, verified }: { businessName: string; verified: boolean }) => (
  <PreviewPanel feature="mid" title="Business identity" subtitle="MID · Powered by Moatwave">
    <div className="divide-y">
      <Row icon={Fingerprint} label="Moatwave ID (MID)" value="Not issued yet: issued when Moatwave is activated" muted />
      <Row icon={BadgeCheck} label="Business" value={businessName} />
      <Row
        icon={BadgeCheck}
        label="Business check"
        value={verified ? "Reviewed by Motorcars (CAC number and owner ID)" : "Waiting for Motorcars review"}
        muted={!verified}
      />
      <Row icon={Users} label="Linked staff" value="Staff accounts link to the stand's MID once it's active" muted />
    </div>
  </PreviewPanel>
);

interface OpenInventoryPreviewProps {
  listed: number;
  /** Counts by seller-confirmed availability, when the lifecycle feature is on. */
  available?: number;
  reserved?: number;
}

/** Open Inventory (OIO) for a stand: counts come from real listings; the sync with Moatwave is shown as not connected. */
export const OpenInventoryPreview = ({ listed, available, reserved }: OpenInventoryPreviewProps) => (
  <PreviewPanel feature="oio" title="Open Inventory" subtitle="OIO · Powered by Moatwave">
    <div className="grid grid-cols-3 gap-3 text-center">
      {[
        ["Listed on Motorcars", listed],
        ["Available", available],
        ["Reserved", reserved],
      ].map(([label, value]) => (
        <div key={label as string} className="rounded-xl bg-muted px-2 py-3">
          <p className="text-2xl font-extrabold">{value ?? "–"}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
    <div className="mt-3 divide-y">
      <Row icon={Boxes} label="Stock source" value="Listed on Motorcars by the stand" />
      <Row icon={RefreshCw} label="Live sync with the stand's inventory" value="Not connected" muted />
      <Row icon={Circle} label="When connected" value="Cars reserved or sold on the stand update here straight away" muted />
    </div>
  </PreviewPanel>
);
