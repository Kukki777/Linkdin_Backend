"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import UserLayout from "../user/page";
import DashboardLayout from "../dashboardLayout/page";
import { BASE_URL, clientServer } from "../../config";
import {
  getReceivedConnectionRequests,
  getSentConnectionRequests,
  sendConnectionRequest,
} from "../../config/redux/action/authAction";
import { getConnectionRelation, normalizeId } from "../../utils/connectionHelpers";
import styles from "./page.module.css";

export default function ViewProfilePage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [viewerUserId, setViewerUserId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingPostId, setDeletingPostId] = useState("");
  const [likingPostId, setLikingPostId] = useState("");
  const [sharingPostId, setSharingPostId] = useState("");
  const [commentingPostId, setCommentingPostId] = useState("");
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState("");
  const [sendingConnection, setSendingConnection] = useState(false);

  const [openComments, setOpenComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const fetchPostsByUsername = async (targetUsername) => {
    const postsResponse = await clientServer.get(`/posts_by_username`, {
      params: { username: targetUsername },
    });
    setPosts(Array.isArray(postsResponse.data?.posts) ? postsResponse.data.posts : []);
  };

  useEffect(() => {
    if (!authState.isTokenThere && !authState.profileFetched) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    dispatch(getSentConnectionRequests(token));
    dispatch(getReceivedConnectionRequests(token));

    clientServer
      .post("/get_user_and_profile", { token })
      .then((response) => {
        const me = response.data;
        const id = me?.userId?._id || me?._id || "";
        setViewerUserId(String(id));
      })
      .catch(() => setViewerUserId(""));
  }, [dispatch, authState.isTokenThere, authState.profileFetched]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError("Username is missing in URL");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        setOpenComments({});
        setCommentsByPost({});
        setCommentInputs({});

        const profileResponse = await clientServer.get(`/user/get_profile_based_on_username`, {
          params: { username },
        });

        setProfile(profileResponse.data || null);
        await fetchPostsByUsername(username);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Unable to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const fetchComments = async (postId) => {
    try {
      setLoadingCommentsPostId(postId);
      const response = await clientServer.get("/get_comments", {
        params: { post_id: postId },
      });
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: Array.isArray(response.data?.comments) ? response.data.comments : [],
      }));
    } catch {
      setCommentsByPost((prev) => ({ ...prev, [postId]: [] }));
    } finally {
      setLoadingCommentsPostId("");
    }
  };

  const toggleComments = async (postId) => {
    const isOpen = Boolean(openComments[postId]);
    setOpenComments((prev) => ({ ...prev, [postId]: !isOpen }));
    if (!isOpen && !commentsByPost[postId]) await fetchComments(postId);
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentPost = async (postId) => {
    const token = localStorage.getItem("token");
    const commentBody = (commentInputs[postId] || "").trim();
    if (!token || !commentBody) return;

    try {
      setCommentingPostId(postId);
      await clientServer.post("/comment", { token, post_id: postId, commentBody });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      await fetchComments(postId);
      setOpenComments((prev) => ({ ...prev, [postId]: true }));
    } catch {
      alert("Unable to add comment");
    } finally {
      setCommentingPostId("");
    }
  };

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please login again"); return; }

    try {
      setLikingPostId(postId);
      const response = await clientServer.post("/increment_post_like", { post_id: postId, token });

      const { likes, liked, likedByUserId } = response.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post;
          const currentLikedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
          const nextLikedBy = likedByUserId
            ? liked === false
              ? currentLikedBy.filter((id) => normalizeId(id) !== normalizeId(likedByUserId))
              : currentLikedBy.some((id) => normalizeId(id) === normalizeId(likedByUserId))
                ? currentLikedBy
                : [...currentLikedBy, likedByUserId]
            : currentLikedBy;
          return { ...post, likes: typeof likes === "number" ? likes : post.likes, likedBy: nextLikedBy };
        })
      );
    } catch (likeError) {
      alert(likeError?.response?.data?.message || "Unable to like post");
    } finally {
      setLikingPostId("");
    }
  };

  const handleSharePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please login again"); return; }

    try {
      setSharingPostId(postId);
      await clientServer.post("/share_post", { token, post_id: postId });
      await fetchPostsByUsername(username);
    } catch (shareError) {
      alert(shareError?.response?.data?.message || "Unable to share post");
    } finally {
      setSharingPostId("");
    }
  };

  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please login again"); return; }

    try {
      setDeletingPostId(postId);
      await clientServer.post("/delete_post", { token, post_id: postId });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (deleteError) {
      alert(deleteError?.response?.data?.message || "Unable to delete post");
    } finally {
      setDeletingPostId("");
    }
  };

  const profilePicSrc = profile?.userId?.profilePicture
    ? `${BASE_URL}/uploads/${encodeURIComponent(profile.userId.profilePicture)}`
    : "/default.png";

  const viewedUserId = normalizeId(profile?.userId?._id);
  const connectionRelation = useMemo(
    () =>
      getConnectionRelation({
        targetUserId: viewedUserId,
        sentRequests: authState.sentConnectionRequests,
        receivedRequests: authState.receivedConnectionRequests,
      }),
    [
      authState.receivedConnectionRequests,
      authState.sentConnectionRequests,
      viewedUserId,
    ],
  );

  const handleConnect = async () => {
    const token = localStorage.getItem("token");
    if (!token || !viewedUserId) {
      alert("Please login again");
      return;
    }

    try {
      setSendingConnection(true);
      await dispatch(
        sendConnectionRequest({ token, connectionId: viewedUserId }),
      ).unwrap();
      await Promise.all([
        dispatch(getSentConnectionRequests(token)).unwrap(),
        dispatch(getReceivedConnectionRequests(token)).unwrap(),
      ]);
    } catch (requestError) {
      alert(requestError || "Unable to send connection request");
    } finally {
      setSendingConnection(false);
    }
  };

  const connectButtonLabel = (() => {
    if (normalizeId(viewerUserId) === viewedUserId) return "Your Profile";
    if (sendingConnection) return "Sending...";
    if (connectionRelation.type === "connected") return "Connected";
    if (connectionRelation.type === "incoming_pending") return "Pending Your Review";
    if (connectionRelation.type === "outgoing_pending") return "Request Sent";
    if (connectionRelation.type === "declined") return "Closed";
    return "Connect";
  })();

  const connectButtonDisabled =
    normalizeId(viewerUserId) === viewedUserId ||
    sendingConnection ||
    connectionRelation.type !== "not_connected";

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.wrapper}>
          {isLoading ? (
            <p className={styles.info}>Loading profile...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : profile ? (
            <>
              {/* ── Profile card ── */}
              <div className={styles.card}>
                {/* Cover photo */}
                {profile.coverPhoto ? (
                  <img
                    src={`${BASE_URL}/uploads/${encodeURIComponent(profile.coverPhoto)}`}
                    alt="Cover"
                    className={styles.coverPhoto}
                  />
                ) : (
                  <div className={styles.coverDefault} />
                )}

                <div className={styles.profileBody}>
                  {/* Avatar */}
                  <div className={styles.avatarWrapper}>
                    <img
                      src={profilePicSrc}
                      alt={`${profile.userId?.name || "User"} profile`}
                      className={styles.avatar}
                    />
                  </div>

                  {/* Name / headline */}
                  <div className={styles.nameRow}>
                    <h1 className={styles.name}>{profile.userId?.name || "Unknown User"}</h1>
                    <p className={styles.username}>@{profile.userId?.username || "unknown"}</p>
                    <p className={styles.sectionLabel}>Headline</p>
                    <p className={styles.meta}>{profile.currentPost || "No current role provided"}</p>
                    <p className={styles.sectionLabel}>Bio</p>
                    <p className={styles.bio}>{profile.bio || "No bio available"}</p>
                  </div>

                  {/* Action buttons */}
                  <div className={styles.profileActions}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      disabled={connectButtonDisabled}
                      onClick={handleConnect}
                    >
                      {connectButtonLabel}
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => router.push("/myconnections")}
                    >
                      My Connections
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Posts section ── */}
              <div className={styles.postsSection}>
                {posts.length > 0 && (
                  <div className={styles.dividerCard}>
                    <h2 className={styles.postsHeading}>Activity</h2>
                  </div>
                )}

                {posts.length === 0 ? (
                  <div className={styles.dividerCard}>
                    <p className={styles.info}>No posts by this user yet.</p>
                  </div>
                ) : (
                  <div className={styles.postsList}>
                    {posts.map((post) => {
                      const displayPost = post.isShared && post.sharedPostId ? post.sharedPostId : post;
                      const mediaName =
                        typeof displayPost?.media === "string" && displayPost.media !== "null"
                          ? displayPost.media
                          : typeof post?.media === "string" && post.media !== "null"
                            ? post.media
                            : "";
                      const mediaUrl = mediaName
                        ? `${BASE_URL}/uploads/${encodeURIComponent(mediaName)}`
                        : "";
                      const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
                      const hasLiked = likedBy.some((id) => normalizeId(id) === normalizeId(viewerUserId));
                      const commentCount = Array.isArray(commentsByPost[post._id])
                        ? commentsByPost[post._id].length : 0;
                      const canDelete =
                        normalizeId(post.userId?._id || post.userId) === normalizeId(viewerUserId);

                      // Author for display
                      const postAuthorPic = post.userId?.profilePicture
                        ? `${BASE_URL}/uploads/${encodeURIComponent(post.userId.profilePicture)}`
                        : "/default.png";

                      return (
                        <div key={post._id} className={styles.postCard}>
                          {/* Post author row */}
                          <div className={styles.postAuthorRow}>
                            <img
                              src={postAuthorPic}
                              alt="Author"
                              className={styles.postAuthorAvatar}
                            />
                            <div>
                              <p className={styles.postAuthorName}>
                                {post.userId?.name || "Unknown User"}
                              </p>
                              <p className={styles.postAuthorMeta}>
                                {post.userId?.username ? `@${post.userId.username}` : ""}
                              </p>
                            </div>
                          </div>

                          {/* Shared indicator */}
                          {post.isShared && (
                            <p className={styles.sharedLabel}>↗ Reposted</p>
                          )}

                          {post.isShared && post.sharedPostId && (
                            <div className={styles.originalInfo}>
                              Originally posted by {displayPost.userId?.name || "Unknown User"}
                            </div>
                          )}

                          {/* Post body */}
                          <p className={styles.postText}>{displayPost.body}</p>

                          {mediaUrl && (
                            <img
                              src={mediaUrl}
                              alt="Post media"
                              className={styles.postImage}
                            />
                          )}

                          {/* Action bar */}
                          <div className={styles.actions}>
                            <button
                              type="button"
                              onClick={() => handleLikePost(post._id)}
                              disabled={likingPostId === post._id}
                            >
                              {likingPostId === post._id
                                ? "…"
                                : hasLiked
                                  ? `👍 Liked · ${post.likes || 0}`
                                  : `👍 Like · ${post.likes || 0}`}
                            </button>

                            <button type="button" onClick={() => toggleComments(post._id)}>
                              {openComments[post._id]
                                ? `💬 Hide${commentCount ? ` · ${commentCount}` : ""}`
                                : `💬 Comment${commentCount ? ` · ${commentCount}` : ""}`}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSharePost(post._id)}
                              disabled={sharingPostId === post._id}
                            >
                              {sharingPostId === post._id ? "…" : "↗ Repost"}
                            </button>

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeletePost(post._id)}
                                className={styles.deleteButton}
                                disabled={deletingPostId === post._id}
                              >
                                {deletingPostId === post._id ? "Deleting…" : "🗑 Delete"}
                              </button>
                            )}
                          </div>

                          {/* Comments */}
                          {openComments[post._id] && (
                            <div className={styles.commentSection}>
                              <div className={styles.commentComposer}>
                                <img
                                  src={profilePicSrc}
                                  alt="You"
                                  className={styles.commentComposerAvatar}
                                />
                                <input
                                  type="text"
                                  value={commentInputs[post._id] || ""}
                                  onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                                  placeholder="Add a comment…"
                                  className={styles.commentInput}
                                />
                                <button
                                  type="button"
                                  className={styles.commentSendButton}
                                  onClick={() => handleCommentPost(post._id)}
                                  disabled={
                                    commentingPostId === post._id ||
                                    !(commentInputs[post._id] || "").trim()
                                  }
                                >
                                  {commentingPostId === post._id ? "…" : "Post"}
                                </button>
                              </div>

                              {loadingCommentsPostId === post._id ? (
                                <p className={styles.info}>Loading comments…</p>
                              ) : Array.isArray(commentsByPost[post._id]) &&
                                commentsByPost[post._id].length > 0 ? (
                                <div className={styles.commentList}>
                                  {commentsByPost[post._id].map((comment) => (
                                    <div key={comment._id} className={styles.commentItem}>
                                      <img
                                        className={styles.commentAvatar}
                                        src={
                                          comment.userId?.profilePicture
                                            ? `${BASE_URL}/uploads/${encodeURIComponent(comment.userId.profilePicture)}`
                                            : "/default.png"
                                        }
                                        alt="Commenter"
                                      />
                                      <div className={styles.commentBubble}>
                                        <p className={styles.commentName}>
                                          {comment.userId?.name || "User"}
                                        </p>
                                        <p className={styles.commentText}>{comment.body}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className={styles.info}>No comments yet.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className={styles.info}>Profile not found.</p>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
