import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Car, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { loginPathFor } from "@/lib/redirect";
import { FUEL_TYPES, TRANSMISSIONS } from "@/lib/vehicleSearch";
import { fetchMyListing, updateMyListing, type MyListing } from "@/services/myListings";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

interface FormState {
  price: string;
  mileage: string;
  location: string;
  transmission: string;
  fuelType: string;
  color: string;
  description: string;
}

const toForm = (listing: MyListing): FormState => ({
  price: String(listing.price),
  mileage: listing.mileage != null ? String(listing.mileage) : "",
  location: listing.location ?? "",
  transmission: listing.transmission?.toLowerCase() ?? "",
  fuelType: listing.fuelType?.toLowerCase() ?? "",
  color: listing.color ?? "",
  description: listing.description ?? "",
});

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<FormState | null>(null);

  const listingQuery = useQuery({
    queryKey: ["my-listing", id, user?.id],
    queryFn: () => fetchMyListing(id!, user!.id),
    enabled: Boolean(id && user),
    retry: 1,
  });

  useEffect(() => {
    if (listingQuery.data && !form) setForm(toForm(listingQuery.data));
  }, [listingQuery.data, form]);

  const save = useMutation({
    mutationFn: (values: FormState) =>
      updateMyListing(id!, user!.id, {
        price: Number(values.price),
        mileage: values.mileage ? Number(values.mileage) : null,
        location: values.location.trim(),
        transmission: values.transmission || null,
        fuelType: values.fuelType || null,
        color: values.color.trim() || null,
        description: values.description.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
      toast.success("Listing updated");
      navigate("/my-listings");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't save your changes. Try again."),
  });

  if (authLoading || (user && listingQuery.isLoading)) {
    return <div className="mx-auto max-w-3xl px-4 py-10"><div className="h-96 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Sign in to edit your listing</h1>
        <Button asChild><Link to={loginPathFor(`/sell/edit/${id}`)}><LogIn className="mr-2 h-4 w-4" />Sign in</Link></Button>
      </div>
    );
  }

  const listing = listingQuery.data;
  if (listingQuery.isError || !listing || !form) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <Car className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">{listingQuery.isError ? "We couldn't load this listing" : "Listing not found"}</h1>
        <p className="text-muted-foreground">You can only edit your own listings.</p>
        <Button asChild><Link to="/my-listings">My listings</Link></Button>
      </div>
    );
  }

  const set = (key: keyof FormState) => (event: { target: { value: string } }) =>
    setForm((current) => (current ? { ...current, [key]: event.target.value } : current));

  const priceValid = Number(form.price) > 0;
  const mileageValid = !form.mileage || Number(form.mileage) >= 0;
  const canSave = priceValid && mileageValid && form.location.trim().length > 1 && !save.isPending;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSave) save.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link to="/my-listings" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          My listings
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold">Edit listing</h1>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border bg-card p-5">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-lg font-bold">{listing.title}</p>
            <p className="text-sm text-muted-foreground">
              Make, model and year identify the car that was approved and can't be changed. To sell a different car,
              create a new listing.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Asking price (₦)</Label>
              <Input id="price" inputMode="numeric" value={form.price} onChange={set("price")} aria-invalid={!priceValid} />
              {!priceValid && <p className="text-sm text-destructive">Enter a price above zero.</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input id="mileage" inputMode="numeric" value={form.mileage} onChange={set("mileage")} aria-invalid={!mileageValid} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={set("location")} placeholder="e.g. Ikeja, Lagos" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transmission">Gearbox</Label>
              <select id="transmission" className={selectClass} value={form.transmission} onChange={set("transmission")}>
                <option value="">Not specified</option>
                {TRANSMISSIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fuel">Fuel</Label>
              <select id="fuel" className={selectClass} value={form.fuelType} onChange={set("fuelType")}>
                <option value="">Not specified</option>
                {FUEL_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="color">Colour</Label>
              <Input id="color" value={form.color} onChange={set("color")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={6} value={form.description} onChange={set("description")} />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild variant="outline"><Link to="/my-listings">Cancel</Link></Button>
            <Button type="submit" disabled={!canSave}>{save.isPending ? "Saving…" : "Save changes"}</Button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditListing;
