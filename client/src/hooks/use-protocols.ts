import { useQuery } from "@tanstack/react-query";
import { DefiProtocol } from "@shared/schema";

export function useProtocols() {
  return useQuery<DefiProtocol[]>({
    queryKey: ["/api/protocols"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProtocol(id: number) {
  return useQuery<DefiProtocol>({
    queryKey: ["/api/protocols", id],
    enabled: !!id,
  });
}