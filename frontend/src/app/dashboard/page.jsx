"use client";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import {
  resetTokenIsNotThere,
  setTokenIsThere,
} from "../../config/redux/reducer/authReducer";
import {
  commentPost,
  createPost,
  deletePost,
  getCommentsByPost,
  getAllPosts,
  likePost,
  sharePost,
} from "../../config/redux/action/postAction";
import {
  getAboutUser,
  getAllUsers,
} from "../../config/redux/action/authAction";

import UserLayout from "../user/page";
import DashboardLayout from "../dashboardLayout/page";
import styles from "./page.module.css";
import { BASE_URL } from "../../config";

export default function Dashboard() {
  const dispatch = useDispatch();
  const router = useRouter();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const [PostContent, setPostContent] = useState("");
  const [FileContent, setFileContent] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState("");
  const [likingPostId, setLikingPostId] = useState("");
  const [commentingPostId, setCommentingPostId] = useState("");
  const [sharingPostId, setSharingPostId] = useState("");
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState("");
  const [openComments, setOpenComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const fetchedCommentsForPostsRef = useRef(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(setTokenIsThere());
    }
  }, [dispatch]);

  useEffect(() => {
    if (authState.isTokenThere) {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(resetTokenIsNotThere());
        router.push("/login");
        return;
      }

      dispatch(getAllPosts());
      dispatch(getAboutUser(token))
        .unwrap()
        .catch(() => {
          localStorage.removeItem("token");
          dispatch(resetTokenIsNotThere());
          router.push("/login");
        });
    }
  }, [authState.isTokenThere, dispatch, router]);

  useEffect(() => {
    if (authState.isTokenThere && !authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere, authState.all_profiles_fetched, dispatch]);

  useEffect(() => {
    const posts = Array.isArray(postState.posts) ? postState.posts : [];
    if (posts.length === 0) return;

    posts.forEach((post) => {
      if (!post?._id) return;
      if (fetchedCommentsForPostsRef.current.has(post._id)) return;

      fetchedCommentsForPostsRef.current.add(post._id);
      dispatch(getCommentsByPost(post._id))
        .unwrap()
        .then((response) => {
          setCommentsByPost((prev) => ({
            ...prev,
            [post._id]: response.comments || [],
          }));
        })
        .catch(() => {
          setCommentsByPost((prev) => ({
            ...prev,
            [post._id]: [],
          }));
        });
    });
  }, [postState.posts, dispatch]);

  const handleUpload = async () => {
    try {
      await dispatch(createPost({ file: FileContent, body: PostContent })).unwrap();
      setPostContent("");
      setFileContent(null);
      dispatch(getAllPosts());
    } catch (error) {
      alert(error || "Unable to create post");
      if (String(error).toLowerCase().includes("user not found")) {
        localStorage.removeItem("token");
        dispatch(resetTokenIsNotThere());
        router.push("/login");
      }
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setDeletingPostId(postId);
      await dispatch(deletePost(postId)).unwrap();
      dispatch(getAllPosts());
    } catch (error) {
      alert(error || "Unable to delete post");
      if (String(error).toLowerCase().includes("user not found")) {
        localStorage.removeItem("token");
        dispatch(resetTokenIsNotThere());
        router.push("/login");
      }
    } finally {
      setDeletingPostId("");
    }
  };

  const handleLikePost = async (postId) => {
    try {
      setLikingPostId(postId);
      await dispatch(likePost(postId)).unwrap();
    } catch (error) {
      alert(error || "Unable to like post");
    } finally {
      setLikingPostId("");
    }
  };

  const fetchComments = async (postId) => {
    try {
      setLoadingCommentsPostId(postId);
      const response = await dispatch(getCommentsByPost(postId)).unwrap();
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: response.comments || [],
      }));
    } catch (error) {
      alert(error || "Unable to fetch comments");
    } finally {
      setLoadingCommentsPostId("");
    }
  };

  const toggleComments = async (postId) => {
    const isCurrentlyOpen = Boolean(openComments[postId]);
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !isCurrentlyOpen,
    }));

    if (!isCurrentlyOpen && !commentsByPost[postId]) {
      await fetchComments(postId);
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleCommentPost = async (postId) => {
    const commentText = commentInputs[postId] || "";
    if (!commentText.trim()) return;

    try {
      setCommentingPostId(postId);
      await dispatch(
        commentPost({ post_id: postId, commentBody: commentText })
      ).unwrap();
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));
      await fetchComments(postId);
      setOpenComments((prev) => ({
        ...prev,
        [postId]: true,
      }));
    } catch (error) {
      alert(error || "Unable to add comment");
    } finally {
      setCommentingPostId("");
    }
  };

  const normalizeId = (idValue) => {
    if (!idValue) return "";
    if (typeof idValue === "string") return idValue;
    if (typeof idValue === "object" && idValue._id) return String(idValue._id);
    return String(idValue);
  };

  const myUserId = normalizeId(authState.user?.userId?._id || authState.user?._id);

  const handleSharePost = async (post) => {
    try {
      setSharingPostId(post._id);
      await dispatch(sharePost(post._id)).unwrap();
    } catch (error) {
      alert(error || "Unable to share post");
    } finally {
      setSharingPostId("");
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.wrapper}>
          <div className={styles.scrollComponent}>
            <div className={styles.createPostContainer}>
              <img
                className={styles.userProfile}
                src={
                  authState.user?.userId?.profilePicture
                    ? `${BASE_URL}/uploads/${authState.user.userId.profilePicture}`
                    : "/default.png"
                }
                alt="User"
              />

              <textarea
                onChange={(e) => setPostContent(e.target.value)}
                value={PostContent}
                className={styles.textarea}
                placeholder="Start a post..."
              />

              <label htmlFor="fileUpload" className={styles.Fab}>
                +
              </label>

              <input
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFileContent(file);
                }}
                type="file"
                hidden
                id="fileUpload"
              />

              {(PostContent.length > 0 || FileContent) && (
                <div onClick={handleUpload} className={styles.uploadButton}>
                  Post
                </div>
              )}
            </div>

            <div className={styles.postContainer}>
              {postState.posts?.map((post) => {
                const postOwnerId = normalizeId(post.userId?._id || post.userId);
                const canDelete = Boolean(myUserId) && myUserId === postOwnerId;
                const postLikeCount = typeof post.likes === "number" ? post.likes : 0;
                const likedByList = Array.isArray(post.likedBy) ? post.likedBy : [];
                const hasLiked = likedByList.some(
                  (likedUserId) => normalizeId(likedUserId) === myUserId
                );
                const currentComments = commentsByPost[post._id] || [];
                const fallbackCount = Array.isArray(post.comments) ? post.comments.length : 0;
                const commentCount = currentComments.length || fallbackCount;
                const displayPost = post.isShared && post.sharedPostId ? post.sharedPostId : post;
                return (
                  <div key={post._id} className={styles.singleCard}>
                  <div className={styles.singleCard__profileContainer}>
                    <img
                      className={styles.userProfile}
                      src={
                        post.userId?.profilePicture
                          ? `${BASE_URL}/uploads/${post.userId.profilePicture}`
                          : "/default.png"
                      }
                      alt="User"
                    />
                    <div className={styles.userInfo}>
                      <p className={styles.username}>
                        {post.userId?.name || "Unknown User"}
                      </p>
                      <p className={styles.handle}>
                        @{post.userId?.username || "unknown"}
                      </p>
                    </div>
                  </div>

                  {post.isShared && post.sharedPostId && (
                    <p className={styles.sharedLabel}>Reposted</p>
                  )}

                  <div className={styles.postBody}>
                    {!post.isShared && <p>{post.body}</p>}

                    {post.isShared && post.sharedPostId && (
                      <div className={styles.sharedCard}>
                        <div className={styles.sharedHeader}>
                          <span className={styles.sharedAuthor}>
                            {displayPost.userId?.name || "Unknown User"}
                          </span>
                          <span className={styles.sharedHandle}>
                            @{displayPost.userId?.username || "unknown"}
                          </span>
                        </div>
                        <p>{displayPost.body}</p>
                      </div>
                    )}

                    {displayPost.media && (
                      <img
                        className={styles.postImage}
                        src={`${BASE_URL}/uploads/${displayPost.media}`}
                        alt="Post"
                      />
                    )}
                  </div>

                  <div className={styles.actions}>
                   <button
  type="button"
  onClick={() => handleLikePost(post._id)}
  disabled={likingPostId === post._id}
  style={{ display: "flex", alignItems: "center", gap: "6px" }}
>
  {likingPostId === post._id ? (
    "Liking..."
  ) : hasLiked ? (
    <>
      <HeartSolid style={{ width: "20px", height: "20px", color: "red" }} />
      Liked {postLikeCount > 0 && `(${postLikeCount})`}
    </>
  ) : (
    <>
      <HeartOutline style={{ width: "20px", height: "20px" }} />
      Like {postLikeCount > 0 && `(${postLikeCount})`}
    </>
  )}
</button>
                    <button
                      type="button"
                      onClick={() => toggleComments(post._id)}
                    >
                      {openComments[post._id] ? "💬 Hide Comments" : "💬 Comment"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSharePost(post)}
                      disabled={sharingPostId === post._id}
                    >
                      {sharingPostId === post._id ? "Sharing..." : "↗ Repost"}
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDeletePost(post._id)}
                        disabled={deletingPostId === post._id}
                      >
                        {deletingPostId === post._id ? "Deleting..." : "🗑 Delete"}
                      </button>
                    )}
                  </div>

                  {openComments[post._id] && (
                    <div className={styles.commentSection}>
                      <div className={styles.commentComposer}>
                        <input
                          type="text"
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            handleCommentInputChange(post._id, e.target.value)
                          }
                          placeholder="Write a comment..."
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
                          {commentingPostId === post._id ? "Posting..." : "Post"}
                        </button>
                      </div>

                      {loadingCommentsPostId === post._id ? (
                        <p className={styles.commentInfo}>Loading comments...</p>
                      ) : currentComments.length === 0 ? (
                        <p className={styles.commentInfo}>No comments yet.</p>
                      ) : (
                        <div className={styles.commentList}>
                          {currentComments.map((comment) => (
                            <div key={comment._id} className={styles.commentItem}>
                              <img
                                className={styles.commentAvatar}
                                src={
                                  comment.userId?.profilePicture
                                    ? `${BASE_URL}/uploads/${comment.userId.profilePicture}`
                                    : "/default.png"
                                }
                                alt="Comment user"
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
                      )}
                      {commentCount > 0 && (
                        <p className={styles.commentCount}>{commentCount} comments</p>
                      )}
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
