import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Shield, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryPrivacySettings } from "@/components/inventory/InventoryPrivacySettings";

const AccountSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showPhoneNumber: false,
    allowMessages: true
  });
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("NGN");

  // Fetch user profile with privacy settings
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (profile) {
      setPrivacy({
        showProfile: profile.show_profile ?? true,
        showPhoneNumber: profile.show_phone_number ?? false,
        allowMessages: profile.allow_messages ?? true
      });
    }
  }, [profile]);

  // Update privacy settings mutation
  const updatePrivacyMutation = useMutation({
    mutationFn: async (privacyData: typeof privacy) => {
      if (!user?.id) throw new Error("No user found");
      
      const { error } = await supabase
        .from('profiles')
        .update({
          show_profile: privacyData.showProfile,
          show_phone_number: privacyData.showPhoneNumber,
          allow_messages: privacyData.allowMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success("Privacy settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update privacy settings: ${error.message}`);
    }
  });

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [type]: value }));
    toast.success("Notification settings updated");
  };

  const handlePrivacyChange = (type: string, value: boolean) => {
    const newPrivacy = { ...privacy, [type]: value };
    setPrivacy(newPrivacy);
    updatePrivacyMutation.mutate(newPrivacy);
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion is not implemented yet. Please contact support.");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your account preferences and settings.</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates and activities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications" className="text-base font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={notifications.sms}
                    onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="text-base font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-notifications" className="text-base font-medium">
                      Marketing Communications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
                  </div>
                  <Switch
                    id="marketing-notifications"
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control who can see your information and contact you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-profile" className="text-base font-medium">
                      Show Profile to Other Users
                    </Label>
                    <p className="text-sm text-muted-foreground">Allow other users to view your profile information</p>
                  </div>
                  <Switch
                    id="show-profile"
                    checked={privacy.showProfile}
                    onCheckedChange={(checked) => handlePrivacyChange('showProfile', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-phone" className="text-base font-medium">
                      Show Phone Number
                    </Label>
                    <p className="text-sm text-muted-foreground">Display your phone number on listings</p>
                  </div>
                  <Switch
                    id="show-phone"
                    checked={privacy.showPhoneNumber}
                    onCheckedChange={(checked) => handlePrivacyChange('showPhoneNumber', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-messages" className="text-base font-medium">
                      Allow Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">Let other users send you messages about listings</p>
                  </div>
                  <Switch
                    id="allow-messages"
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
                  />
                </div>

                {user && <InventoryPrivacySettings userId={user.id} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>
                  Customize your app experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ha">Hausa</SelectItem>
                        <SelectItem value="ig">Igbo</SelectItem>
                        <SelectItem value="yo">Yoruba</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Account Status</h4>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      Active
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Email Verification</h4>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      Verified
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Last Sign In</h4>
                    <p className="text-sm text-muted-foreground">Today at 2:30 PM</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-primary/20">
                  <h4 className="font-medium text-primary mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountSettings;