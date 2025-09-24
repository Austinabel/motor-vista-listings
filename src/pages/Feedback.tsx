import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Send, MessageSquare, ThumbsUp, ThumbsDown, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FeedbackItem {
  id: string;
  type: 'received' | 'sent';
  rating: number;
  comment: string;
  fromUser?: string;
  toUser?: string;
  listingTitle?: string;
  date: string;
  status: 'pending' | 'published';
}

const Feedback = () => {
  const { user } = useAuth();
  const [newFeedback, setNewFeedback] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([
    {
      id: '1',
      type: 'received',
      rating: 5,
      comment: 'Excellent seller! The car was exactly as described and the transaction was smooth.',
      fromUser: 'John Doe',
      listingTitle: '2020 Toyota Camry',
      date: '2024-01-15',
      status: 'published'
    },
    {
      id: '2',
      type: 'received',
      rating: 4,
      comment: 'Good communication and fair pricing. Would recommend.',
      fromUser: 'Sarah Johnson',
      listingTitle: '2019 Honda Accord',
      date: '2024-01-10',
      status: 'published'
    },
    {
      id: '3',
      type: 'sent',
      rating: 4,
      comment: 'Great experience buying from this dealer. Quick response time.',
      toUser: 'ABC Motors',
      listingTitle: '2021 Ford Explorer',
      date: '2024-01-05',
      status: 'published'
    }
  ]);

  const receivedFeedback = feedbackList.filter(f => f.type === 'received');
  const sentFeedback = feedbackList.filter(f => f.type === 'sent');

  const handleSubmitFeedback = () => {
    if (!newFeedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    const feedback: FeedbackItem = {
      id: Date.now().toString(),
      type: 'sent',
      rating: newRating,
      comment: newFeedback,
      toUser: 'Platform',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setFeedbackList(prev => [feedback, ...prev]);
    setNewFeedback("");
    setNewRating(5);
    toast.success("Feedback submitted successfully!");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderFeedbackCard = (feedback: FeedbackItem) => (
    <Card key={feedback.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(feedback.rating)}</div>
            <Badge 
              variant={feedback.status === 'published' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {feedback.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {new Date(feedback.date).toLocaleDateString()}
          </div>
        </div>
        
        <p className="text-gray-700 mb-3">{feedback.comment}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            {feedback.type === 'received' ? (
              <span>From: <strong>{feedback.fromUser}</strong></span>
            ) : (
              <span>To: <strong>{feedback.toUser}</strong></span>
            )}
          </div>
          {feedback.listingTitle && (
            <span>Listing: {feedback.listingTitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const averageRating = receivedFeedback.length > 0 
    ? receivedFeedback.reduce((sum, f) => sum + f.rating, 0) / receivedFeedback.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-6 w-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Feedback & Reviews</h1>
          </div>
          <p className="text-gray-600">Manage your feedback and reviews.</p>
        </div>

        {/* Feedback Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <h3 className="text-2xl font-bold">{averageRating.toFixed(1)}</h3>
              <p className="text-gray-600">Average Rating</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <ThumbsUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold">{receivedFeedback.length}</h3>
              <p className="text-gray-600">Reviews Received</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <ThumbsDown className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold">{sentFeedback.length}</h3>
              <p className="text-gray-600">Reviews Given</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="received">Received Reviews</TabsTrigger>
            <TabsTrigger value="sent">Given Reviews</TabsTrigger>
            <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reviews You've Received</CardTitle>
                <CardDescription>
                  Feedback from users who have interacted with your listings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {receivedFeedback.length > 0 ? (
                  receivedFeedback.map(renderFeedbackCard)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews received yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reviews You've Given</CardTitle>
                <CardDescription>
                  Feedback you've provided to other users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sentFeedback.length > 0 ? (
                  sentFeedback.map(renderFeedbackCard)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews given yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Platform Feedback</CardTitle>
                <CardDescription>
                  Help us improve by sharing your experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          i < newRating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                        onClick={() => setNewRating(i + 1)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="feedback" className="text-sm font-medium">
                    Your Feedback
                  </label>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us about your experience with our platform..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitFeedback}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Feedback;