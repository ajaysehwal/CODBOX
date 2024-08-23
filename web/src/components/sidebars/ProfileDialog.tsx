import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Camera, Link, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context";
import { Github, LinkedIn } from "../ui/icons";
 const ProfileDialog = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { user } = useAuth();
  return (
    <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-800">
          Your Profile
        </DialogTitle>
      </DialogHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="social">Social & Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={user?.photoURL as string}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
              <Button
                size="icon"
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg"
              >
                <Camera size={16} />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                value={user?.displayName?.split(" ")[0] as string}
                className="mt-1"
                placeholder="Your first name"
              />
            </div>
            <div>
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700"
              >
                Last Name
              </Label>
              <Input
                value={user?.displayName?.split(" ")[1] as string}
                id="lastName"
                className="mt-1"
                placeholder="Your last name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
              Bio
            </Label>
            <Textarea
              id="bio"
              className="mt-0"
              placeholder="Tell us about yourself"
            />
          </div>
        </TabsContent>
        <TabsContent value="social" className="space-y-6">
          <div>
            <Label
              htmlFor="website"
              className="text-sm font-medium text-gray-700"
            >
              Website
            </Label>
            <div className="flex items-center mt-1 space-x-2">
              <Link size={20} className="text-gray-500" />
              <Input
                id="website"
                placeholder="Your website URL"
                className="flex-grow"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Twitter size={20} className="text-blue-400" />
              <Input placeholder="Twitter username" className="flex-grow" />
            </div>
            <div className="flex items-center space-x-2">
  
               <Github className="text-gray-800" /> 
              <Input placeholder="GitHub username" className="flex-grow" />
            </div>
            <div className="flex items-center space-x-2">
              <LinkedIn className="text-blue-700" />
              <Input placeholder="LinkedIn profile URL" className="flex-grow" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="notifications"
                className="text-sm font-medium text-gray-700"
              >
                Email Notifications
              </Label>
              <Switch id="notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="privacy"
                className="text-sm font-medium text-gray-700"
              >
                Private Profile
              </Label>
              <Switch id="privacy" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Save Changes
        </Button>
      </div>
    </DialogContent>
  );
};

export default ProfileDialog;