import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, DollarSign, Percent, BarChart3, Download, Eye, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/hooks/useCurrency";

export default function OtaRevenueNetPayoutCalculation() {
  const { formatWithConversion } = useCurrency();
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedOta, setSelectedOta] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [filters, setFilters] = useState({
    minRevenue: "",
    maxRevenue: "",
    minBookings: "",
    dateFrom: "",
    dateTo: ""
  });

  const { data: propertiesData } = useQuery({ queryKey: ["/api/properties"] });
  const { data: bookingsData } = useQuery({ queryKey: ["/api/bookings"] });

  const calculateOtaStats = (source: string) => {
    const sourceBookings = (bookingsData || []).filter((b: any) => 
      b.source?.toLowerCase().includes(source.toLowerCase()) ||
      b.bookingPlatform?.toLowerCase().includes(source.toLowerCase())
    );
    const totalBookings = sourceBookings.length;
    const grossRevenue = sourceBookings.reduce((sum: number, b: any) => sum + parseFloat(b.totalAmount || b.guestTotalPrice || 0), 0);
    const totalCommission = sourceBookings.reduce((sum: number, b: any) => sum + parseFloat(b.otaCommissionAmount || 0), 0);
    const commissionRate = grossRevenue > 0 ? (totalCommission / grossRevenue) * 100 : 0;
    const netPayout = sourceBookings.reduce((sum: number, b: any) => sum + parseFloat(b.platformPayout || b.netHostPayout || (b.totalAmount - (b.otaCommissionAmount || 0)) || 0), 0);
    return { totalBookings, grossRevenue, hostFee: totalCommission, netPayout, commissionRate: Math.round(commissionRate * 10) / 10 };
  };

  const otaPlatforms = [
    { name: "Airbnb", color: "bg-red-100 text-red-800", ...calculateOtaStats('airbnb') },
    { name: "Booking.com", color: "bg-blue-100 text-blue-800", ...calculateOtaStats('booking') },
    { name: "VRBO", color: "bg-yellow-100 text-yellow-800", ...calculateOtaStats('vrbo') },
    { name: "Hostaway", color: "bg-green-100 text-green-800", ...calculateOtaStats('hostaway') },
    { name: "Expedia", color: "bg-purple-100 text-purple-800", ...calculateOtaStats('expedia') }
  ].filter(ota => ota.totalBookings > 0);

  const propertyBreakdown = (propertiesData || [])
    .filter((property: any) => {
      const propBookings = (bookingsData || []).filter((b: any) => b.propertyId === property.id);
      return propBookings.length > 0;
    })
    .map((property: any) => {
      const propBookings = (bookingsData || []).filter((b: any) => b.propertyId === property.id);
      const totalGross = propBookings.reduce((sum: number, b: any) => sum + parseFloat(b.totalAmount || b.guestTotalPrice || 0), 0);
      const totalCommission = propBookings.reduce((sum: number, b: any) => sum + parseFloat(b.otaCommissionAmount || 0), 0);
      const totalNet = totalGross - totalCommission;
      return {
        property: property.name,
        total: { bookings: propBookings.length, gross: totalGross, net: totalNet }
      };
    });

  const monthlyTrends: any[] = [];

  const totalGrossRevenue = otaPlatforms.reduce((sum, ota) => sum + ota.grossRevenue, 0);
  const totalNetPayout = otaPlatforms.reduce((sum, ota) => sum + ota.netPayout, 0);
  const totalCommissionLoss = totalGrossRevenue - totalNetPayout;
  const averageCommissionRate = (totalCommissionLoss / totalGrossRevenue) * 100;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="w-8 h-8" />
            OTA Revenue & Net Payout Calculation
          </h1>
          <p className="text-gray-600">Analyze commission structures and actual payouts across booking platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Property Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Property</label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {(propertiesData || []).map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>{property.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">OTA Platform</label>
              <Select value={selectedOta} onValueChange={setSelectedOta}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="booking">Booking.com</SelectItem>
                  <SelectItem value="vrbo">VRBO</SelectItem>
                  <SelectItem value="expedia">Expedia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Bookings</label>
              <Input 
                type="number" 
                placeholder="e.g. 10"
                value={filters.minBookings}
                onChange={(e) => setFilters({...filters, minBookings: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Revenue ($)</label>
              <Input 
                type="number" 
                placeholder="e.g. 5000"
                value={filters.minRevenue}
                onChange={(e) => setFilters({...filters, minRevenue: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Revenue ($)</label>
              <Input 
                type="number" 
                placeholder="e.g. 50000"
                value={filters.maxRevenue}
                onChange={(e) => setFilters({...filters, maxRevenue: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date From</label>
              <Input 
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date To</label>
              <Input 
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={() => {
              // Apply filters logic would go here
              console.log('Filters applied:', filters, selectedProperty, selectedOta, selectedPeriod);
            }}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={() => {
              setFilters({
                minRevenue: "",
                maxRevenue: "",
                minBookings: "",
                dateFrom: "",
                dateTo: ""
              });
              setSelectedProperty("all");
              setSelectedOta("all");
              setSelectedPeriod("month");
            }}>
              Clear Filters
            </Button>
            <Badge variant="outline" className="ml-2 px-3 py-1">
              {selectedProperty === "all" ? "All Properties" : selectedProperty} • 
              {selectedOta === "all" ? "All Platforms" : selectedOta} • 
              {selectedPeriod}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platform Analysis</TabsTrigger>
          <TabsTrigger value="properties">Property Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="calculator">Payout Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Gross Revenue</p>
                    <p className="text-2xl font-bold">{formatWithConversion(totalGrossRevenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Net Payout Received</p>
                    <p className="text-2xl font-bold text-blue-600">{formatWithConversion(totalNetPayout)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commission Loss</p>
                    <p className="text-2xl font-bold text-red-600">{formatWithConversion(totalCommissionLoss)}</p>
                  </div>
                  <Percent className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Commission Rate</p>
                    <p className="text-2xl font-bold text-orange-600">{averageCommissionRate.toFixed(1)}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {(propertiesData || []).map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>{property.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedOta} onValueChange={setSelectedOta}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="airbnb">Airbnb</SelectItem>
                    <SelectItem value="booking">Booking.com</SelectItem>
                    <SelectItem value="vrbo">VRBO</SelectItem>
                    <SelectItem value="expedia">Expedia</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="This Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Payout Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otaPlatforms.map((platform) => (
                  <div key={platform.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={platform.color}>{platform.name}</Badge>
                        <span className="text-sm text-gray-600">{platform.commissionRate}% commission</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatWithConversion(platform.netPayout)}</p>
                        <p className="text-sm text-gray-500">from {formatWithConversion(platform.grossRevenue)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 h-3">
                      <div 
                        className="bg-green-400 rounded-l"
                        style={{ width: `${(platform.netPayout / platform.grossRevenue) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-400 rounded-r"
                        style={{ width: `${(platform.hostFee / platform.grossRevenue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Net Payout: {((platform.netPayout / platform.grossRevenue) * 100).toFixed(1)}%</span>
                      <span>Commission: {((platform.hostFee / platform.grossRevenue) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otaPlatforms.map((platform) => (
              <Card key={platform.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <Badge className={platform.color}>{platform.name}</Badge>
                    <span className="text-lg font-bold">{platform.commissionRate}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-xl font-bold">{platform.totalBookings}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Nightly Rate</p>
                      <p className="text-xl font-bold">{formatWithConversion(platform.averageNightly)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Gross Revenue</span>
                      <span className="font-medium">{formatWithConversion(platform.grossRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span className="text-sm">Host Fee ({platform.commissionRate}%)</span>
                      <span className="font-medium">-{formatWithConversion(platform.hostFee)}</span>
                    </div>
                    {platform.guestServiceFee > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span className="text-sm">Guest Service Fee</span>
                        <span className="font-medium">-{formatWithConversion(platform.guestServiceFee)}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Net Payout</span>
                      <span>{formatWithConversion(platform.netPayout)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Payout Efficiency</p>
                      <p className="text-lg font-bold text-green-600">
                        {((platform.netPayout / platform.grossRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown by Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {propertyBreakdown.map((property) => (
                  <div key={property.property} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-4">{property.property}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-600">Airbnb</p>
                        <p className="text-xs text-gray-600">{property.airbnb.bookings} bookings</p>
                        <p className="font-medium">{formatWithConversion(property.airbnb.net)}</p>
                        <p className="text-xs text-gray-500">from {formatWithConversion(property.airbnb.gross)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-600">Booking.com</p>
                        <p className="text-xs text-gray-600">{property.booking.bookings} bookings</p>
                        <p className="font-medium">{formatWithConversion(property.booking.net)}</p>
                        <p className="text-xs text-gray-500">from {formatWithConversion(property.booking.gross)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-yellow-600">VRBO</p>
                        <p className="text-xs text-gray-600">{property.vrbo.bookings} bookings</p>
                        <p className="font-medium">{formatWithConversion(property.vrbo.net)}</p>
                        <p className="text-xs text-gray-500">from {formatWithConversion(property.vrbo.gross)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-purple-600">Expedia</p>
                        <p className="text-xs text-gray-600">{property.expedia.bookings} bookings</p>
                        <p className="font-medium">{formatWithConversion(property.expedia.net)}</p>
                        <p className="text-xs text-gray-500">from {formatWithConversion(property.expedia.gross)}</p>
                      </div>
                      <div className="space-y-2 border-l pl-4">
                        <p className="text-sm font-medium text-green-600">Total</p>
                        <p className="text-xs text-gray-600">{property.total.bookings} bookings</p>
                        <p className="font-bold text-green-600">{formatWithConversion(property.total.net)}</p>
                        <p className="text-xs text-gray-500">from {formatWithConversion(property.total.gross)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{month.month}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-red-600 font-medium">{formatWithConversion(month.airbnb)}</p>
                        <p className="text-xs text-gray-500">Airbnb</p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-600 font-medium">{formatWithConversion(month.booking)}</p>
                        <p className="text-xs text-gray-500">Booking.com</p>
                      </div>
                      <div className="text-center">
                        <p className="text-yellow-600 font-medium">{formatWithConversion(month.vrbo)}</p>
                        <p className="text-xs text-gray-500">VRBO</p>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-600 font-medium">{formatWithConversion(month.expedia)}</p>
                        <p className="text-xs text-gray-500">Expedia</p>
                      </div>
                      <div className="text-center border-l pl-4">
                        <p className="text-green-600 font-bold">
                          {formatWithConversion(month.airbnb + month.booking + month.vrbo + month.expedia)}
                        </p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Booking Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Guest Total Payment</label>
                      <Input type="number" placeholder="1500.00" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">OTA Platform</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="airbnb">Airbnb (5%)</SelectItem>
                          <SelectItem value="booking">Booking.com (15%)</SelectItem>
                          <SelectItem value="vrbo">VRBO (8%)</SelectItem>
                          <SelectItem value="expedia">Expedia (18%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Custom Commission Rate (%)</label>
                      <Input type="number" placeholder="5.0" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Calculated Payout</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Guest Payment:</span>
                      <span className="font-medium">$1,500.00</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Platform Commission (5%):</span>
                      <span className="font-medium">-$75.00</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Your Net Payout:</span>
                      <span>$1,425.00</span>
                    </div>
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-600">Payout Efficiency: 95.0%</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="w-full">Calculate Payout</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}