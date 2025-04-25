import { DarkModeInfo } from "@/components/dark-mode-info";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-8">
        <DarkModeInfo />
      </div>
    </div>
  );
} 