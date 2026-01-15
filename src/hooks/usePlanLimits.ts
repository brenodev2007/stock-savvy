// Hook simplificado - todos podem criar sem limites
export function useCanCreate(resource: string) {
  return {
    canCreate: true,
    message: null,
    usage: { current: 0, max: 999 }
  };
}
