import { TabType } from "@/lib/types";
import { 
  Grid2X2, 
  Tags, 
  FileText, 
  Link, 
  Gauge, 
  Eye 
} from "lucide-react";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Grid2X2 className="h-4 w-4" /> },
    { id: "meta-tags", label: "Meta Tags", icon: <Tags className="h-4 w-4" /> },
    { id: "content", label: "Content", icon: <FileText className="h-4 w-4" /> },
    { id: "links", label: "Links", icon: <Link className="h-4 w-4" /> },
    { id: "speed", label: "Performance", icon: <Gauge className="h-4 w-4" /> },
    { id: "previews", label: "Previews", icon: <Eye className="h-4 w-4" /> },
  ];

  return (
    <div className="mb-6 border-b border-neutral-200 overflow-x-auto">
      <nav className="flex -mb-px min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`mr-2 inline-block p-3 sm:p-4 border-b-2 font-medium flex items-center ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent hover:border-neutral-300 text-neutral-600 hover:text-neutral-800"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="sm:hidden">{tab.icon}</span>
            <span className="hidden sm:block sm:ml-1">{tab.icon}<span className="ml-1">{tab.label}</span></span>
          </button>
        ))}
      </nav>
    </div>
  );
}
