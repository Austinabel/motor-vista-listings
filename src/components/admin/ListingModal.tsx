import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, MapPin, Fuel, Settings, Palette, Eye } from "lucide-react";

interface ListingModalProps {
  listing: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (listingId: string, status: string) => void;
}

export const ListingModal = ({ listing, isOpen, onClose, onUpdateStatus }: ListingModalProps) => {
  if (!listing) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'featured':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>;
      case 'standard':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Standard</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Free</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {listing.year} {listing.make} {listing.model} - Listing Details
          </DialogTitle>
        </DialogHeader>

        {/* Image Gallery Section */}
        {listing.car_listing_images && listing.car_listing_images.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Uploaded Images ({listing.car_listing_images.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {listing.car_listing_images.map((image: any, index: number) => (
                <div key={image.id || index} className="relative group">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                    <img 
                      src={image.image_url} 
                      alt={`Car image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=300&fit=crop&crop=center';
                      }}
                    />
                    {image.is_primary && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                          Primary
                        </Badge>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => window.open(image.image_url, '_blank')}
                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <Eye className="w-6 h-6 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Images</h4>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">
                <Eye className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 font-medium">No images uploaded</p>
              <p className="text-sm text-gray-500 mt-1">This listing doesn't have any images yet.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Basic Information</h4>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-600">Make & Model:</Label>
                <p className="text-sm">{listing.make} {listing.model}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Year:</Label>
                <p className="text-sm">{listing.year}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Price:</Label>
                <p className="text-sm font-semibold">₦{listing.price.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Condition:</Label>
                <p className="text-sm">{listing.condition}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Location:</Label>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <p className="text-sm">{listing.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Technical Details</h4>
            <div className="space-y-2">
              {listing.mileage && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Mileage:</Label>
                  <p className="text-sm">{listing.mileage} km</p>
                </div>
              )}
              {listing.fuel_type && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fuel Type:</Label>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    <p className="text-sm">{listing.fuel_type}</p>
                  </div>
                </div>
              )}
              {listing.transmission && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Transmission:</Label>
                  <div className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    <p className="text-sm">{listing.transmission}</p>
                  </div>
                </div>
              )}
              {listing.color && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Color:</Label>
                  <div className="flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    <p className="text-sm">{listing.color}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Listing Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Listing Information</h4>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-600">Status:</Label>
                <div className="mt-1">{getStatusBadge(listing.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Plan:</Label>
                <div className="mt-1">{getPlanBadge(listing.listing_plan)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Listing Price:</Label>
                <p className="text-sm">₦{listing.listing_price.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Duration:</Label>
                <p className="text-sm">{listing.listing_duration} days</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Created:</Label>
                <p className="text-sm">{new Date(listing.created_at).toLocaleDateString()}</p>
              </div>
              {listing.payment_reference && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Payment Ref:</Label>
                  <p className="text-sm font-mono text-xs bg-gray-100 p-1 rounded">{listing.payment_reference}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Description:</Label>
            <p className="text-sm bg-gray-50 p-3 rounded-md">{listing.description}</p>
          </div>
        )}

        {/* Features */}
        {listing.features && listing.features.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Features:</Label>
            <div className="flex flex-wrap gap-2">
              {listing.features.map((feature: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/cars/${listing.id}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Public
            </Button>
          </div>
          
          {listing.status === 'pending_review' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(listing.id, 'active')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onUpdateStatus(listing.id, 'rejected')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};