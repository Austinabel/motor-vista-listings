import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, UserCheck, Car, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationForm {
  title: string;
  message: string;
  type: string;
  targetType: string;
  targetUsers: string[];
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  user_type: string;
}

interface Dealer {
  id: string;
  user_id: string;
  business_name: string;
  status: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const NotificationManager = () => {
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'info',
    targetType: 'all',
    targetUsers: []
  });
  const [users, setUsers] = useState<User[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDealers();
    fetchRecentNotifications();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_type')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchDealers = async () => {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('id, user_id, business_name, status')
        .eq('status', 'verified')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDealers(data || []);
    } catch (error) {
      console.error('Error fetching dealers:', error);
      toast.error('Failed to fetch dealers');
    }
  };

  const fetchRecentNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          user_id,
          title,
          message,
          type,
          is_read,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(n => n.user_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        if (!profilesError && profiles) {
          const profileMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, any>);

          const notificationsWithProfiles = data.map(notification => ({
            ...notification,
            profiles: profileMap[notification.user_id] || null
          }));

          setNotifications(notificationsWithProfiles);
        } else {
          setNotifications(data.map(n => ({ ...n, profiles: null })));
        }
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const getTargetUserIds = () => {
    switch (form.targetType) {
      case 'all':
        return users.map(user => user.id);
      case 'buyers':
        return users.filter(user => user.user_type === 'buyer').map(user => user.id);
      case 'dealers':
        return dealers.map(dealer => dealer.user_id);
      case 'specific':
        return form.targetUsers;
      default:
        return [];
    }
  };

  const sendNotifications = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    setSending(true);
    try {
      const targetUserIds = getTargetUserIds();
      
      if (targetUserIds.length === 0) {
        toast.error('No target users selected');
        return;
      }

      // Create notifications for each user
      const notifications = targetUserIds.map(userId => ({
        user_id: userId,
        title: form.title,
        message: form.message,
        type: form.type,
        metadata: { sent_by_admin: true }
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast.success(`Notifications sent to ${targetUserIds.length} users`);
      
      // Reset form
      setForm({
        title: '',
        message: '',
        type: 'info',
        targetType: 'all',
        targetUsers: []
      });

      // Refresh notifications list
      fetchRecentNotifications();
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  const sendQuickMessage = async (type: 'welcome' | 'promo' | 'maintenance') => {
    const messages = {
      welcome: {
        title: 'Welcome to Motorcars.ng!',
        message: 'Thank you for joining Motorcars. Browse cars from dealers, car stands and private sellers, and contact sellers directly from any listing.',
        type: 'success'
      },
      promo: {
        title: 'Special Promotion - Limited Time!',
        message: 'Enjoy 50% off on premium listings this month. Boost your car visibility and sell faster with our featured listing packages.',
        type: 'info'
      },
      maintenance: {
        title: 'Scheduled Maintenance Notice',
        message: 'Our platform will undergo scheduled maintenance tonight from 2:00 AM to 4:00 AM. Some features may be temporarily unavailable.',
        type: 'warning'
      }
    };

    const message = messages[type];
    setForm(prev => ({
      ...prev,
      title: message.title,
      message: message.message,
      type: message.type
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-primary';
      case 'warning': return 'bg-gold';
      case 'error': return 'bg-destructive';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="send">Send Notifications</TabsTrigger>
              <TabsTrigger value="history">Notification History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="space-y-6">
              {/* Quick Message Templates */}
              <div className="space-y-3">
                <Label>Quick Message Templates</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendQuickMessage('welcome')}
                  >
                    Welcome Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendQuickMessage('promo')}
                  >
                    Promotion Alert
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendQuickMessage('maintenance')}
                  >
                    Maintenance Notice
                  </Button>
                </div>
              </div>

              {/* Notification Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Notification title"
                      value={form.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Notification message"
                      rows={4}
                      value={form.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={form.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="targetType">Target Audience</Label>
                    <Select value={form.targetType} onValueChange={(value) => handleInputChange('targetType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="buyers">Buyers Only</SelectItem>
                        <SelectItem value="dealers">Dealers Only</SelectItem>
                        <SelectItem value="specific">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {users.length} Total Users
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-4 w-4" />
                        {dealers.length} Verified Dealers
                      </span>
                    </div>
                    
                    {form.targetType !== 'specific' && (
                      <div className="text-sm text-muted-foreground">
                        Will send to: {getTargetUserIds().length} users
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={sendNotifications}
                    disabled={sending || !form.title.trim() || !form.message.trim()}
                    className="w-full"
                  >
                    {sending ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Notifications
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              Loading notifications...
                            </TableCell>
                          </TableRow>
                        ) : notifications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No notifications found
                            </TableCell>
                          </TableRow>
                        ) : (
                          notifications.map((notification) => (
                            <TableRow key={notification.id}>
                              <TableCell>
                                <div className={`w-3 h-3 rounded-full ${getTypeColor(notification.type)}`} />
                              </TableCell>
                              <TableCell className="font-medium">{notification.title}</TableCell>
                              <TableCell>
                                {notification.profiles?.first_name && notification.profiles?.last_name
                                  ? `${notification.profiles.first_name} ${notification.profiles.last_name}`
                                  : 'Unknown User'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={notification.is_read ? "secondary" : "default"}>
                                  {notification.is_read ? 'Read' : 'Unread'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(notification.created_at)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};