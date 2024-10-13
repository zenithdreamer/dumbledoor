import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@dumbledoor/door-db";

import {
  accessClient,
  alarmClient,
  cardClient,
  internalProcedure,
  mqttClient,
  notiClient,
  userClient,
} from "../trpc";

export const internalRouter = {
  getAllDoors: internalProcedure
    .meta({ openapi: { method: "GET", path: "/doors" } })
    .input(z.void())
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          access_level: z.number(),
          created_by: z.string(),
          created_at: z.date(),
          updated_at: z.date(),
        }),
      ),
    )
    .query(async () => {
      return prisma.door.findMany();
    }),
  getDoor: internalProcedure
    .meta({ openapi: { method: "GET", path: "/door" } })
    .input(z.object({ id: z.string() }))
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        access_level: z.number(),
        created_by: z.string(),
        created_at: z.date(),
        updated_at: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const door = await prisma.door.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!door) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Door not found",
        });
      }

      return door;
    }),
  requestLock: internalProcedure
    .meta({ openapi: { method: "POST", path: "/requestLock" } })
    .input(
      z.object({
        cardId: z.string(),
        doorId: z.string(),
      }),
    )
    .output(z.boolean())
    .mutation(async ({ input }) => {
      const card = await cardClient.internal.getCards.mutate(input.cardId);

      const accessList = await accessClient.internal.getUserAccess.mutate(
        card.user_id,
      );

      const door = await prisma.door.findUnique({
        where: {
          id: input.doorId,
        },
      });

      if (!door) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Door not found for the provided door ID",
        });
      }

      const userAccess = accessList;

      const personalAccessLevel = userAccess.access_level;
      const doorAccessLevel = door.access_level;

      const user = await userClient.internal.getUser.query(card.user_id);

      // If the user has personal access that meets the door's requirement
      if (personalAccessLevel >= doorAccessLevel) {
        await mqttClient.internal.unlockDoor.mutate({
          doorId: input.doorId,
        });

        if (user) {
          await notiClient.internal.sentNotification.mutate({
            notiText: `Door ${door.name} unlocked by card ${card.id} with user ${user.username}`,
          });
        }

        void alarmClient.internal.deactivateAlarms.mutate(door.id);
        return true; // Access granted baased on personal access
      }

      // If person have a role, check if the role has access
      if (userAccess.role) {
        const role_doors = await accessClient.internal.getRoleDoors.mutate(
          userAccess.role.id,
        );

        const roleDoor = role_doors.find(
          (role_door) => role_door.door_id === door.id,
        );

        if (!roleDoor) {
          await notiClient.internal.sentNotification.mutate({
            notiText: `Door ${door.name} failed to unlock by card ${card.id}`,
          });

          void alarmClient.internal.activateAlarms.mutate(door.id);
          return false; // Access denied
        }

        if (roleDoor.granted_access_level >= doorAccessLevel) {
          await mqttClient.internal.unlockDoor.mutate({
            doorId: input.doorId,
          });

          if (user) {
            await notiClient.internal.sentNotification.mutate({
              notiText: `Door ${door.name} unlocked by card ${card.id} with user ${user.username}`,
            });
          }

          void alarmClient.internal.deactivateAlarms.mutate(door.id);
          return true; // Access granted based on role access
        }
      }

      await notiClient.internal.sentNotification.mutate({
        notiText: `Door ${door.name} failed to unlock by card ${card.id}`,
      });

      void alarmClient.internal.activateAlarms.mutate(door.id);

      return false; // Access denied
    }),
} satisfies TRPCRouterRecord;
