import { z } from 'zod'

export const reportCreateSchema = z.object({
  child_id: z.string().uuid(),
  date: z.string(),
  summary: z.string().min(1),
})

export type ReportCreateInput = z.infer<typeof reportCreateSchema>
