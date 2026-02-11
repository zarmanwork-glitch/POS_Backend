import { Env } from '../config';
const aws = require('aws-sdk');
import { promisify } from 'util';
import { callHTTPException } from '../exceptions';
import { Readable } from 'stream'; 


async function generateUniqueId() {
  const timestamp = Date.now().toString();
  const randomString = Math.random()
    .toString(36)
    .substring(2, 15);
  return timestamp + '_' + randomString;
}

aws.config.update({
    region: Env.AWSRegion,
    accessKeyId: Env.AWSAccessKey,
   secretAccessKey: Env.AWSSecret,
});

const s3 = new aws.S3();

export const deletephoto = async (pictureKey) => {
  const params = {
    Bucket: Env.Bucket,
    Key: pictureKey,
  };

  try {
    const data = await s3
      .deleteObject(params)
      .promise();
    return 'Picture deleted successfully';
  } catch (error) {

  }
};

export const uploadToS3 = async (file) => {
  let response = await upload(file);
  return response.Location;
};

export const uploadRequestMultiple = async (
  files,
) => {
  let uploadedFiles = [];

  for (const filePath of files) {
    let response = await upload(filePath);
    uploadedFiles.push(response.Location);
  }

  return uploadedFiles;
};

async function upload(file) {
  const uniqueID = await generateUniqueId();

  const uploadParams = {
    Bucket: Env.Bucket,
    Key: uniqueID + file.originalname,
    Body: bufferToStream(file.buffer),
    ContentType: file.mimetype,
    //ACL: 'public-read',
  };


  const uploadPromise = promisify(s3.upload).bind(
    s3,
  );

  try {
    const data = await uploadPromise(uploadParams);
    return data;
  } catch (err) {

    callHTTPException(err.message)
  }
}

function bufferToStream(buffer: Buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
