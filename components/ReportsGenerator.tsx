'use client'

import { useState } from 'react'
import { generatePDFReport, generateBlankPDF } from '@/actions/generateReports'
import { Card, CardHeader, CardBody, Button, Divider } from "@nextui-org/react";

export default function ReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async (period: 'week' | 'month' | '6months' | 'year') => {
    setIsGenerating(true)
    try {
      const pdfBuffer = await generatePDFReport(period)
      downloadPDF(pdfBuffer, `${period}_report.pdf`)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('An error occurred while generating the report.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateBlankPDF = async () => {
    setIsGenerating(true)
    try {
      const pdfBuffer = await generateBlankPDF()
      downloadPDF(pdfBuffer, 'blank_entry_form.pdf')
    } catch (error) {
      console.error('Error generating blank PDF:', error)
      alert('An error occurred while generating the blank PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = (pdfBuffer: ArrayBuffer, fileName: string) => {
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Generate Reports</h2>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <Button
      color="primary"
      onClick={() => handleGenerateReport('week')}
      disabled={isGenerating}
      className="h-16 text-lg font-semibold shadow-lg hover:opacity-90"
    >
      Generate Weekly Report
    </Button>
    <Button
      color="primary"
      onClick={() => handleGenerateReport('month')}
      disabled={isGenerating}
      className="h-16 text-lg font-semibold shadow-lg hover:opacity-90"
    >
      Generate Monthly Report
    </Button>
    <Button
      color="primary"
      onClick={() => handleGenerateReport('6months')}
      disabled={isGenerating}
      className="h-16 text-lg font-semibold shadow-lg hover:opacity-90"
    >
      Generate 6-Month Report
    </Button>
    <Button
      color="primary"
      onClick={() => handleGenerateReport('year')}
      disabled={isGenerating}
      className="h-16 text-lg font-semibold shadow-lg hover:opacity-90"
    >
      Generate Yearly Report
    </Button>
  </div>
  <div className="mt-6">
    <Button
      color="secondary"
      onClick={handleGenerateBlankPDF}
      disabled={isGenerating}
      className="w-full h-16 text-lg font-semibold shadow-lg hover:opacity-90"
    >
      Generate Blank Entry Form
    </Button>
  </div>
  </CardBody>
    </Card>
  )
}

