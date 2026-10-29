import { Link } from "react-router-dom";

/** The Motorcars mark for light backgrounds (sign-in pages). The top bar draws its own light-on-dark version. */
export const BrandLogo = () => (
  <Link to="/" className="inline-flex items-center gap-3" aria-label="Motorcars home">
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark text-lg font-black text-gold">M</span>
    <span className="text-left leading-none">
      <span className="block text-xl font-extrabold tracking-tight text-foreground">Motorcars</span>
      <span className="block text-[11px] font-medium text-muted-foreground">Powered by Moatwave</span>
    </span>
  </Link>
);
