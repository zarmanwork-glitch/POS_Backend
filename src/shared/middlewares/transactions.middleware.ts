import { ClientSession } from 'mongoose';
import { callHTTPException } from '../exceptions';

export const transactionCommit = async (session: ClientSession) => {
  try {
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    callHTTPException(error.message);
  }
};

export const transactionRollback = async (session: ClientSession) => {
  try {
    await session.abortTransaction();
    session.endSession();
  } catch (error) {
    callHTTPException(error.message);
  }
};