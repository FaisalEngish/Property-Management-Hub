import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Info } from "lucide-react";

interface DualOtaPricingProps {
  guestTotalPrice: number;
  platformPayout: number;
  otaCommissionAmount?: number;
  currency?: string;
  platform?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  showBreakdown?: boolean;
  reservationNumber?: string;
  emphasizePayoutAsRevenue?: boolean;
}

export function DualOtaPricing({
  guestTotalPrice,
  platformPayout,
  otaCommissionAmount,
  currency = "THB",
  platform = "OTA",
  size = "md",
  showTooltip = true,
  showBreakdown = true,
  reservationNumber,
  emphasizePayoutAsRevenue = false,
}: DualOtaPricingProps) {
  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const commissionAmount = otaCommissionAmount || (guestTotalPrice - platformPayout);
  const commissionPercentage = guestTotalPrice > 0 ? ((commissionAmount / guestTotalPrice) * 100) : 0;

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const content = (
    <div className="space-y-1">
      {/* Guest Total Price */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-gray-400">Guest Paid:</span>
        <span className={`font-semibold text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`}>
          {formatCurrency(guestTotalPrice, currency)}
        </span>
      </div>

      {/* Platform Payout - Emphasized as Revenue Baseline */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-gray-400">
          {emphasizePayoutAsRevenue ? "Revenue" : "Payout"} ({platform}):
        </span>
        <span className={`font-bold ${emphasizePayoutAsRevenue ? 'text-green-700 dark:text-green-400' : 'text-green-600 dark:text-green-400'} ${sizeClasses[size]}`}>
          {formatCurrency(platformPayout, currency)}
          {emphasizePayoutAsRevenue && <span className="text-xs ml-1 text-green-600">*</span>}
        </span>
      </div>

      {/* Commission Breakdown */}
      {showBreakdown && commissionAmount > 0 && (
        <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-red-600 dark:text-red-400">
            OTA Commission:
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              {formatCurrency(commissionAmount, currency)}
            </span>
            <Badge variant="destructive" className="text-xs">
              {commissionPercentage.toFixed(1)}%
            </Badge>
          </div>
        </div>
      )}

      {/* Reservation Number */}
      {reservationNumber && (
        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 pt-1">
          <span className="text-xs">Reservation:</span>
          <span className="text-xs font-mono">{reservationNumber}</span>
        </div>
      )}

      {/* Revenue Baseline Note */}
      {emphasizePayoutAsRevenue && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-green-600 dark:text-green-400">
            * All financial calculations use payout amount only
          </p>
        </div>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              {content}
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">
                  All calculations use payout amount
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">⚠️ OTA Commission Deduction</p>
              <p className="text-xs">
                The guest paid <strong>{formatCurrency(guestTotalPrice, currency)}</strong> to {platform}, 
                but you only receive <strong>{formatCurrency(platformPayout, currency)}</strong> after 
                their commission deduction.
              </p>
              <p className="text-xs text-orange-600">
                All financial calculations (management fees, owner splits, agent commissions) 
                are based on the actual payout received, not the guest total price.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// Compact version for table cells
export function DualOtaPricingCompact({
  guestTotalPrice,
  platformPayout,
  otaCommissionAmount,
  currency = "THB",
  platform = "OTA",
}: Omit<DualOtaPricingProps, "size" | "showTooltip" | "showBreakdown">) {
  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const commissionAmount = otaCommissionAmount || (guestTotalPrice - platformPayout);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-center cursor-help">
            <div className="text-xs text-gray-500">
              Guest: {formatCurrency(guestTotalPrice, currency)}
            </div>
            <div className="font-semibold text-green-600">
              Payout: {formatCurrency(platformPayout, currency)}
            </div>
            {commissionAmount > 0 && (
              <div className="text-xs text-red-600">
                -{formatCurrency(commissionAmount, currency)}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>⚠️ {platform} commission already deducted from payout</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Summary card version for dashboards
export function DualOtaPricingSummary({
  guestTotalPrice,
  platformPayout,
  otaCommissionAmount,
  currency = "THB",
  platform = "OTA",
}: DualOtaPricingProps) {
  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const commissionAmount = otaCommissionAmount || (guestTotalPrice - platformPayout);

  return (
    <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-gray-700">Revenue Breakdown</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Guest Paid</div>
          <div className="font-bold text-blue-600">
            {formatCurrency(guestTotalPrice, currency)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">{platform} Fee</div>
          <div className="font-bold text-red-600">
            -{formatCurrency(commissionAmount, currency)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Your Payout</div>
          <div className="font-bold text-green-600">
            {formatCurrency(platformPayout, currency)}
          </div>
        </div>
      </div>
      
      <div className="mt-3 p-2 bg-orange-50 rounded border-l-4 border-orange-400">
        <p className="text-xs text-orange-700">
          💡 All commission calculations are based on the payout amount ({formatCurrency(platformPayout, currency)})
        </p>
      </div>
    </div>
  );
}