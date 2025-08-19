import { Schema, models, model } from 'mongoose'

const LinkSchema = new Schema(
  {
    url: { type: String, required: true },
    label: { type: String },
  },
  { _id: false }
)

const PRSchema = new Schema(
  {
    id: { type: String, index: true, unique: true },
    title: { type: String, required: true },
    project: { type: String, required: true },
    service: { type: String },
    category: { type: String, enum: ['project', 'service'], required: true },
    author: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['initial', 'in_review', 'approved', 'merged', 'released'],
      default: 'initial',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    links: [LinkSchema],
    scheduledDate: { type: String },
    scheduledTime: { type: String },
    emailReminder: { type: Boolean, default: false },
    calendarEvent: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const collectionName = process.env.MONGODB_COLLECTION || 'prs'
const PR = models.PR || model('PR', PRSchema, collectionName)
// Helpful at startup to confirm collection binding
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('[model.PR] using collection=', collectionName)
}
export default PR


