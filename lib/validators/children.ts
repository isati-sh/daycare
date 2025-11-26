import { z } from 'zod'

export const childCreateSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  date_of_birth: z.string(),
  parent_id: z.string().uuid(),
})

export type ChildCreateInput = z.infer<typeof childCreateSchema>
