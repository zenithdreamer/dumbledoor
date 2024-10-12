import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

//import { prisma } from "@dumbledoor/access-db";
import { prisma } from "@dumbledoor/door-db";

import {
  accessClient,
  cardClient,
  mqttClient,
  protectedProcedure,
} from "../trpc";

export const scannerRouter = {
  requestLock: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        doorId: z.string(),
      }),
    )
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

      // If the user has personal access that meets the door's requirement
      if (personalAccessLevel >= doorAccessLevel) {
        await mqttClient.internal.unlockDoor.mutate({
          doorId: input.doorId,
        });
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
          return false; // Access denied
        }

        if (roleDoor.granted_access_level >= doorAccessLevel) {
          await mqttClient.internal.unlockDoor.mutate({
            doorId: "1234",
          });
          return true; // Access granted based on role access
        }
      }

      return false; // Access denied
    }),
} satisfies TRPCRouterRecord;
