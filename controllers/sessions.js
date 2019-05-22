import {sendData, sendError} from '../utils/responseHelper';
import {body, param, validationResult} from 'express-validator/check';
import {credentialsAreValid} from '../models/sessions';
import {getUserByUsername} from "../models/users";
import {makeSession, sessions} from "../utils/sessionUtil"


export async function login(req, res) {
   const errors = validationResult(req);
   const username = req.body.username;
   const password = req.body.password;

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const match = await credentialsAreValid(username, password);

   if (match) {
      let user = await getUserByUsername(username);
      let cookie = makeSession(user, res);

      let session = sessions[cookie];
      res.location(`sessions/${cookie}`);
      sendData(res, session);
   } else {
      sendError(res, 400, "Invalid login")
   }
}


export async function getSession(req,res) {
   sendData(res, "Get session successful.");

}


export async function logout(req,res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   let reqSsn = req.session;
   let logoutSsn = sessions[req.params.cookie];

   if (logoutSsn && (logoutSsn.username === reqSsn.username)) {
      sendData(res, "Logout successful.");
   }
   else {
      sendError(res, 400, "Logout failure.")
   }
}


export const validate = (method) => {
   switch (method) {
      case 'login':
         return [
            body('username')
             .exists().withMessage("is required")
             .isLength({min: 1})
             .withMessage("must be at least 1 character long"),
            body('password')
             .exists().withMessage("is required")
             .isLength({min: 1})
             .withMessage("must be at least 1 character long")
         ];
      case 'getSession':
         return [];
      case 'logout':
         return [
            //param('cookies')
            //.exists().withMessage("is required")
         ];

      default:
         return [];
   }
};
