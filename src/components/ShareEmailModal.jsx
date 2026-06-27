import { useState } from 'react';
import API from '../services/api';
import jsPDF from 'jspdf';

const generatePDF = (resumeData) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;
    const themeColor = [79, 70, 229];
    const darkText = [30, 41, 59];
    const mutedText = [100, 116, 139];
    const lightText = [71, 85, 105];

    doc.setFontSize(24);
    doc.setTextColor(...themeColor);
    doc.setFont('helvetica', 'bold');
    doc.text(resumeData.profileInfo?.fullName || 'Resume', margin, y);
    y += 9;

    doc.setFontSize(12);
    doc.setTextColor(...lightText);
    doc.setFont('helvetica', 'normal');
    doc.text(resumeData.profileInfo?.designation || '', margin, y);
    y += 7;

    const contacts = [];
    if (resumeData.contactInfo?.email) contacts.push('Email: ' + resumeData.contactInfo.email);
    if (resumeData.contactInfo?.phone) contacts.push('Phone: ' + resumeData.contactInfo.phone);
    if (resumeData.contactInfo?.github) contacts.push('GitHub: ' + resumeData.contactInfo.github);
    if (resumeData.contactInfo?.linkedIn) contacts.push('LinkedIn: ' + resumeData.contactInfo.linkedIn);
    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    doc.setFont('helvetica', 'normal');
    const contactLines = doc.splitTextToSize(contacts.join('   |   '), contentWidth);
    doc.text(contactLines, margin, y);
    y += contactLines.length * 4 + 3;

    doc.setDrawColor(...themeColor);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    if (resumeData.profileInfo?.summary) {
        doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
        doc.text('PROFESSIONAL SUMMARY', margin, y);
        doc.setDrawColor(...themeColor); doc.setLineWidth(0.5);
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 8;
        doc.setFontSize(9); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
        const sl = doc.splitTextToSize(resumeData.profileInfo.summary, contentWidth);
        doc.text(sl, margin, y);
        y += sl.length * 4 + 8;
    }

    const leftColX = margin;
    const leftColW = 118;
    const rightColX = margin + leftColW + 6;
    const rightColW = contentWidth - leftColW - 6;
    let leftY = y;
    let rightY = y;

    if (resumeData.projects?.length > 0) {
        doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
        doc.text('PROJECTS', leftColX, leftY);
        doc.setDrawColor(...themeColor); doc.setLineWidth(0.5);
        doc.line(leftColX, leftY + 2, leftColX + leftColW, leftY + 2);
        leftY += 8;
        resumeData.projects.forEach((p) => {
            if (leftY > 270) { doc.addPage(); leftY = 20; }
            doc.setFontSize(10); doc.setTextColor(...darkText); doc.setFont('helvetica', 'bold');
            doc.text(p.title || '', leftColX, leftY); leftY += 5;
            if (p.technologies) {
                doc.setFontSize(8); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
                doc.text(p.technologies, leftColX, leftY); leftY += 4;
            }
            if (p.description) {
                doc.setFontSize(8.5); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
                const dl = doc.splitTextToSize(p.description, leftColW);
                doc.text(dl, leftColX, leftY); leftY += dl.length * 3.8 + 2;
            }
            leftY += 4;
        });
    }

    if (resumeData.skills?.length > 0) {
        doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
        doc.text('SKILLS', rightColX, rightY);
        doc.setDrawColor(...themeColor); doc.setLineWidth(0.5);
        doc.line(rightColX, rightY + 2, rightColX + rightColW, rightY + 2);
        rightY += 8;
        resumeData.skills.forEach((s) => {
            doc.setFillColor(241, 245, 249);
            doc.roundedRect(rightColX, rightY - 3.5, rightColW, 5.5, 1, 1, 'F');
            doc.setFontSize(8.5); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
            doc.text(s.name || '', rightColX + 2, rightY); rightY += 7;
        });
        rightY += 4;
    }

    if (resumeData.education?.length > 0) {
        doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
        doc.text('EDUCATION', rightColX, rightY);
        doc.setDrawColor(...themeColor); doc.setLineWidth(0.5);
        doc.line(rightColX, rightY + 2, rightColX + rightColW, rightY + 2);
        rightY += 8;
        resumeData.education.forEach((e) => {
            doc.setFontSize(9); doc.setTextColor(...darkText); doc.setFont('helvetica', 'bold');
            doc.text(e.degree || '', rightColX, rightY); rightY += 4.5;
            doc.setFontSize(8); doc.setTextColor(...mutedText); doc.setFont('helvetica', 'normal');
            doc.text(e.school || '', rightColX, rightY); rightY += 4;
            if (e.duration) {
                doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
                doc.text(e.duration, rightColX, rightY); rightY += 4;
            }
            rightY += 3;
        });
    }

    return doc.output('blob');
};

export default function ShareEmailModal({ resumeId, onClose }) {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [subject, setSubject] = useState('My Resume');
    const [message, setMessage] = useState('Please find my resume attached.');
    const [sending, setSending] = useState(false);

    const handleShare = async () => {
        if (!recipientEmail.trim()) { alert("Please enter recipient email."); return; }
        if (!resumeId) { alert("No resume selected."); return; }
        setSending(true);
        try {
            const resumeRes = await API.get('/resumes/' + resumeId);
            const resumeData = resumeRes.data;
            const pdfBlob = generatePDF(resumeData);
            const formData = new FormData();
            formData.append('recipientEmail', recipientEmail);
            formData.append('subject', subject || 'Resume Application');
            formData.append('message', message || 'Please find my resume attached.');
            formData.append('pdfFile', pdfBlob, 'resume_' + resumeId + '.pdf');
            await API.post('/email/send-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Resume sent successfully to ' + recipientEmail);
            onClose();
        } catch (err) {
            console.error("Email send failed:", err);
            alert("Failed to send resume. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Share Resume</h3>
                <p className="text-xs text-slate-400 mb-4">Send your resume as a PDF attachment.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Recipient Email</label>
                        <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="hr@company.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
                        <textarea rows="2" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 resize-none" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleShare} disabled={sending} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm">{sending ? 'Sending...' : 'Send Resume'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
