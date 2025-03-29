import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const OfferLetter = () => {
  const [signatureName, setSignatureName] = useState('');
  const [signatureDate, setSignatureDate] = useState('');
  const [isOfferSigned, setIsOfferSigned] = useState(false);
  const [signatureDataURL, setSignatureDataURL] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const signatureRef = useRef(null);
  const offerLetterRef = useRef(null);
  
  const clearSignature = () => {
    signatureRef.current?.clear();
    setSignatureDataURL(null);
  };
  
  const handleSignOffer = () => {
    if (signatureName && signatureDate && signatureRef.current?.isEmpty() === false) {
      // Convert the signature to a data URL and store it
      const signatureImage = signatureRef.current.toDataURL('image/png');
      setSignatureDataURL(signatureImage);
      setIsOfferSigned(true);
      alert('Offer accepted! Thank you for your acceptance.');
    } else {
      alert('Please complete all signature fields before signing.');
    }
  };
  
  // Simplified PDF generation that uses a more direct approach
  const downloadPDF = async () => {
    if (!offerLetterRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // If the signature isn't captured yet but there's something in the canvas,
      // let's capture it for the PDF download
      if (!signatureDataURL && signatureRef.current && !signatureRef.current.isEmpty()) {
        const tempSignature = signatureRef.current.toDataURL('image/png');
        setSignatureDataURL(tempSignature);
        
        // Small delay to ensure the state update takes effect
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Create a clone of the offer letter to prevent modifications to the UI
      const offerLetterClone = offerLetterRef.current.cloneNode(true);
      offerLetterClone.style.width = '800px'; // Fixed width for better rendering
      offerLetterClone.style.position = 'absolute';
      offerLetterClone.style.left = '-9999px';
      offerLetterClone.style.top = '-9999px';
      document.body.appendChild(offerLetterClone);
      
      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: document.documentElement.offsetHeight,
      };
      
      const canvas = await html2canvas(offerLetterClone, options);
      document.body.removeChild(offerLetterClone);
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Use a fixed A4 format with proper dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = pdfWidth / ratio;
      
      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Add additional pages if needed
      let heightLeft = imgHeight - pdfHeight;
      let position = -pdfHeight; // Start position for the next pages
      
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        position -= pdfHeight;
      }
      
      // Force download
      pdf.save('offer-letter.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Enhanced PDF generation with more detailed content
  const downloadSimplePDF = () => {
    try {
      // Create a new PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font for the whole document
      pdf.setFont("helvetica");
      
      // Add company header
      pdf.setFillColor(25, 118, 210); // blue-700 equivalent
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('Offer of Employment', 15, 20);
      pdf.setFontSize(12);
      pdf.text('We are delighted to welcome you to our team!', 15, 28);
      
      // Reset text color for main content
      pdf.setTextColor(0, 0, 0);
      
      let yPos = 40; // Starting Y position for content
      const lineHeight = 7; // Standard line height
      const margin = 15; // Left margin
      const pageWidth = 210 - (margin * 2); // Available width for text
      
      // Section: Job Details
      yPos += 5;
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text('Job Details', margin, yPos);
      yPos += lineHeight;
      
      // Add horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, 210 - margin, yPos);
      yPos += lineHeight;
      
      // Position Information
      pdf.setFontSize(14);
      pdf.text('Position Information', margin, yPos);
      yPos += lineHeight;
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const positionInfo = [
        { label: 'Title:', value: 'Senior Software Engineer' },
        { label: 'Department:', value: 'Engineering' },
        { label: 'Reporting to:', value: 'Engineering Manager' }
      ];
      
      positionInfo.forEach(item => {
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label, margin, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.text(item.value, margin + 25, yPos);
        yPos += lineHeight - 1;
      });
      
      yPos += 3;
      
      // Start Date & Location
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text('Start Date & Location', margin, yPos);
      yPos += lineHeight;
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const locationInfo = [
        { label: 'Start Date:', value: 'September 1, 2023' },
        { label: 'Work Location:', value: 'San Francisco, CA' },
        { label: 'Work Arrangement:', value: 'Hybrid (3 days in office)' }
      ];
      
      locationInfo.forEach(item => {
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label, margin, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.text(item.value, margin + 35, yPos);
        yPos += lineHeight - 1;
      });
      
      yPos += 10;
      
      // Section: Compensation & Benefits
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text('Compensation & Benefits', margin, yPos);
      yPos += lineHeight;
      
      // Add horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, 210 - margin, yPos);
      yPos += lineHeight;
      
      // Compensation subsection
      pdf.setFontSize(14);
      pdf.text('Compensation', margin, yPos);
      yPos += lineHeight;
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const compensationInfo = [
        { label: 'Base Salary:', value: '$150,000 per year' },
        { label: 'Performance Bonus:', value: 'Up to 15% of base salary' },
        { label: 'Stock Options:', value: '10,000 shares vesting over 4 years with a 1-year cliff' }
      ];
      
      compensationInfo.forEach(item => {
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label, margin, yPos);
        pdf.setFont("helvetica", "normal");
        const textWidth = pdf.getStringUnitWidth(item.label) * 11 / pdf.internal.scaleFactor;
        pdf.text(item.value, margin + textWidth + 2, yPos);
        yPos += lineHeight;
      });
      
      yPos += 3;
      
      // Benefits subsection
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text('Benefits', margin, yPos);
      yPos += lineHeight;
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const benefitsInfo = [
        { label: 'Health Insurance:', value: 'Comprehensive medical, dental, and vision coverage' },
        { label: 'PTO Policy:', value: '20 days of paid time off per year plus company holidays' },
        { label: '401(k):', value: '4% company match with immediate vesting' }
      ];
      
      benefitsInfo.forEach(item => {
        pdf.setFont("helvetica", "bold");
        const textY = yPos;
        pdf.text(item.label, margin, textY);
        
        // Get width of the label to position the value
        const textWidth = pdf.getStringUnitWidth(item.label) * 11 / pdf.internal.scaleFactor;
        
        pdf.setFont("helvetica", "normal");
        // Handle possible text wrapping for longer content
        const splitText = pdf.splitTextToSize(item.value, pageWidth - textWidth - 5);
        pdf.text(splitText, margin + textWidth + 2, textY);
        
        // Adjust Y position based on number of lines in wrapped text
        yPos += (splitText.length * (lineHeight - 1.5)) + 1.5;
      });
      
      yPos += 5;
      
      // Additional Benefits
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text('Additional Benefits', margin, yPos);
      yPos += lineHeight;
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const additionalBenefits = [
        'Professional development budget of $2,000 annually',
        'Flexible work hours',
        'Home office stipend of $1,000',
        'Wellness program including gym membership reimbursement'
      ];
      
      // Add bullet points for additional benefits
      additionalBenefits.forEach((benefit, index) => {
        pdf.text('• ' + benefit, margin + 5, yPos);
        yPos += lineHeight - 1;
      });
      
      yPos += 10;
      
      // Check if we need to add a new page for the disclaimer and signature
      if (yPos > 230) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Section: Important Information (Disclaimer)
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text('Important Information', margin, yPos);
      yPos += lineHeight;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const disclaimer = 
        'This offer is contingent upon the successful completion of a background check, reference verification, ' +
        'and proof of your eligibility to work in the United States. This document does not constitute an employment ' +
        'contract, and your employment with the company will be at-will, meaning either you or the company may ' +
        'terminate the employment relationship at any time with or without cause or notice.';
      
      const splitDisclaimer = pdf.splitTextToSize(disclaimer, pageWidth);
      pdf.text(splitDisclaimer, margin, yPos);
      yPos += splitDisclaimer.length * (lineHeight - 1.5);
      
      yPos += 15;
      
      // Section: Signature
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text('Accept Your Offer', margin, yPos);
      yPos += lineHeight;
      
      // Check if we need to add a new page for the signature
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Add signature image if available
      if (signatureDataURL) {
        yPos += 5;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text('Signature:', margin, yPos);
        yPos += lineHeight;
        
        // Add the signature image
        try {
          pdf.addImage(signatureDataURL, 'PNG', margin, yPos, 60, 30);
          yPos += 35;
        } catch (err) {
          console.error("Error adding signature to PDF:", err);
          pdf.text('[Signature could not be displayed]', margin, yPos);
          yPos += lineHeight;
        }
      }
      
      // Add name
      yPos += 5;
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text('Full Name:', margin, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(signatureName || '[Not provided]', margin + 25, yPos);
      yPos += lineHeight + 2;
      
      // Add date
      pdf.setFont("helvetica", "bold");
      pdf.text('Date:', margin, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(signatureDate || '[Not provided]', margin + 25, yPos);
      
      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          'If you have any questions regarding this offer letter, please contact HR at hr@company.com',
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pdf.internal.pageSize.getWidth() - 20,
          pdf.internal.pageSize.getHeight() - 10
        );
      }
      
      // Save the PDF
      pdf.save('offer-letter-detailed.pdf');
      
    } catch (error) {
      console.error('Error generating detailed PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };
  
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[90vw] mx-auto bg-white shadow-lg rounded-lg overflow-hidden" ref={offerLetterRef}>
        {/* Header */}
        <div className="bg-blue-700 p-6">
          <h1 className="text-3xl font-bold text-white">Offer of Employment</h1>
          <p className="text-blue-100 mt-2">We are delighted to welcome you to our team!</p>
        </div>
        
        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Job Details Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700">Position Information</h3>
                <div className="mt-3 space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Title:</span> Senior Software Engineer
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Department:</span> Engineering
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Reporting to:</span> Engineering Manager
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Start Date & Location</h3>
                <div className="mt-3 space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Start Date:</span> September 1, 2023
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Work Location:</span> San Francisco, CA
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Work Arrangement:</span> Hybrid (3 days in office)
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Compensation & Benefits Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Compensation & Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700">Compensation</h3>
                <div className="mt-3 space-y-3">
                  <p className="text-gray-600">
                    <span className="font-medium">Base Salary:</span> $150,000 per year
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Performance Bonus:</span> Up to 15% of base salary, based on individual and company performance
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Stock Options:</span> 10,000 shares vesting over 4 years with a 1-year cliff
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Benefits</h3>
                <div className="mt-3 space-y-3">
                  <p className="text-gray-600">
                    <span className="font-medium">Health Insurance:</span> Comprehensive medical, dental, and vision coverage
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">PTO Policy:</span> 20 days of paid time off per year plus company holidays
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">401(k):</span> 4% company match with immediate vesting
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700">Additional Benefits</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>Professional development budget of $2,000 annually</li>
                <li>Flexible work hours</li>
                <li>Home office stipend of $1,000</li>
                <li>Wellness program including gym membership reimbursement</li>
              </ul>
            </div>
          </section>
          
          {/* Disclaimer Section */}
          <section className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Important Information</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              This offer is contingent upon the successful completion of a background check, reference verification, 
              and proof of your eligibility to work in the United States. This document does not constitute an employment 
              contract, and your employment with the company will be at-will, meaning either you or the company may 
              terminate the employment relationship at any time with or without cause or notice.
            </p>
          </section>
          
          {/* Signature Section */}
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Accept Your Offer
            </h2>
            <p className="text-gray-600 mb-6">
              To accept this offer, please sign and date below. We look forward to having you join our team!
            </p>
            
            <div className="space-y-6">
              {/* Signature Box or Embedded Signature */}
              <div>
                <label htmlFor="signature" className="block text-md font-medium text-gray-700 mb-2">
                  Signature
                </label>
                {!isOfferSigned || !signatureDataURL ? (
                  <div className="border-2 border-gray-300 rounded-md p-2 h-40 bg-white">
                    <SignatureCanvas
                      ref={signatureRef}
                      penColor="black"
                      canvasProps={{
                        className: 'w-full h-full',
                        id: 'signature-canvas'
                      }}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-gray-300 rounded-md p-2 h-40 bg-white flex items-center justify-center">
                    <img 
                      src={signatureDataURL} 
                      alt="Your signature" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                {(!isOfferSigned || !signatureDataURL) && (
                  <button
                    onClick={clearSignature}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear Signature
                  </button>
                )}
              </div>
              
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-md font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isOfferSigned ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {signatureName}
                  </div>
                ) : (
                  <input
                    type="text"
                    id="name"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your full legal name"
                  />
                )}
              </div>
              
              {/* Date Selector */}
              <div>
                <label htmlFor="date" className="block text-md font-medium text-gray-700 mb-2">
                  Date
                </label>
                {isOfferSigned ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {signatureDate}
                  </div>
                ) : (
                  <input
                    type="date"
                    id="date"
                    value={signatureDate}
                    max={today}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSignOffer}
                  disabled={isOfferSigned}
                  className={`px-6 py-3 rounded-md text-white font-medium flex-1 ${
                    isOfferSigned
                      ? 'bg-green-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                  }`}
                >
                  {isOfferSigned ? 'Offer Accepted ✓' : 'Sign & Accept Offer'}
                </button>
                <button
                  onClick={downloadSimplePDF}
                  disabled={isDownloading}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium focus:ring-4 focus:ring-gray-100 flex-1"
                >
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>
              
              {/* Remove the duplicate alternative download button since we're now using the 
                  enhanced version as the primary download method */}
              
            </div>
          </section>
          
          {/* Footer */}
          <footer className="mt-12 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>If you have any questions regarding this offer letter, please contact HR at hr@company.com</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default OfferLetter;
