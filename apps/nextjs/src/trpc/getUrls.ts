/* eslint-disable @typescript-eslint/require-await */
"use server";

import { env } from "~/env";

export async function getUserBaseUrl() {
  return env.USER_SERVICE_URL ?? "http://localhost:4000";
}

export async function getAccessBaseUrl() {
  return env.ACCESS_SERVICE_URL ?? "http://localhost:4001";
}

export async function getDoorBaseUrl() {
  return env.DOOR_SERVICE_URL ?? "http://localhost:4002";
}

export async function getLogBaseUrl() {
  return env.LOG_SERVICE_URL ?? "http://localhost:4003";
}

export async function getCardBaseUrl() {
  return env.CARD_SERVICE_URL ?? "http://localhost:4004";
}

export async function getAlarmBaseUrl() {
  return env.ALARM_SERVICE_URL ?? "http://localhost:4006";
}
