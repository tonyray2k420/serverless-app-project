import "source-map-support/register";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { cors } from "middy/middlewares";

import { createTodoItem } from "../../businessLogic/todoItems";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";
import * as middy from "middy";
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";

const logger = createLogger("createTodo");

const createTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Caller event", event);

  const userId = getUserId(event);
  const createTodoRequest = JSON.parse(event.body || "") as CreateTodoRequest;
  const item = await createTodoItem(userId, createTodoRequest);

  logger.info("item was created", { userId, todoId: item.todoId });

  return {
    statusCode: 201,
    body: JSON.stringify({ item }),
  };
};

export const handler = middy(createTodoHandler).use(cors({ credenials: true }));
