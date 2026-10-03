let motorcycles = [];

const listeners = new Set();

export function getMotorcycles() {
  return motorcycles;
}

export function addMotorcycle(motorcycle) {
  const newMotorcycle = {
    id: `moto-${Date.now()}`,
    ...motorcycle,
  };

  motorcycles = [...motorcycles, newMotorcycle];

  notify();

  return newMotorcycle;
}

export function updateMotorcycle(id, updates) {
  motorcycles = motorcycles.map((motorcycle) =>
    motorcycle.id === id
      ? {
          ...motorcycle,
          ...updates,
        }
      : motorcycle
  );

  notify();
}

export function requestMotorcycleDeletion(
  motorcycleId,
  reason
) {
  motorcycles = motorcycles.map((motorcycle) =>
    motorcycle.id === motorcycleId
      ? {
          ...motorcycle,
          deletionRequest: {
            status: "pending",
            reason,
            requestedAt: new Date().toISOString(),
          },
        }
      : motorcycle
  );

  notify();
}

export function subscribeToMotorcycles(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((listener) => listener(motorcycles));
}