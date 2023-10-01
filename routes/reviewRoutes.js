import { Router } from 'express';
import controllerReview from '../controllers/reviewController.js'
import authMiddleware from '../middleware/authentication.js'

const router = Router();

router
    .route('/')
    .post(
        authMiddleware.authenticateUser, 
        controllerReview.createReview
    )
    .get(
        controllerReview.getAllReviews
    )


router
    .route('/:id')
    .get(
        controllerReview.getSingleReview
    )
    .patch(
        authMiddleware.authenticateUser, 
        controllerReview.updateReview
    )
    .delete(
        authMiddleware.authenticateUser, 
        controllerReview.deleteReview
    )

export default router