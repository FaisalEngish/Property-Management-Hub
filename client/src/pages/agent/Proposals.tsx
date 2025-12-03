import { useQuery } from "@tanstack/react-query";

export default function ClientProposals() {
  // Fetch proposals from API
  const { data: proposals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/proposals"],
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Client Proposals</h1>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-3/4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Client Proposals</h1>
      {proposals.length === 0 ? (
        <p className="text-gray-500">No proposals found. Create a proposal to get started.</p>
      ) : (
        <ul className="list-disc pl-5">
          {proposals.map((proposal: any, index: number) => (
            <li key={proposal.id || index}>
              Proposal #{proposal.id || index + 1} – {proposal.propertyName} – ฿{(proposal.amount || 0).toLocaleString()} – Status: {proposal.status || 'Draft'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}