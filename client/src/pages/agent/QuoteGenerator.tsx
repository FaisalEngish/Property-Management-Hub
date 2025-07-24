export default function QuoteGenerator() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Generate a Client Quote</h1>
      <form className="grid grid-cols-2 gap-4">
        <input className="p-2 border rounded" placeholder="Destination" />
        <input className="p-2 border rounded" placeholder="Check-in" type="date" />
        <input className="p-2 border rounded" placeholder="Check-out" type="date" />
        <input className="p-2 border rounded" placeholder="Guests" type="number" />
        <input className="p-2 border rounded" placeholder="Budget (min)" />
        <input className="p-2 border rounded" placeholder="Budget (max)" />
        <button className="col-span-2 bg-blue-500 text-white py-2 rounded">Search</button>
      </form>
    </div>
  );
}