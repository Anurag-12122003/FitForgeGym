import { Router } from 'express';
import type { Request, Response } from 'express';

import {
  upload,
  uploadToCloudinary,
} from '../../config/cloudnary.js';

import {
  authenticate,
  requireRole,
} from '../../middleware/auth.middleware.js';

import { Role } from '../../generated/prisma/client.js';
import { prisma } from '../../config/database.js';

const router = Router();

/**
 * =========================================================
 * ADMIN
 * Upload catalog image/video
 *
 * POST /assets/admin
 * =========================================================
 */
router.post(
  '/admin',
  authenticate,
  requireRole(Role.ADMIN),
  upload.single('file'),

  async (req: Request, res: Response): Promise<void> => {
    try {
      /**
       * -----------------------------------------------------
       * Validate file
       * -----------------------------------------------------
       */
      if (!req.file) {
        res.status(400).json({
          message: 'No file uploaded',
        });
        return;
      }

      /**
       * -----------------------------------------------------
       * Validate resource
       * -----------------------------------------------------
       */
      const resource = req.body.resource;
      const resourceId = req.body.resourceId;

      if (!resource || !resourceId) {
        res.status(400).json({
          message: 'resource and resourceId are required',
        });
        return;
      }

      if (!['exercise', 'food'].includes(resource)) {
        res.status(400).json({
          message: 'Invalid resource. Use exercise or food.',
        });
        return;
      }

      /**
       * -----------------------------------------------------
       * Determine media type
       * -----------------------------------------------------
       */
      const isVideo = req.file.mimetype.startsWith('video/');
      const isImage = req.file.mimetype.startsWith('image/');

      if (!isImage && !isVideo) {
        res.status(400).json({
          message: 'Only image and video files are allowed',
        });
        return;
      }

      /**
       * -----------------------------------------------------
       * Upload to Cloudinary
       * -----------------------------------------------------
       */
      const folder =
        resource === 'exercise'
          ? `catalog/exercises/${resourceId}`
          : `catalog/foods/${resourceId}`;

      const fileUrl = await uploadToCloudinary(
        req.file.buffer,
        folder,
        req.file.mimetype
      );

      /**
       * -----------------------------------------------------
       * Update Database
       * -----------------------------------------------------
       */
      if (resource === 'exercise') {
        const exercise = await prisma.exercise.findUnique({
          where: {
            id: resourceId,
          },
        });

        if (!exercise) {
          res.status(404).json({
            message: 'Exercise not found',
          });
          return;
        }

        const updatedExercise =
          await prisma.exercise.update({
            where: {
              id: resourceId,
            },
            data: isVideo
              ? {
                videoUrl: fileUrl,
              }
              : {
                imageUrl: fileUrl,
              },
          });

        res.status(200).json({
          message: 'Exercise asset uploaded successfully',
          type: isVideo ? 'video' : 'image',
          url: fileUrl,
          exercise: updatedExercise,
        });

        return;
      }

      /**
       * -----------------------------------------------------
       * Food
       * -----------------------------------------------------
       */
      const food = await prisma.food.findUnique({
        where: {
          id: resourceId,
        },
      });

      if (!food) {
        res.status(404).json({
          message: 'Food not found',
        });
        return;
      }

      const updatedFood = await prisma.food.update({
        where: {
          id: resourceId,
        },
        data: {
          imageUrl: fileUrl,
        },
      });

      res.status(200).json({
        message: 'Food image uploaded successfully',
        type: 'image',
        url: fileUrl,
        food: updatedFood,
      });
    } catch (error: any) {
      console.error('Admin asset upload error:', error);

      res.status(500).json({
        message:
          error.message || 'Asset upload failed',
      });
    }
  }
);


/**
 * =========================================================
 * USER
 * Create custom exercise
 *
 * POST /assets/user/exercises
 * =========================================================
 */
router.post(
  '/user/exercises',
  authenticate,
  upload.fields([
    {
      name: 'image',
      maxCount: 1,
    },
    {
      name: 'video',
      maxCount: 1,
    },
  ]),

  async (req: Request, res: Response): Promise<void> => {
    try {

      if (!req.user) {
        res.status(401).json({
          message: 'Unauthorized',
        });
        return;
      }

      const userId = req.user.id;

      const {
        name,
        description,
        difficulty,
        equipmentId,
        instructions,
        commonMistakes,
        defaultSets,
        repsMin,
        repsMax,
        restSeconds,
        targetWeightKg,
        primaryMuscleId,
        secondaryMuscleIds,
      } = req.body;

      if (!name) {
        res.status(400).json({
          message: 'Exercise name is required',
        });
        return;
      }

      /**
       * -----------------------------------------------------
       * Files
       * -----------------------------------------------------
       */
      const files = req.files as {
        image?: Express.Multer.File[];
        video?: Express.Multer.File[];
      };

      let imageUrl: string | null = null;
      let videoUrl: string | null = null;

      /**
       * -----------------------------------------------------
       * Image upload
       * -----------------------------------------------------
       */
      if (files?.image?.[0]) {
        const image = files.image[0];

        if (!image.mimetype.startsWith('image/')) {
          res.status(400).json({
            message: 'Invalid image file',
          });
          return;
        }

        imageUrl = await uploadToCloudinary(
          image.buffer,
          `users/${userId}/exercises`,
          image.mimetype
        );
      }

      /**
       * -----------------------------------------------------
       * Video upload
       * -----------------------------------------------------
       */
      if (files?.video?.[0]) {
        const video = files.video[0];

        if (!video.mimetype.startsWith('video/')) {
          res.status(400).json({
            message: 'Invalid video file',
          });
          return;
        }

        videoUrl = await uploadToCloudinary(
          video.buffer,
          `users/${userId}/exercises`,
          video.mimetype
        );
      }


      const slugBase = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const slug = `${slugBase}-${Date.now()}`;

      const exercise = await prisma.exercise.create({
        data: {
          name,
          slug,
          description: description || null,

          difficulty: difficulty || 'BEGINNER',

          // ✅ Fix 1: equipment ko connect karne ka sahi tarika
          ...(equipmentId
            ? {
              equipment: {
                connect: { id: equipmentId },
              },
            }
            : {}),

          imageUrl,
          videoUrl,
          // ✅ Muscles relation connection
          muscles: {
            create: [
              ...(primaryMuscleId
                ? [{ muscleId: primaryMuscleId, role: 'PRIMARY' as const }]
                : []),
              ...(secondaryMuscleIds
                ? (typeof secondaryMuscleIds === 'string'
                  ? JSON.parse(secondaryMuscleIds)
                  : secondaryMuscleIds
                ).map((id: string) => ({
                  muscleId: id,
                  role: 'SECONDARY' as const,
                }))
                : []),
            ],
          },

          instructions: instructions
            ? JSON.parse(instructions)
            : null,

          commonMistakes: commonMistakes
            ? JSON.parse(commonMistakes)
            : null,

          defaultSets: defaultSets
            ? Number(defaultSets)
            : 3,

          repsMin: repsMin
            ? Number(repsMin)
            : 8,

          repsMax: repsMax
            ? Number(repsMax)
            : 12,

          restSeconds: restSeconds
            ? Number(restSeconds)
            : 90,
          // targetWeightKg: Number(targetWeightKg),

          userId: userId,

          // isPublic: false,
        },
      });

      res.status(201).json({
        message: 'Custom exercise created successfully',
        exercise,
      });
    } catch (error: any) {
      console.error('User exercise creation error:', error);

      res.status(500).json({
        message:
          error.message || 'Failed to create custom exercise',
      });
    }
  }
);


export default router;
