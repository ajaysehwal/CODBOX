import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "../ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Sun, Moon, Globe, Code, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "../ui/slider";

export const SettingsDialog = () => {
  const [theme, setTheme] = useState("system");
  const [fontSize, setFontSize] = useState(14);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">
          Settings
        </DialogTitle>
      </DialogHeader>
      <Tabs defaultValue="general" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Theme
            </label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <Sun className="inline-block mr-2" size={16} /> Light
                </SelectItem>
                <SelectItem value="dark">
                  <Moon className="inline-block mr-2" size={16} /> Dark
                </SelectItem>
                <SelectItem value="system">
                  <Globe className="inline-block mr-2" size={16} /> System
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Notifications
            </label>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Auto-save
            </label>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
        </TabsContent>
        <TabsContent value="editor" className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Font Size
            </label>
            <Slider
              min={10}
              max={24}
              step={1}
              value={[fontSize]}
              onValueChange={([value]: any) => setFontSize(value)}
              className="w-full"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {fontSize}px
            </p>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Code Snippets
            </label>
            <Button variant="outline" size="sm">
              <Code className="mr-2" size={16} /> Manage Snippets
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="collaboration" className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Real-time Collaboration
            </label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Share Settings
            </label>
            <Button variant="outline" size="sm">
              <Users className="mr-2" size={16} /> Manage Sharing
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="advanced" className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Clear Cache
            </label>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2" size={16} /> Clear Now
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Delete All Data
            </label>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2" size={16} /> Delete All
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Export Data
            </label>
            <Button variant="outline" size="sm">
              <Globe className="mr-2" size={16} /> Export
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Save Changes
        </Button>
      </div>
    </DialogContent>
  );
};
