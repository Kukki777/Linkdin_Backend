"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setTokenIsThere } from "../../config/redux/reducer/authReducer";
import { createPost, getAllPosts } from "../../config/redux/action/postAction";
import { getAboutUser, getAllUsers } from "../../config/redux/action/authAction";

import UserLayout from "../user/page";
import DashboardLayout from "../dashboardLayout/page";
import styles from "./page.module.css";
import { BASE_URL } from "../../config";

export default function Dashboard() {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const [PostContent, setPostContent] = useState("");
  const [FileContent, setFileContent] = useState(null);

  // ✅ 1️⃣ Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(setTokenIsThere());
    }
  }, [dispatch]);

  // ✅ 2️⃣ Fetch posts + user when token exists
  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser(localStorage.getItem("token")));
    }
  }, [authState.isTokenThere, dispatch]);

  // ✅ 3️⃣ Fetch all users
  useEffect(() => {
    if (authState.isTokenThere && !authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere, authState.all_profiles_fetched, dispatch]);

  // ✅ 4️⃣ Upload handler
  const handleUpload = async () => {
    await dispatch(createPost({ file: FileContent, body: PostContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(getAllPosts()); // refresh posts
  };

console.log("Redux Post State:", postState);
console.log("Posts Array:", postState.posts);
  return (
    <UserLayout>
      <DashboardLayout>
        <div className="scrollComponent">

          {/* ✅ CREATE POST SECTION */}
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
              placeholder="What's on your mind?"
            />

            <label htmlFor="fileUpload" className={styles.Fab}>
              +
            </label>

            <input
              onChange={(e) => setFileContent(e.target.files[0])}
              type="file"
              hidden
              id="fileUpload"
            />

            {PostContent.length > 0 && (
              <div onClick={handleUpload} className={styles.uploadButton}>
                Post
              </div>
            )}
          </div>

          {/* ✅ POSTS SECTION */}
          <div className={styles.postContainer}>
            {postState.posts && postState.posts.length > 0 ? (
              postState.posts.map((post) => (
                <div key={post._id} className={styles.post}>
                  <div className={styles.postHeader}>
                    <img
                      className={styles.userProfile}
                      src={
                        post.userId?.profilePicture
                          ? `${BASE_URL}/uploads/${post.userId.profilePicture}`
                          : "/default.png"
                      }
                      alt="User"
                    />
                    <div>
                      <p>{post.userId?.name || "Unknown User"}</p>
                    </div>
                  </div>

                  <div className={styles.postBody}>
                    <p>{post.body}</p>

          
                      {post.media && (
  <img
    className={styles.postImage}
    src={`${BASE_URL}/uploads/${post.media}`}
    alt="Post"
  />
)}
                    
                  </div>
                </div>
              ))
            ) : (
              <p>No posts available</p>
            )}
          </div>

        </div>
      </DashboardLayout>
    </UserLayout>
  );
}