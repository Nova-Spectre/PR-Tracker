import { Schema, models, model } from 'mongoose'

const WorkspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['project', 'service'], required: true },
  },
  { timestamps: true }
)

WorkspaceSchema.index({ type: 1, name: 1 }, { unique: true })

const collectionName = process.env.MONGODB_WORKSPACES_COLLECTION || 'workspaces'
const Workspace = models.Workspace || model('Workspace', WorkspaceSchema, collectionName)

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('[model.Workspace] using collection=', collectionName)
}

export default Workspace


