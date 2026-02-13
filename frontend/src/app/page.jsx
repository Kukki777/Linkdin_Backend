"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";
import UserLayout from "./user/page";

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
    <div className={styles.container}>
      <div className={styles.mainContainer}>

        <div className={styles.mainContainer__left}>
          <p>Connect with Friends without exaggeration</p>
          <p>A true social media platform, with stories no bluffs!</p>

          <div
            onClick={() => router.push("/login")}
            className={styles.buttonJoin}
          >
            Join Now
          </div>
        </div>

        <div className={styles.mainContainer__right}>
          <Image
            src="/images/homemain_connection.png"
            alt="Connection Image"
            width={500}
            height={300}
          />
        </div>


      </div>
    </div>
    </UserLayout>
    
  );
}
