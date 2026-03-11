"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import UserLayout from "../user/page";
import DashboardLayout from "../dashboardLayout/page";
import {
  getReceivedConnectionRequests,
  getSentConnectionRequests,
  respondToConnectionRequest,
} from "../../config/redux/action/authAction";
import { BASE_URL } from "../../config";
import { buildConnectionCollections } from "../../utils/connectionHelpers";
import styles from "./page.module.css";

export default function MyConnections() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const [updatingRequestId, setUpdatingRequestId] = useState("");

  useEffect(() => {
    if (!authState.isTokenThere && !authState.profileFetched) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    dispatch(getSentConnectionRequests(token));
    dispatch(getReceivedConnectionRequests(token));
  }, [dispatch, authState.isTokenThere, authState.profileFetched]);

  const collections = useMemo(
    () =>
      buildConnectionCollections({
        sentRequests: authState.sentConnectionRequests,
        receivedRequests: authState.receivedConnectionRequests,
      }),
    [authState.receivedConnectionRequests, authState.sentConnectionRequests],
  );

  const handleRequestUpdate = async (requestId, action) => {
    const token = localStorage.getItem("token");
    if (!token || !requestId) return;

    try {
      setUpdatingRequestId(requestId);
      await dispatch(respondToConnectionRequest({ token, requestId, action })).unwrap();
      await Promise.all([
        dispatch(getSentConnectionRequests(token)).unwrap(),
        dispatch(getReceivedConnectionRequests(token)).unwrap(),
      ]);
    } catch (error) {
      alert(error || "Unable to update request");
    } finally {
      setUpdatingRequestId("");
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <h1>My Connections</h1>
            <p>Review requests, see accepted connections, and track your network growth.</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statsCard}>
              <span>{collections.acceptedConnections.length}</span>
              <p>Accepted connections</p>
            </div>
            <div className={styles.statsCard}>
              <span>{collections.sentPending.length}</span>
              <p>Requests sent</p>
            </div>
            <div className={styles.statsCard}>
              <span>{collections.receivedPending.length}</span>
              <p>Requests to review</p>
            </div>
            <div className={styles.statsCard}>
              <span>{collections.declinedRequests.length}</span>
              <p>Closed requests</p>
            </div>
          </div>

          <div className={styles.layout}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Incoming Requests</h2>
                <span>{collections.receivedPending.length}</span>
              </div>

              {collections.receivedPending.length === 0 ? (
                <p className={styles.empty}>No pending incoming requests.</p>
              ) : (
                <div className={styles.list}>
                  {collections.receivedPending.map((request) => (
                    <div key={request._id} className={styles.listCard}>
                      <div
                        className={styles.userRow}
                        onClick={() =>
                          router.push(
                            `/viewProfile?username=${encodeURIComponent(
                              request.userId?.username || "",
                            )}`,
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            router.push(
                              `/viewProfile?username=${encodeURIComponent(
                                request.userId?.username || "",
                              )}`,
                            );
                          }
                        }}
                      >
                        <img
                          src={
                            request.userId?.profilePicture
                              ? `${BASE_URL}/uploads/${request.userId.profilePicture}`
                              : "/default.png"
                          }
                          alt={request.userId?.name || "User"}
                          className={styles.avatar}
                        />
                        <div>
                          <p className={styles.name}>{request.userId?.name || "Unknown User"}</p>
                          <p className={styles.username}>
                            @{request.userId?.username || "unknown"}
                          </p>
                          <p className={styles.pendingLabel}>
                            {request.state === "pending" ? "Pending request" : ""}
                          </p>
                        </div>
                      </div>

                      <div className={styles.actionRow}>
                        <button
                          type="button"
                          className={styles.acceptButton}
                          disabled={updatingRequestId === request._id}
                          onClick={() => handleRequestUpdate(request._id, "accept")}
                        >
                          {updatingRequestId === request._id ? "Updating..." : "Accept"}
                        </button>
                        <button
                          type="button"
                          className={styles.rejectButton}
                          disabled={updatingRequestId === request._id}
                          onClick={() => handleRequestUpdate(request._id, "reject")}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>My Network</h2>
                <span>{collections.acceptedConnections.length}</span>
              </div>

              {collections.acceptedConnections.length === 0 ? (
                <p className={styles.empty}>No accepted connections yet.</p>
              ) : (
                <div className={styles.list}>
                  {collections.acceptedConnections.map((connection) => (
                    <div key={connection.requestId} className={styles.listCard}>
                      <div
                        className={styles.userRow}
                        onClick={() =>
                          router.push(
                            `/viewProfile?username=${encodeURIComponent(
                              connection.partner?.username || "",
                            )}`,
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            router.push(
                              `/viewProfile?username=${encodeURIComponent(
                                connection.partner?.username || "",
                              )}`,
                            );
                          }
                        }}
                      >
                        <img
                          src={
                            connection.partner?.profilePicture
                              ? `${BASE_URL}/uploads/${connection.partner.profilePicture}`
                              : "/default.png"
                          }
                          alt={connection.partner?.name || "User"}
                          className={styles.avatar}
                        />
                        <div>
                          <p className={styles.name}>
                            {connection.partner?.name || "Unknown User"}
                          </p>
                          <p className={styles.username}>
                            @{connection.partner?.username || "unknown"}
                          </p>
                          <p className={styles.badge}>Connected</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Requests You Sent</h2>
              <span>{collections.sentPending.length}</span>
            </div>

            {collections.sentPending.length === 0 ? (
              <p className={styles.empty}>No pending requests sent by you.</p>
            ) : (
              <div className={styles.list}>
                {collections.sentPending.map((request) => (
                  <div key={request._id} className={styles.listCard}>
                    <div
                      className={styles.userRow}
                      onClick={() =>
                        router.push(
                          `/viewProfile?username=${encodeURIComponent(
                            request.connectionId?.username || "",
                          )}`,
                        )
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          router.push(
                            `/viewProfile?username=${encodeURIComponent(
                              request.connectionId?.username || "",
                            )}`,
                          );
                        }
                      }}
                    >
                      <img
                        src={
                          request.connectionId?.profilePicture
                            ? `${BASE_URL}/uploads/${request.connectionId.profilePicture}`
                            : "/default.png"
                        }
                        alt={request.connectionId?.name || "User"}
                        className={styles.avatar}
                      />
                      <div>
                        <p className={styles.name}>
                          {request.connectionId?.name || "Unknown User"}
                        </p>
                        <p className={styles.username}>
                          @{request.connectionId?.username || "unknown"}
                        </p>
                        <p className={styles.pendingLabel}>
                          {request.state === "pending" ? "Pending approval" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
