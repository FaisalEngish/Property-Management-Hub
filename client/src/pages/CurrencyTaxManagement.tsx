import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Calculator,
  Edit,
  Plus,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const currencyRateSchema = z.object({
  baseCurrency: z.string().length(3, "Currency code must be 3 characters"),
  targetCurrency: z.string().length(3, "Currency code must be 3 characters"),
  rate: z.number().positive("Rate must be positive"),
});

const taxRuleSchema = z.object({
  region: z.string().min(1, "Region is required"),
  vatRate: z.number().min(0).max(100).optional(),
  gstRate: z.number().min(0).max(100).optional(),
  whtRate: z.number().min(0).max(100).optional(),
});

const currencyConvertSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  from: z.string().length(3, "Currency code must be 3 characters"),
  to: z.string().length(3, "Currency code must be 3 characters"),
});

const taxCalcSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  region: z.string().min(1, "Region is required"),
  taxType: z.enum(["vat", "gst", "wht"]),
});

export default function CurrencyTaxManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("rates");
  const [isLoading, setIsLoading] = useState(false);
  const [currencyRates, setCurrencyRates] = useState<any[]>([]);
  const [taxRules, setTaxRules] = useState<any[]>([]);
  const [conversionResult, setConversionResult] = useState<any>(null);
  const [taxCalculationResult, setTaxCalculationResult] = useState<any>(null);

  const rateForm = useForm({
    resolver: zodResolver(currencyRateSchema),
    defaultValues: {
      baseCurrency: "",
      targetCurrency: "",
      rate: 0,
    },
  });

  const taxForm = useForm({
    resolver: zodResolver(taxRuleSchema),
    defaultValues: {
      region: "",
      vatRate: undefined,
      gstRate: undefined,
      whtRate: undefined,
    },
  });

  const convertForm = useForm({
    resolver: zodResolver(currencyConvertSchema),
    defaultValues: {
      amount: 0,
      from: "",
      to: "",
    },
  });

  const taxCalcForm = useForm({
    resolver: zodResolver(taxCalcSchema),
    defaultValues: {
      amount: 0,
      region: "",
      taxType: "vat" as const,
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ratesResponse, taxResponse] = await Promise.all([
        apiRequest("GET", "/api/currency/rates"),
        apiRequest("GET", "/api/tax/rules"),
      ]);
      
      setCurrencyRates(ratesResponse.data || []);
      setTaxRules(taxResponse.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmitRate = async (data: z.infer<typeof currencyRateSchema>) => {
    try {
      await apiRequest("PUT", `/api/currency/rates/${data.baseCurrency}/${data.targetCurrency}`, {
        rate: data.rate,
      });
      
      toast({
        title: "Success",
        description: "Currency rate updated successfully",
      });
      
      rateForm.reset();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update currency rate",
        variant: "destructive",
      });
    }
  };

  const onSubmitTax = async (data: z.infer<typeof taxRuleSchema>) => {
    try {
      await apiRequest("PUT", `/api/tax/rules/${data.region}`, data);
      
      toast({
        title: "Success",
        description: "Tax rule updated successfully",
      });
      
      taxForm.reset();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tax rule",
        variant: "destructive",
      });
    }
  };

  const onConvertCurrency = async (data: z.infer<typeof currencyConvertSchema>) => {
    try {
      const response = await apiRequest("POST", "/api/currency/convert", data);
      setConversionResult(response.data);
      
      toast({
        title: "Conversion Complete",
        description: `${data.amount} ${data.from} = ${response.data.convertedAmount.toFixed(2)} ${data.to}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert currency",
        variant: "destructive",
      });
    }
  };

  const onCalculateTax = async (data: z.infer<typeof taxCalcSchema>) => {
    try {
      const response = await apiRequest("POST", "/api/tax/calculate", data);
      setTaxCalculationResult(response.data);
      
      toast({
        title: "Tax Calculated",
        description: `Tax: ${response.data.taxAmount.toFixed(2)} (${response.data.rate}%)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate tax",
        variant: "destructive",
      });
    }
  };

  const supportedCurrencies = ["THB", "USD", "EUR", "GBP"];
  const supportedRegions = ["thailand", "singapore", "usa", "uk", "australia", "default"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            Currency & Tax Management
          </h1>
          <p className="text-gray-600 mt-2">Multi-currency support and international tax compliance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Currency Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{currencyRates.length}</div>
              <p className="text-xs text-gray-500">Exchange rate pairs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tax Regions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{taxRules.length}</div>
              <p className="text-xs text-gray-500">Configured regions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Base Currency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">THB</div>
              <p className="text-xs text-gray-500">Thai Baht</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Multi-Currency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">Active</div>
              <p className="text-xs text-gray-500">System enabled</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
            <TabsTrigger value="taxes">Tax Rules</TabsTrigger>
            <TabsTrigger value="convert">Currency Converter</TabsTrigger>
            <TabsTrigger value="calculate">Tax Calculator</TabsTrigger>
          </TabsList>

          {/* Exchange Rates Tab */}
          <TabsContent value="rates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Currency Exchange Rates</h2>
              <div className="flex gap-2">
                <Button onClick={fetchData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add/Update Currency Rate</DialogTitle>
                    </DialogHeader>
                    <Form {...rateForm}>
                      <form onSubmit={rateForm.handleSubmit(onSubmitRate)} className="space-y-4">
                        <FormField
                          control={rateForm.control}
                          name="baseCurrency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select base currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {supportedCurrencies.map((currency) => (
                                    <SelectItem key={currency} value={currency}>
                                      {currency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={rateForm.control}
                          name="targetCurrency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select target currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {supportedCurrencies.map((currency) => (
                                    <SelectItem key={currency} value={currency}>
                                      {currency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={rateForm.control}
                          name="rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exchange Rate</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.000001"
                                  placeholder="1.234567"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full">Update Rate</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencyRates.map((rate) => (
                      <TableRow key={`${rate.baseCurrency}-${rate.targetCurrency}`}>
                        <TableCell>
                          <Badge variant="outline">{rate.baseCurrency}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rate.targetCurrency}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {parseFloat(rate.rate).toFixed(6)}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(rate.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Rules Tab */}
          <TabsContent value="taxes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tax Rules by Region</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tax Rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add/Update Tax Rule</DialogTitle>
                  </DialogHeader>
                  <Form {...taxForm}>
                    <form onSubmit={taxForm.handleSubmit(onSubmitTax)} className="space-y-4">
                      <FormField
                        control={taxForm.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {supportedRegions.map((region) => (
                                  <SelectItem key={region} value={region}>
                                    {region.charAt(0).toUpperCase() + region.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={taxForm.control}
                        name="vatRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="7.00"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={taxForm.control}
                        name="gstRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="8.00"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={taxForm.control}
                        name="whtRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WHT Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="3.00"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">Update Tax Rule</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>VAT Rate</TableHead>
                      <TableHead>GST Rate</TableHead>
                      <TableHead>WHT Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxRules.map((rule) => (
                      <TableRow key={rule.region}>
                        <TableCell>
                          <Badge variant="secondary">
                            {rule.region.charAt(0).toUpperCase() + rule.region.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {rule.vatRate ? `${rule.vatRate}%` : "—"}
                        </TableCell>
                        <TableCell>
                          {rule.gstRate ? `${rule.gstRate}%` : "—"}
                        </TableCell>
                        <TableCell>
                          {rule.whtRate ? `${rule.whtRate}%` : "—"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Currency Converter Tab */}
          <TabsContent value="convert" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Currency Converter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Form {...convertForm}>
                    <form onSubmit={convertForm.handleSubmit(onConvertCurrency)} className="space-y-4">
                      <FormField
                        control={convertForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="1000"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={convertForm.control}
                        name="from"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {supportedCurrencies.map((currency) => (
                                  <SelectItem key={currency} value={currency}>
                                    {currency}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={convertForm.control}
                        name="to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>To Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {supportedCurrencies.map((currency) => (
                                  <SelectItem key={currency} value={currency}>
                                    {currency}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        <Calculator className="h-4 w-4 mr-2" />
                        Convert
                      </Button>
                    </form>
                  </Form>

                  {conversionResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Conversion Result</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                              {conversionResult.convertedAmount.toFixed(2)} {conversionResult.to}
                            </div>
                            <div className="text-gray-600">
                              {conversionResult.amount} {conversionResult.from}
                            </div>
                          </div>
                          <Separator />
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Exchange Rate</div>
                            <div className="font-mono text-lg">
                              1 {conversionResult.from} = {conversionResult.rate} {conversionResult.to}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Calculator Tab */}
          <TabsContent value="calculate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Form {...taxCalcForm}>
                    <form onSubmit={taxCalcForm.handleSubmit(onCalculateTax)} className="space-y-4">
                      <FormField
                        control={taxCalcForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="10000"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={taxCalcForm.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {supportedRegions.map((region) => (
                                  <SelectItem key={region} value={region}>
                                    {region.charAt(0).toUpperCase() + region.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={taxCalcForm.control}
                        name="taxType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tax type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vat">VAT</SelectItem>
                                <SelectItem value="gst">GST</SelectItem>
                                <SelectItem value="wht">WHT</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Tax
                      </Button>
                    </form>
                  </Form>

                  {taxCalculationResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tax Calculation Result</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-gray-500">Original Amount</div>
                            <div className="text-lg font-semibold">
                              ฿{taxCalculationResult.amount.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">
                              {taxCalculationResult.taxType.toUpperCase()} ({taxCalculationResult.rate}%)
                            </div>
                            <div className="text-lg font-semibold text-red-600">
                              ฿{taxCalculationResult.taxAmount.toLocaleString()}
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <div className="text-sm text-gray-500">Total Amount</div>
                            <div className="text-2xl font-bold text-green-600">
                              ฿{taxCalculationResult.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        {/* Footer Information */}
        <div className="text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span>Multi-currency system for international property management</span>
          </div>
          <p>Exchange rates updated automatically • Tax compliance for multiple regions</p>
        </div>
      </div>
    </div>
  );
}