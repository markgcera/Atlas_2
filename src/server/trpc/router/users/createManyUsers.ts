import { protectedProcedure } from '../../trpc'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'
import { sendMultipleEmails } from '../member/helper'
import { db } from '~/server/db/firebase'
import logCollection from '~/server/db/collections/LogCollection'
import { Timestamp, runTransaction } from 'firebase/firestore'
import userCollection from '~/server/db/collections/UserCollection'

import { adminAuth } from '~/server/db/admin_firebase'

export const createManyUsers = protectedProcedure
  .input(
    z.array(
      z.object({
        department: z.string(),
        name: z.string(),
        nus_email: z.string(),
        role: z.string(),
        student_id: z.string(),
        resume: z
          .string()
          .optional()
          .transform((e) => (e === '' ? undefined : e)),
      }) // resume: to aid in applicants creation through csv upload
    )
  )
  .mutation(async ({ input }) => {
    try {
      return await runTransaction(db, async (transaction) => {
        /// Step 1: Clean the data by filtering until we have the valid users.
        const users = await userCollection.queries()        
        const userIds = new Set(users.map(user => user.id))
        const userEmails = new Set(users.map(user => user.email))
        input = input.filter(user => user.student_id && !userIds.has(user.student_id) && !userEmails.has(user.nus_email))

        /// Step 2: Save the data for all the valid users.
        const emailData = await Promise.all(input.map(async (user) => {
          const password = randomUUID().substring(0, 10)
          const hashedPassword = await hash(password, 10)

          await adminAuth.createUser({
            email: user.nus_email,
            displayName: user.name,
            uid: user.student_id,
            password: hashedPassword
          })

          userCollection
            .withTransaction(transaction)
            .set({
              department: user.department,
              email: user.nus_email,
              name: user.name,
              isAdmin: false,
              id: user.student_id,
              role: user.role,
              resume: user.resume || "",
            }, user.student_id)

          return {
            email: user.nus_email,
            password
          }
        }))

        await sendMultipleEmails(emailData)
        
      })
    } catch (e) {
      await logCollection.add({
        createdAt: Timestamp.fromDate(new Date()),
        level: 'WARNING',
        description: (e as Error).message,
        title: 'Error while uploading multiple users',
      })
    }
  })
