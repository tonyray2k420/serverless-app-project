import { createLogger } from "../utils/logger";
import * as AWS from "aws-sdk";

const AWSXRay = require("aws-xray-sdk");
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger("AttachmentsAccess");

export class AttachmentsAccess {
  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: "v4" }),
    private readonly attachmentsBucket = process.env.S3_BUCKET || "",
    private readonly uploadUrlExpiration = parseInt(
      process.env.UPLOAD_URL_EXPIRATION || "0"
    ),
    private readonly downloadUrlExpiration = parseInt(
      process.env.DOWNLOAD_URL_EXPIRATION || "0"
    )
  ) {}

  async fileExists(todoId: string): Promise<boolean> {
    try {
      logger.info("Check if file exists", {
        Bucket: this.attachmentsBucket,
        Key: todoId,
      });
      const head = await this.s3
        .headObject({
          Bucket: this.attachmentsBucket,
          Key: todoId,
        })
        .promise();
      logger.info("object result", { head });
      return true;
    } catch (error) {
      logger.error("object error", { error });
      return false;
    }
  }

  getDownloadUrl(todoId: string) {
    return this.s3.getSignedUrl("getObject", {
      Bucket: this.attachmentsBucket,
      Key: todoId,
      Expires: this.downloadUrlExpiration,
    });
  }

  getUploadUrl(todoId: string) {
    return this.s3.getSignedUrl("putObject", {
      Bucket: this.attachmentsBucket,
      Key: todoId,
      Expires: this.uploadUrlExpiration,
    });
  }
}
