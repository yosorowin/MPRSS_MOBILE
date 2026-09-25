let currentServiceRequest = null;

const listeners = new Set();

export function getCurrentServiceRequest() {
  return currentServiceRequest;
}

export function setCurrentServiceRequest(request) {
  currentServiceRequest = request;
  notify();
}

export function updateCurrentServiceRequest(updates) {
  if (!currentServiceRequest) {
    return;
  }

  currentServiceRequest = {
    ...currentServiceRequest,
    ...updates,
  };

  notify();
}

export function clearCurrentServiceRequest() {
  currentServiceRequest = null;
  notify();
}

export function subscribeToServiceRequest(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((listener) => {
    listener(currentServiceRequest);
  });
}