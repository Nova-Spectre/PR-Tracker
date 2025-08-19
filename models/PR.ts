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
    author: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['initial', 'in_review', 'approved', 'merged', 'released'],
      default: 'initial',
    },
    links: [LinkSchema],
  },
  { timestamps: true }
)

const PR = models.PR || model('PR', PRSchema)
export default PR


