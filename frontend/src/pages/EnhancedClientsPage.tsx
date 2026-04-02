import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ErrorFallback from "@/components/shared/ErrorFallback";
import { crmService } from "@/services/crm";
import type { Company, ClientRecord } from "@/types/crm";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const EnhancedClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"companies" | "contacts">("companies");

  const { data: companies = [], isLoading: companiesLoading, error: companiesError, refetch: refetchCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: crmService.getCompanies,
  });

  const { data: clients = [], isLoading: clientsLoading, error: clientsError, refetch: refetchClients } = useQuery({
    queryKey: ["clients"],
    queryFn: crmService.getClients,
  });

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const pageError = companiesError || clientsError;

  if (pageError) {
    return (
      <ErrorFallback
        title="Client data failed to load"
        error={pageError}
        description="The client portfolio could not be loaded. Retry to refresh companies and contacts."
        onRetry={() => Promise.all([refetchCompanies(), refetchClients()])}
        retryLabel="Retry clients"
      />
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "active": "bg-green-100 text-green-700",
      "inactive": "bg-gray-100 text-gray-700",
      "prospect": "bg-blue-100 text-blue-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.section variants={item} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 font-medium text-muted-foreground text-xs uppercase tracking-[0.16em]">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Client Portfolio
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-foreground">Clients</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Manage companies, contacts, and client relationships in one unified view.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-2xl border-blue-200 text-blue-700 hover:bg-blue-50">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
            <Button className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.25rem] border border-border/70 bg-secondary/22 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Total Companies</p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">{companies.length}</p>
          </div>
          <div className="rounded-[1.25rem] border border-border/70 bg-secondary/22 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Total Contacts</p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">{clients.length}</p>
          </div>
          <div className="rounded-[1.25rem] border border-border/70 bg-secondary/22 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Total Value</p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">
              {formatCurrency(companies.reduce((sum, company) => sum + company.value, 0))}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-border/70 bg-secondary/22 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Active Accounts</p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">
              {companies.filter(c => c.status === 'active').length}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.section variants={item} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-card">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "companies" | "contacts")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={activeTab === "companies" ? "Search companies..." : "Search contacts..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          <TabsContent value="companies" className="space-y-4">
            {companiesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <Card key={company.id} className="rounded-xl border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground text-lg">{company.name}</h3>
                          <Badge className={getStatusColor(company.status)}>
                            {company.status}
                          </Badge>
                          {company.size && (
                            <Badge variant="outline" className="text-xs">
                              {company.size}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Industry:</span> {company.industry || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Value:</span> {formatCurrency(company.value)}
                          </div>
                          <div>
                            <span className="font-medium">Contacts:</span> {company.contacts.length}
                          </div>
                          <div>
                            <span className="font-medium">Deals:</span> {company.deals.length}
                          </div>
                        </div>
                        {company.website && (
                          <div className="mt-2 text-sm">
                            <a href={company.website} target="_blank" rel="noopener noreferrer" 
                               className="text-primary hover:underline">
                              {company.website}
                            </a>
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Company
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            {clientsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              filteredClients.map((client) => (
                <Card key={client.id} className="rounded-xl border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-foreground">{client.name}</h3>
                            <Badge className={getStatusColor(client.status)}>
                              {client.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{client.jobTitle}</span>
                            <span>{client.company}</span>
                            <span>{client.email}</span>
                            <span>{client.phone}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Contact
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.section>
    </motion.div>
  );
};

export default EnhancedClientsPage;
