
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ManualPaymentDetailsProps {
  listingId: string;
  planName: string;
  price: number;
  onPaymentSubmitted: () => void;
}

export const ManualPaymentDetails = ({ listingId, planName, price, onPaymentSubmitted }: ManualPaymentDetailsProps) => {
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentReference) {
      toast.error('Please enter a payment reference.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('car_listings')
        .update({
          payment_reference: paymentReference,
          status: 'pending_review'
        })
        .eq('id', listingId);

      if (error) {
        throw error;
      }

      toast.success('Payment details submitted! Your listing is now under review.');
      onPaymentSubmitted();

    } catch (error) {
      console.error('Error submitting payment details:', error);
      toast.error('Failed to submit payment details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle>Complete Your Listing Payment</CardTitle>
        <CardDescription>
          Your {planName} listing for ₦{price.toLocaleString()} has been created. Please make a payment to the account below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Bank Details</h3>
          <p><span className="font-medium">Bank Name:</span> Zenith Bank</p>
          <p><span className="font-medium">Account Name:</span> AutoConnect Africa</p>
          <p><span className="font-medium">Account Number:</span> 1234567890</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-4">
            After making the payment, please enter the transaction reference or your name below and submit. Your listing will be reviewed and activated upon payment confirmation.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="paymentReference">Payment Reference *</Label>
              <Input
                id="paymentReference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g., Transaction ID, your name"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Payment Proof'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
