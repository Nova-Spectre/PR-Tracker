import { Schema, models, model } from 'mongoose'

const DefaultsSchema = new Schema(
  {
    key: { type: String, unique: true, default: 'global' },
    defaultProject: { type: String },
    defaultService: { type: String },
    defaultEmail: { type: String },
    defaultAuthor: { type: String },
  },
  { timestamps: true }
)

const collectionName = process.env.MONGODB_SETTINGS_COLLECTION || 'settings'
const Defaults = models.Defaults || model('Defaults', DefaultsSchema, collectionName)

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('[model.Defaults] using collection=', collectionName)
}

export default Defaults


