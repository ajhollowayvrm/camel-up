import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { defineNuxtPlugin } from "nuxt/dist/app/nuxt";

export default defineNuxtPlugin(() => {
  const dynamoDBClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  return {
    provide: {
      dynamoDBClient,
    },
  };
});
