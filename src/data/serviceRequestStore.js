import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

let serviceRequests = [];
let currentServiceRequest = null;

const listeners = new Set();

let unsubscribeFirestore = null;
let subscribedUid = null;

export function getServiceRequests() {
  return serviceRequests;
}

export function getCurrentServiceRequest() {
  return currentServiceRequest;
}

export function setCurrentServiceRequest(request) {
  currentServiceRequest = request;
  notify();
}

/*
 * --------------------------------------------------
 * ADD SERVICE REQUEST
 * --------------------------------------------------
 *
 * The current MPRSS system uses the "services"
 * collection for customer service requests.
 */

export async function addServiceRequest(request) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be logged in to request a service."
    );
  }

  const requestData = {
    customerId: user.uid,
    customerUid: user.uid,
    customerEmail: user.email || "",

    motorcycleId:
      request.motorcycleId ?? null,

    motorcycle:
      request.motorcycle || "",

    serviceType:
      request.serviceType || "",

    preferredDate:
      request.preferredDate || "",

    preferredTime:
      request.preferredTime || "",

    issueDescription:
      request.issueDescription || "",

    requestDate:
      request.requestDate ||
      new Date().toISOString().split("T")[0],

    status:
      request.status ||
      "Pending Approval",

    approvalStatus:
      request.approvalStatus ||
      "pending",

    paymentMethod:
      request.paymentMethod ?? null,

    paymentStatus:
      request.paymentStatus ||
      "Pending",

    estimatedCost:
      request.estimatedCost ?? 0,

    estimatedTime:
      request.estimatedTime ?? "",

    assignedStaff:
      request.assignedStaff ?? "",

    assignedStaffId:
      request.assignedStaffId ?? null,

    assignedStaffPosition:
      request.assignedStaffPosition ?? null,

    notes:
      request.notes ?? null,

    partsUsed:
      request.partsUsed ?? [],

    rating:
      request.rating ?? null,

    feedback:
      request.feedback ?? null,

    scheduleReservationActive:
      request.scheduleReservationActive ??
      false,

    scheduleReservationDate:
      request.scheduleReservationDate ??
      request.preferredDate ??
      "",

    scheduleReservationTime:
      request.scheduleReservationTime ??
      request.preferredTime ??
      "",

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  const documentRef = await addDoc(
    collection(db, "services"),
    requestData
  );

  const newRequest = {
    id: documentRef.id,
    ...requestData,
  };

  currentServiceRequest = newRequest;

  notify();

  return newRequest;
}

/*
 * --------------------------------------------------
 * UPDATE CURRENT SERVICE REQUEST
 * --------------------------------------------------
 *
 * IMPORTANT:
 * This uses "services", not "serviceRequests".
 *
 * CustomerServices.jsx creates documents here:
 *
 * services/{serviceId}
 *
 * Therefore payment updates must also use:
 *
 * services/{serviceId}
 */

export async function updateCurrentServiceRequest(
  updates
) {
  if (!currentServiceRequest) {
    throw new Error(
      "No current service request was found."
    );
  }

  const requestId =
    currentServiceRequest.id;

  if (!requestId) {
    throw new Error(
      "The service request ID is missing."
    );
  }

  const requestRef = doc(
    db,
    "services",
    requestId
  );

  await updateDoc(requestRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  currentServiceRequest = {
    ...currentServiceRequest,
    ...updates,
  };

  notify();
}

/*
 * --------------------------------------------------
 * SUBSCRIBE TO SERVICE REQUESTS
 * --------------------------------------------------
 *
 * Despite the function name, the actual Firestore
 * collection is "services".
 *
 * The function name is kept unchanged so existing
 * screens that import it do not need to be rewritten.
 */

export function subscribeToServiceRequests(listener) {
  const user = auth.currentUser;

  if (!user) {
    serviceRequests = [];
    currentServiceRequest = null;

    listener(serviceRequests);

    return () => {};
  }

  if (subscribedUid !== user.uid) {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }

    subscribedUid = user.uid;

    const servicesRef = collection(
      db,
      "services"
    );

    unsubscribeFirestore = onSnapshot(
      servicesRef,
      (snapshot) => {
        serviceRequests = snapshot.docs
          .map((document) => ({
            id: document.id,
            ...document.data(),
          }))
          .filter(
            (request) =>
              request.customerId === user.uid
          )
          .sort((a, b) => {
            const aTime =
              a.createdAt?.seconds || 0;

            const bTime =
              b.createdAt?.seconds || 0;

            return bTime - aTime;
          });

        /*
         * Keep the current service request synchronized
         * with the latest Firestore data.
         */
        if (currentServiceRequest) {
          const matchingRequest =
            serviceRequests.find(
              (request) =>
                request.id ===
                currentServiceRequest.id
            );

          if (matchingRequest) {
            currentServiceRequest =
              matchingRequest;
          }
        }

        notify();
      },
      (error) => {
        console.error(
          "Error listening to services:",
          error
        );

        serviceRequests = [];
        notify();
      }
    );
  }

  listeners.add(listener);

  listener(serviceRequests);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      subscribedUid = null;
      serviceRequests = [];
      currentServiceRequest = null;
    }
  };
}

export function subscribeToServiceRequest(
  listener
) {
  listeners.add(listener);

  listener(currentServiceRequest);

  return () => {
    listeners.delete(listener);
  };
}

export function clearCurrentServiceRequest() {
  currentServiceRequest = null;
  notify();
}

function notify() {
  listeners.forEach((listener) => {
    listener(
      serviceRequests,
      currentServiceRequest
    );
  });
}