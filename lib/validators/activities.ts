import { z } from 'zod'

export const activityCreateSchema = z.object({
  child_id: z.string().uuid(),
  type: z.enum(['meal','nap','mood','photo','note']),
  occurred_at: z.string(),
  details: z.record(z.any()).optional(),
})

export type ActivityCreateInput = z.infer<typeof activityCreateSchema>
