import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Bookmark, 
  TrendingUp, 
  FileText, 
  Video, 
  Users,
  Zap,
  Star,
  Globe
} from "lucide-react";

export function DeFiResources() {
  const resources = [
    {
      id: "1",
      title: "DeFi Pulse",
      description: "Track total value locked across all DeFi protocols",
      type: "Analytics",
      icon: TrendingUp,
      color: "var(--crypto-primary)",
      url: "https://defipulse.com",
      featured: true
    },
    {
      id: "2",
      title: "Bankless Newsletter",
      description: "Weekly insights on DeFi trends and opportunities",
      type: "News",
      icon: FileText,
      color: "var(--crypto-secondary)",
      url: "https://bankless.substack.com",
      featured: false
    },
    {
      id: "3",
      title: "DeFi Dad YouTube",
      description: "Educational videos on DeFi protocols and strategies",
      type: "Education",
      icon: Video,
      color: "var(--crypto-tertiary)",
      url: "https://youtube.com/defidad",
      featured: true
    },
    {
      id: "4",
      title: "The Defiant",
      description: "Latest news and analysis in decentralized finance",
      type: "Media",
      icon: Globe,
      color: "var(--crypto-quaternary)",
      url: "https://thedefiant.io",
      featured: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Analytics': return 'badge-primary';
      case 'News': return 'badge-secondary';
      case 'Education': return 'badge-success';
      case 'Media': return 'badge-warning';
      default: return 'badge-primary';
    }
  };

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-crypto-text flex items-center gap-2">
              <div className="p-2 bg-crypto-quaternary rounded-xl bg-opacity-15">
                <Zap className="w-5 h-5 text-crypto-quaternary" />
              </div>
              DeFi Resources
            </CardTitle>
            <p className="text-crypto-muted mt-1">
              Curated tools and resources for DeFi success
            </p>
          </div>
          <Button className="btn-secondary text-sm">
            <Bookmark className="w-4 h-4 mr-1" />
            Saved
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {resources.map((resource) => {
          const Icon = resource.icon;
          
          return (
            <div
              key={resource.id}
              className="p-4 rounded-xl bg-crypto-surface border border-crypto-border hover:border-crypto-primary transition-all duration-300 hover:bg-crypto-card group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: resource.color + '20' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: resource.color }} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-crypto-text group-hover:text-crypto-primary transition-colors">
                        {resource.title}
                      </h3>
                      {resource.featured && (
                        <Star className="w-4 h-4 text-crypto-quaternary" />
                      )}
                    </div>
                    
                    <p className="text-crypto-muted text-sm mb-2">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                      <div className="flex items-center text-crypto-muted text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        <span>Trusted</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <ExternalLink className="w-4 h-4 text-crypto-muted opacity-0 group-hover:opacity-100 group-hover:text-crypto-primary transition-all" />
              </div>
            </div>
          );
        })}
        
        {/* Quick Links */}
        <div className="pt-4 border-t border-crypto-border">
          <div className="grid grid-cols-2 gap-3">
            <Button size="sm" className="btn-secondary">
              <TrendingUp className="w-4 h-4 mr-2" />
              Market Data
            </Button>
            <Button size="sm" className="btn-secondary">
              <FileText className="w-4 h-4 mr-2" />
              Research
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}