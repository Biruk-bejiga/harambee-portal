import { NextResponse } from 'next/server'

import { getActiveStudent } from '@/lib/active-user'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getActiveStudent()
  if (!user) {
    return NextResponse.json({ error: 'No student available' }, { status: 404 })
  }

  const invoices = await prisma.invoice.findMany({
    where: { studentId: user.id },
    include: {
      term: true,
      payments: true
    },
    orderBy: [{ dueDate: 'desc' }]
  })

  return NextResponse.json({
    invoices: invoices.map((invoice) => {
      const amountDue = invoice.amountDue.toNumber()
      const amountPaid = invoice.amountPaid.toNumber()

      return {
        id: invoice.id,
        number: invoice.number,
        term: {
          id: invoice.termId,
          year: invoice.term.year,
          semester: invoice.term.semester
        },
        amountDue,
        amountPaid,
        balance: amountDue - amountPaid,
        status: invoice.status,
        dueDate: invoice.dueDate,
        payments: invoice.payments.map((payment) => ({
          id: payment.id,
          amount: payment.amount.toNumber(),
          status: payment.status,
          paidAt: payment.paidAt,
          method: payment.method
        }))
      }
    })
  })
}
