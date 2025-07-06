import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import TopBar from "@/components/TopBar";
import BookingCalendar from "@/components/BookingCalendar";
import CreateBookingDialog from "@/components/CreateBookingDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Bookings() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  return (
    <div className="min-h-screen flex bg-background">

      
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar 
          title="Booking Calendar" 
          action={
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          }
        />
        
        <main className="flex-1 overflow-auto p-6">
          <BookingCalendar bookings={bookings} />
        </main>
      </div>

      <CreateBookingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
