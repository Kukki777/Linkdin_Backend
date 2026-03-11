export const normalizeId = (idValue) => {
  if (!idValue) return "";
  if (typeof idValue === "string") return idValue;
  if (typeof idValue === "object" && idValue._id) return String(idValue._id);
  return String(idValue);
};

export const getConnectionStatus = (statusAccepted) => {
  if (statusAccepted === true) return "connected";
  if (statusAccepted === false) return "declined";
  if (statusAccepted === null || typeof statusAccepted === "undefined") {
    return "pending";
  }
  return "pending";
};

export const getConnectionRelation = ({
  targetUserId,
  sentRequests = [],
  receivedRequests = [],
}) => {
  const normalizedTargetId = normalizeId(targetUserId);

  const sentRequest = sentRequests.find(
    (request) =>
      normalizeId(request?.connectionId?._id || request?.connectionId) ===
      normalizedTargetId,
  );

  const receivedRequest = receivedRequests.find(
    (request) =>
      normalizeId(request?.userId?._id || request?.userId) === normalizedTargetId,
  );

  if (
    getConnectionStatus(sentRequest?.status_accepted) === "connected" ||
    getConnectionStatus(receivedRequest?.status_accepted) === "connected"
  ) {
    return { type: "connected", request: sentRequest || receivedRequest };
  }

  if (getConnectionStatus(receivedRequest?.status_accepted) === "pending") {
    return { type: "incoming_pending", request: receivedRequest };
  }

  if (getConnectionStatus(sentRequest?.status_accepted) === "pending") {
    return { type: "outgoing_pending", request: sentRequest };
  }

  if (
    getConnectionStatus(sentRequest?.status_accepted) === "declined" ||
    getConnectionStatus(receivedRequest?.status_accepted) === "declined"
  ) {
    return { type: "declined", request: sentRequest || receivedRequest };
  }

  return { type: "not_connected", request: null };
};

export const buildConnectionCollections = ({
  sentRequests = [],
  receivedRequests = [],
}) => {
  const acceptedMap = new Map();

  sentRequests.forEach((request) => {
    if (getConnectionStatus(request?.status_accepted) !== "connected") return;
    const partner = request.connectionId;
    const partnerId = normalizeId(partner?._id || partner);
    if (!partnerId) return;
    acceptedMap.set(partnerId, {
      requestId: request._id,
      direction: "sent",
      partner,
      status: getConnectionStatus(request.status_accepted),
    });
  });

  receivedRequests.forEach((request) => {
    if (getConnectionStatus(request?.status_accepted) !== "connected") return;
    const partner = request.userId;
    const partnerId = normalizeId(partner?._id || partner);
    if (!partnerId || acceptedMap.has(partnerId)) return;
    acceptedMap.set(partnerId, {
      requestId: request._id,
      direction: "received",
      partner,
      status: getConnectionStatus(request.status_accepted),
    });
  });

  return {
    acceptedConnections: Array.from(acceptedMap.values()),
    sentPending: sentRequests
      .filter((request) => getConnectionStatus(request?.status_accepted) === "pending")
      .map((request) => ({ ...request, state: "pending" })),
    receivedPending: receivedRequests
      .filter((request) => getConnectionStatus(request?.status_accepted) === "pending")
      .map((request) => ({ ...request, state: "pending" })),
    declinedRequests: [...sentRequests, ...receivedRequests].filter(
      (request) => getConnectionStatus(request?.status_accepted) === "declined",
    ),
  };
};
