import { PMSClient, PMSListing, PMSAvailability } from '../types';

export class DemoAdapter implements PMSClient {
  private demoListings: PMSListing[] = [
    {
      id: 'demo-villa-1',
      title: 'Luxury Beachfront Villa Samui',
      address: 'Bophut Beach, Koh Samui, Thailand',
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      propertyType: 'Villa',
      status: 'active',
      description: 'Stunning beachfront villa with private infinity pool and panoramic ocean views'
    },
    {
      id: 'demo-apt-2', 
      title: 'Modern Bangkok Penthouse',
      address: 'Sukhumvit Road, Bangkok, Thailand',
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      propertyType: 'Apartment',
      status: 'active',
      description: 'Contemporary penthouse in the heart of Bangkok with city skyline views'
    },
    {
      id: 'demo-cabin-3',
      title: 'Mountain Retreat Chiang Mai',
      address: 'Doi Suthep, Chiang Mai, Thailand',
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      propertyType: 'Cabin',
      status: 'active',
      description: 'Peaceful mountain retreat surrounded by tropical forest and wildlife'
    },
    {
      id: 'demo-villa-4',
      title: 'Phuket Sunset Villa',
      address: 'Kata Beach, Phuket, Thailand',
      bedrooms: 5,
      bathrooms: 4,
      maxGuests: 10,
      propertyType: 'Villa',
      status: 'active',
      description: 'Luxury villa with private beach access and spectacular sunset views'
    }
  ];

  async listListings(params?: { limit?: number; offset?: number }): Promise<PMSListing[]> {
    const { limit = 10, offset = 0 } = params || {};
    
    // Simulate realistic API delay
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));
    
    return this.demoListings.slice(offset, offset + limit);
  }

  async getAvailability(params: { 
    listingId: string | number; 
    start: string; 
    end: string 
  }): Promise<PMSAvailability[]> {
    const { listingId, start, end } = params;
    
    // Simulate realistic API delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 150));
    
    // Generate realistic availability data based on property type
    const listing = this.demoListings.find(l => l.id === listingId);
    const basePrice = this.getBasePriceForProperty(listing);
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const availability: PMSAvailability[] = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const isHoliday = this.isHolidayPeriod(currentDate);
      const randomFactor = Math.random();
      
      // Weekend and holiday pricing
      let priceMultiplier = 1;
      if (isHoliday) priceMultiplier = 1.5;
      else if (isWeekend) priceMultiplier = 1.3;
      
      const finalPrice = Math.round(basePrice * priceMultiplier * (0.8 + randomFactor * 0.4));
      
      availability.push({
        date: currentDate.toISOString().split('T')[0],
        available: randomFactor > 0.25, // 75% availability rate
        price: finalPrice,
        minStay: isWeekend || isHoliday ? 2 : 1,
        currency: 'USD'
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return availability;
  }

  private getBasePriceForProperty(listing?: PMSListing): number {
    if (!listing) return 120;
    
    // Price based on property type and size
    const basePrices = {
      'Villa': 180,
      'Apartment': 120,
      'Cabin': 90
    };
    
    const basePrice = basePrices[listing.propertyType as keyof typeof basePrices] || 120;
    const sizeMultiplier = Math.max(1, listing.bedrooms * 0.2);
    
    return Math.round(basePrice * sizeMultiplier);
  }

  private isHolidayPeriod(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Thai high season periods
    return (
      (month === 12 && day >= 20) || // Christmas/New Year
      (month === 1 && day <= 15) ||  // New Year extended
      (month === 2 && day >= 10 && day <= 20) || // Chinese New Year
      (month === 4 && day >= 10 && day <= 20)    // Songkran
    );
  }

  async testConnection(): Promise<boolean> {
    // Demo adapter always works
    return true;
  }
}