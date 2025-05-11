import { z } from 'zod';

const SchemaFullMedicalSupply = z.object({
  id: z.number(),
  school_id: z.string().optional(),
  name: z.string(),  
  date_created: z.string().optional(),
  date_modified: z.string().optional(),
  created_by: z.string().optional(),
  modified_by: z.string().optional(),
  _operation: z.enum(['created', 'edited']).optional(),
}).strict();

export type IMedicalSupply = z.infer<typeof SchemaFullMedicalSupply>;
