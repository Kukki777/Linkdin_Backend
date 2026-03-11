import { Router } from "express";
import { acceptConnectionRequest, downloadProfile, getAllUserProfile, getMyConnectionsRequest, getUserProfile, getUserProfileAndUserBasedOnUsername, login, register, sendConnectionRequest, updateProfileData, updateUserProfile, uploadprofilePicture, whatAreMyConnection } from "../controllers/user.controller.js";
import multer from "multer";
const router =Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null,file.originalname);
    }
});

const upload = multer({ storage: storage });

router.route('/update_profile_picture').post(upload.single('profile_picture'),uploadprofilePicture);

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/user_update').post(updateUserProfile);
router.post('/get_user_and_profile', getUserProfile);
router.route('/update_profile_data').post(updateProfileData);


// router.route('/get_user_and_profile').get(getUserProfile);
router.route('/user/get_all_users').get(getAllUserProfile);
router.route('/user/download_resume').get(downloadProfile);
router.route('/user/send_connection_request').post(sendConnectionRequest);
router.route('/user/get_connection_request').post(getMyConnectionsRequest);
router.route('/user/user_connection_request').post(whatAreMyConnection);
router.route('/user/accept_connection_request').post(acceptConnectionRequest);
router.route('/user/getConnectionRequests').get(getMyConnectionsRequest);
router.route('/getConnectionRequests').get(getMyConnectionsRequest);
router.route('/user/getMyConnectionRequests').get(whatAreMyConnection);
router.route('/getMyConnectionRequests').get(whatAreMyConnection);
router.route('/user/get_profile_based_on_username').get(getUserProfileAndUserBasedOnUsername);
router
  .route('/user/get_profile_based_on_username/:username')
  .get(getUserProfileAndUserBasedOnUsername);
router
  .route('/user/get_profile_based_on_username=:username')
  .get(getUserProfileAndUserBasedOnUsername);
export default router;
