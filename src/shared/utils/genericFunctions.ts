import { Schema, Model } from 'mongoose';

export type ApplyIdOptions = {
  removeFields?: string[]; 
};

export function applyIdVirtual(schema: Schema, options?: ApplyIdOptions) {
    try {

          schema.virtual('id').get(function (this: any) {
            return this._id?.toString();
          });

          const removeFields = options?.removeFields ?? [];

          const transform = (_doc: any, ret: any) => {
            ret.id = ret._id?.toString();
            delete ret._id;
            delete ret.__v;
            for (const f of removeFields) {
              if (Object.prototype.hasOwnProperty.call(ret, f)) delete ret[f];
            }
            return ret;
          };

          schema.set('toJSON', { virtuals: true, versionKey: false, transform });
          schema.set('toObject', { virtuals: true, versionKey: false, transform });
    } 
    catch (err) {
        console.error('applyIdVirtual error:', err && (err as Error).message ? (err as Error).message : err);
    }
}


export function roundUptoDecimalPlaces(number){
  try{
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }
  catch(err){
    throw err;
  }
}