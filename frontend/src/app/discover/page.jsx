"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import UserLayout from "../user/page";
import DashboardLayout from "../dashboardLayout/page";
import {
  getAllUsers,
  getReceivedConnectionRequests,
  getSentConnectionRequests,
  sendConnectionRequest,
} from "../../config/redux/action/authAction";
import { BASE_URL } from "../../config";
import {
  buildConnectionCollections,
  getConnectionRelation,
  normalizeId,
} from "../../utils/connectionHelpers";
import styles from "./page.module.css";

export default function DiscoverPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const [sendingToUserId, setSendingToUserId] = useState("");

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  useEffect(() => {
    if (!authState.isTokenThere && !authState.profileFetched) return;

    const token = localStorage.getItem("token");
    if (!token) return;
    dispatch(getSentConnectionRequests(token));
    dispatch(getReceivedConnectionRequests(token));
  }, [dispatch, authState.isTokenThere, authState.profileFetched]);

  const myUserId = normalizeId(authState.user?.userId?._id || authState.user?._id);
  const profiles = Array.isArray(authState.all_users)
    ? authState.all_users.filter((profile) => normalizeId(profile?.userId?._id) !== myUserId)
    : [];

  const collections = useMemo(
    () =>
      buildConnectionCollections({
        sentRequests: authState.sentConnectionRequests,
        receivedRequests: authState.receivedConnectionRequests,
      }),
    [authState.receivedConnectionRequests, authState.sentConnectionRequests],
  );

  const handleSendConnectionRequest = async (event, connectionId) => {
    event.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token || !connectionId) {
      alert("Please login again");
      return;
    }

    try {
      setSendingToUserId(connectionId);
      await dispatch(sendConnectionRequest({ token, connectionId })).unwrap();
      await Promise.all([
        dispatch(getSentConnectionRequests(token)).unwrap(),
        dispatch(getReceivedConnectionRequests(token)).unwrap(),
      ]);
    } catch (error) {
      alert(error || "Unable to send connection request");
    } finally {
      setSendingToUserId("");
    }
  };

  const getActionLabel = (relationType) => {
    if (relationType === "connected") return "Connected";
    if (relationType === "incoming_pending") return "Respond in My Connections";
    if (relationType === "outgoing_pending") return "Request Sent";
    if (relationType === "declined") return "Closed";
    return "Connect";
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div>
              <h1>Discover People</h1>
              <p>Find professionals, send requests, and track your network.</p>
            </div>

            <div className={styles.summaryBar}>
              <div className={styles.summaryCard}>
                <span>{collections.acceptedConnections.length}</span>
                <p>Connections</p>
              </div>
              <div className={styles.summaryCard}>
                <span>{collections.sentPending.length}</span>
                <p>Sent</p>
              </div>
              <div className={styles.summaryCard}>
                <span>{collections.receivedPending.length}</span>
                <p>Incoming</p>
              </div>
            </div>
          </div>

          {!authState.all_profiles_fetched ? (
            <p className={styles.info}>Loading profiles...</p>
          ) : profiles.length === 0 ? (
            <p className={styles.info}>No profiles found.</p>
          ) : (
            <div className={styles.grid}>
              {profiles.map((profile) => {
                const profileUserId = normalizeId(profile?.userId?._id);
                const relation = getConnectionRelation({
                  targetUserId: profileUserId,
                  sentRequests: authState.sentConnectionRequests,
                  receivedRequests: authState.receivedConnectionRequests,
                });

                const isDisabled =
                  relation.type !== "not_connected" || sendingToUserId === profileUserId;

                return (
                  <div
                    key={profile._id}
                    className={styles.card}
                    onClick={() =>
                      router.push(
                        `/viewProfile?username=${encodeURIComponent(
                          profile.userId?.username || "",
                        )}`,
                      )
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        router.push(
                          `/viewProfile?username=${encodeURIComponent(
                            profile.userId?.username || "",
                          )}`,
                        );
                      }
                    }}
                  >
                    <img
                      src={
                        profile.userId?.profilePicture
                          ? `${BASE_URL}/uploads/${profile.userId.profilePicture}`
                          : "/default.png"
                      }
                      alt={`${profile.userId?.name || "User"} profile`}
                      className={styles.avatar}
                    />

                    <p className={styles.name}>{profile.userId?.name || "Unknown User"}</p>
                    <p className={styles.username}>
                      @{profile.userId?.username || "unknown"}
                    </p>
                    <p className={styles.meta}>
                      {profile.currentPost || profile.bio || "No headline available"}
                    </p>

                    <button
                      type="button"
                      className={styles.connectButton}
                      disabled={isDisabled}
                      onClick={(event) =>
                        handleSendConnectionRequest(event, profileUserId)
                      }
                    >
                      {sendingToUserId === profileUserId
                        ? "Sending..."
                        : getActionLabel(relation.type)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
