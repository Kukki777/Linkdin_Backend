import { Router } from "express";
import { activeCheck, commentPost, createPost, delete_comment_of_user, deletePost, get_comment_by_post, getAllPost, getPostsByUsername, increment_likes, sharePost } from "../controllers/post.controller.js";
import multer from "multer";

const router =Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.route('/').get(activeCheck);

router.route('/post').post(upload.single('media'),createPost);
router.route('/posts').get(getAllPost);
router.route('/posts_by_username').get(getPostsByUsername);
router.route('/delete_post').post(deletePost);
router.route('/share_post').post(sharePost);
router.route('/comment').post(commentPost);
router.route('/get_comments').get(get_comment_by_post).post(get_comment_by_post);
router.route('/delete_comment').delete(delete_comment_of_user);
router.route('/increment_post_like').get(increment_likes).post(increment_likes);

export default router;
