"use client";

import React from "react";
import { useRouter } from "next/navigation"; // ✅ Import
import styles from "./styles.module.css";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "../../config/redux/reducer/authReducer";

export default function NavbarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const profileUsername = authState.user?.userId?.username || authState.user?.username || "";

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <h1
          style={{ cursor: "pointer" }}
          onClick={() => {
            router.push("/");
          }}
        >
          Pro Connect
        </h1>

        <div className={styles.navBarOptionContainer}>
          {authState.profileFetched && (
            <div>
              <div style={{ display: "flex" }}>
                <p>Hey, {authState.user.userId.name}</p>
                <p
                  onClick={() => {
                    if (!profileUsername) return;
                    router.push(
                      `/viewProfile?username=${encodeURIComponent(profileUsername)}`,
                    );
                  }}
                  style={{ fontWeight: "bold", cursor: "pointer", paddingInline: "0.5rem" }}
                >
                  Profile
                </p>
                <p
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/login");
                    dispatch(reset());
                  }}
                  style={{ fontWeight: "bold", cursor: "pointer", paddingInline: "0.5rem" }}
                >
                  Logout
                </p>
              </div>
            </div>
          )}
          {!authState.profileFetched && <div
            onClick={() => {
              router.push("/login");
            }}
            className={styles.buttonJoin}
          >
            <p>Be a part</p>
          </div>}
        </div>

      </nav>
    </div>
  );
}
