
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Dealer = Database['public']['Tables']['dealers']['Row'];

interface DealerDetailsProps {
  dealer: Dealer | null;
  onUpdateStatus?: (dealerId: string, status: string) => void;
}

const DetailItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div>
    <Label className="text-sm font-medium text-gray-500">{label}</Label>
    <p className="text-sm text-gray-900 break-words">{value || 'N/A'}</p>
  </div>
);

export const DealerDetails = ({ dealer, onUpdateStatus }: DealerDetailsProps) => {
  const [idCardUrl, setIdCardUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    if (dealer?.id_card_path) {
      setLoadingUrl(true);
      const getSignedUrl = async () => {
        const { data, error } = await supabase.storage
          .from('dealer_documents')
          .createSignedUrl(dealer.id_card_path!, 60 * 60); // 1 hour validity

        if (error) {
          console.error("Error creating signed URL:", error);
          toast.error("Could not generate link for ID card image.");
        } else {
          setIdCardUrl(data.signedUrl);
        }
        setLoadingUrl(false);
      };
      getSignedUrl();
    } else {
        setIdCardUrl(null);
    }
  }, [dealer]);

  if (!dealer) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <div className="text-center">
            <CardHeader>
                <CardTitle>No Dealer Selected</CardTitle>
                <CardDescription>Please select a dealer from the list to see their details.</CardDescription>
            </CardHeader>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{dealer.business_name}</CardTitle>
        <CardDescription>Application for verification submitted on {new Date(dealer.created_at).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-semibold text-lg">Business Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem label="Contact Person" value={dealer.contact_name} />
            <DetailItem label="Email" value={dealer.email} />
            <DetailItem label="Phone" value={dealer.phone} />
            <DetailItem label="Address" value={dealer.address} />
            <DetailItem label="State" value={dealer.state} />
            <DetailItem label="Year Established" value={dealer.year_established} />
            <DetailItem label="CAC Number" value={dealer.cac_number} />
            <DetailItem label="Tax ID (TIN)" value={dealer.tax_id} />
            <DetailItem label="Website" value={dealer.website} />
            <DetailItem label="Avg. Monthly Inventory" value={dealer.monthly_inventory} />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Business Description</Label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap mt-1">{dealer.description || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-semibold text-lg">Verification Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem label="ID Card Type" value={dealer.id_card_type} />
            <DetailItem label="ID Card Number" value={dealer.id_card_number} />
          </div>
          <div className="mt-2">
            <Label className="text-sm font-medium text-gray-500">ID Card Document</Label>
            {loadingUrl && <Skeleton className="h-10 w-48 rounded-md mt-1" />}
            {!loadingUrl && idCardUrl && (
              <Button asChild variant="outline" className="mt-1">
                <a href={idCardUrl} target="_blank" rel="noopener noreferrer">
                  View ID Card <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
            {!loadingUrl && !idCardUrl && dealer.id_card_path && (
              <p className="text-sm text-red-600 mt-1">Could not load ID card.</p>
            )}
            {!dealer.id_card_path && <p className="text-sm text-gray-500 mt-1">No ID card was uploaded.</p>}
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-semibold text-lg">Payment Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem label="Payment Reference" value={dealer.payment_reference} />
            <DetailItem label="Payment Status" value={dealer.payment_status} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          {dealer.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                onClick={() => onUpdateStatus?.(dealer.id, 'verified')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => onUpdateStatus?.(dealer.id, 'rejected')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
          {dealer.status === 'verified' && (
            <Button
              variant="destructive"
              onClick={() => onUpdateStatus?.(dealer.id, 'rejected')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Revoke Verification
            </Button>
          )}
          {dealer.status === 'rejected' && (
            <Button
              onClick={() => onUpdateStatus?.(dealer.id, 'verified')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default DealerDetails;
