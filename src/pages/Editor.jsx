import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import UpgradePlan from '../components/UpgradePlan';
import ShareEmailModal from '../components/ShareEmailModal';
import jsPDF from 'jspdf';

export default function Editor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    // UI Global Control States
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [templates, setTemplates] = useState([]); 
    const [activeTemplate, setActiveTemplate] = useState(null); 
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Target DOM container boundary for printing
    const resumePrintAreaRef = useRef(null);

    // Schema mapping identical to your Backend Domain Structures
    const [resumeData, setResumeData] = useState({
        title: '',
        paid: false,
        profileInfo: { fullName: '', designation: '', summary: '', profilePreviewUrl: '' },
        contactInfo: { email: '', phone: '', location: '', linkedIn: '', github: '', website: '' },
        skills: [],
        education: [],
        projects: []
    });

    // Sub-form collectors for single input loops
    const [skillInput, setSkillInput] = useState({ name: '', progress: 90 });
    const [eduInput, setEduInput] = useState({ school: '', degree: '', duration: '', description: '' });
    const [projectInput, setProjectInput] = useState({ title: '', technologies: '', description: '' });

    // Fetch templates from API
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await API.get('/templates');
                setTemplates(response.data || []);
                if (response.data && response.data.length > 0) {
                    setActiveTemplate(response.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch templates", err);
            }
        };
        fetchTemplates();
    }, []);

    // Fetch exact active user resume workspace
    useEffect(() => {
        const fetchWorkspacePayload = async () => {
            try {
                const response = await API.get('/resumes');
                const activeDoc = response.data.find(r => r.id === parseInt(id));
                if (activeDoc) {
                    setResumeData({
                        title: activeDoc.title || '',
                        paid: activeDoc.paid || false,
                        profileInfo: activeDoc.profileInfo || { fullName: '', designation: '', summary: '' },
                        contactInfo: activeDoc.contactInfo || { email: '', phone: '', location: '', linkedIn: '', github: '' },
                        skills: activeDoc.skills || [],
                        education: activeDoc.education || [],
                        projects: activeDoc.projects || []
                    });
                }
            } catch (err) {
                console.error("Payload compilation interrupted.", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspacePayload();
    }, [id]);

    const handleProfileChange = (e) => {
        setResumeData({
            ...resumeData,
            profileInfo: { ...resumeData.profileInfo, [e.target.name]: e.target.value }
        });
    };

    const handleContactChange = (e) => {
        setResumeData({
            ...resumeData,
            contactInfo: { ...resumeData.contactInfo, [e.target.name]: e.target.value }
        });
    };

    const appendSkill = () => {
        if (!skillInput.name.trim()) return;
        setResumeData({ ...resumeData, skills: [...resumeData.skills, skillInput] });
        setSkillInput({ name: '', progress: 90 });
    };

    const appendEducation = () => {
        if (!eduInput.school.trim() || !eduInput.degree.trim()) return;
        setResumeData({ ...resumeData, education: [...resumeData.education, eduInput] });
        setEduInput({ school: '', degree: '', duration: '', description: '' });
    };

    const appendProject = () => {
        if (!projectInput.title.trim()) return;
        setResumeData({ ...resumeData, projects: [...resumeData.projects, projectInput] });
        setProjectInput({ title: '', technologies: '', description: '' });
    };

    const handleTemplateSwitch = (template) => {
        if (template.isLocked) {
            setShowUpgradeModal(true);
            return;
        }
        setActiveTemplate(template.id);
    };

    const synchronizeDatabase = async () => {
        setSaveLoading(true);
        try {
            await API.put(`/resumes/${id}`, resumeData);
            alert("Workspace state saved successfully!");
        } catch (err) {
            alert("Database write lifecycle sync failure.");
        } finally {
            setSaveLoading(false);
        }
    };

    // ============================================================
    // ✅ NEW: Clean PDF generation from resumeData (no oklch)
    // ============================================================
  // ✅ POORA generatePDF function — Editor.jsx mein replace karo
// layoutType aur primaryColor bhi pass karo

const generatePDF = (data, filename, layoutType = 'classic', primaryColorHex = '#4f46e5') => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Hex color to RGB converter
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
            : [79, 70, 229];
    };

    const themeColor = hexToRgb(primaryColorHex);
    const darkText   = [30, 41, 59];
    const mutedText  = [100, 116, 139];
    const lightText  = [71, 85, 105];
    const white      = [255, 255, 255];

    // ─────────────────────────────────────────────
    // LAYOUT 1: CLASSIC
    // ─────────────────────────────────────────────
    if (layoutType === 'classic') {
        let y = 20;

        // Name
        doc.setFontSize(24); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
        doc.text(data.profileInfo?.fullName || 'Resume', margin, y); y += 9;

        // Designation
        doc.setFontSize(11); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
        doc.text(data.profileInfo?.designation || '', margin, y); y += 7;

        // Contact row
        const contacts = [];
        if (data.contactInfo?.email)    contacts.push('Email: ' + data.contactInfo.email);
        if (data.contactInfo?.phone)    contacts.push('Phone: ' + data.contactInfo.phone);
        if (data.contactInfo?.github)   contacts.push('GitHub: ' + data.contactInfo.github);
        if (data.contactInfo?.linkedIn) contacts.push('LinkedIn: ' + data.contactInfo.linkedIn);
        doc.setFontSize(8); doc.setTextColor(...mutedText);
        const cLines = doc.splitTextToSize(contacts.join('  |  '), contentWidth);
        doc.text(cLines, margin, y); y += cLines.length * 4 + 3;

        // Divider
        doc.setDrawColor(...themeColor); doc.setLineWidth(0.8);
        doc.line(margin, y, pageWidth - margin, y); y += 8;

        // Summary
        if (data.profileInfo?.summary) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('PROFESSIONAL SUMMARY', margin, y);
            doc.setLineWidth(0.4); doc.line(margin, y + 2, pageWidth - margin, y + 2); y += 8;
            doc.setFontSize(9); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
            const sl = doc.splitTextToSize(data.profileInfo.summary, contentWidth);
            doc.text(sl, margin, y); y += sl.length * 4 + 8;
        }

        // Two columns
        const leftColW = 118;
        const rightColX = margin + leftColW + 6;
        const rightColW = contentWidth - leftColW - 6;
        let leftY = y; let rightY = y;

        // LEFT: Projects
        if (data.projects?.length > 0) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('PROJECTS', margin, leftY);
            doc.setLineWidth(0.4); doc.line(margin, leftY + 2, margin + leftColW, leftY + 2); leftY += 8;

            data.projects.forEach((p) => {
                if (leftY > 270) { doc.addPage(); leftY = 20; }
                doc.setFontSize(10); doc.setTextColor(...darkText); doc.setFont('helvetica', 'bold');
                doc.text(p.title || '', margin, leftY); leftY += 5;
                if (p.technologies) {
                    doc.setFontSize(8); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
                    doc.text(p.technologies, margin, leftY); leftY += 4;
                }
                if (p.description) {
                    doc.setFontSize(8.5); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
                    const dl = doc.splitTextToSize(p.description, leftColW);
                    doc.text(dl, margin, leftY); leftY += dl.length * 3.8 + 2;
                }
                leftY += 4;
            });
        }

        // RIGHT: Skills
        if (data.skills?.length > 0) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('SKILLS', rightColX, rightY);
            doc.setLineWidth(0.4); doc.line(rightColX, rightY + 2, rightColX + rightColW, rightY + 2); rightY += 8;
            data.skills.forEach((s) => {
                doc.setFillColor(241, 245, 249);
                doc.roundedRect(rightColX, rightY - 3.5, rightColW, 5.5, 1, 1, 'F');
                doc.setFontSize(8.5); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
                doc.text(s.name || '', rightColX + 2, rightY); rightY += 7;
            });
            rightY += 4;
        }

        // RIGHT: Education
        if (data.education?.length > 0) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('EDUCATION', rightColX, rightY);
            doc.setLineWidth(0.4); doc.line(rightColX, rightY + 2, rightColX + rightColW, rightY + 2); rightY += 8;
            data.education.forEach((e) => {
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
    }

    // ─────────────────────────────────────────────
    // LAYOUT 2: PROFESSIONAL (colored header band)
    // ─────────────────────────────────────────────
    else if (layoutType === 'professional') {
        // Colored header band
        doc.setFillColor(...themeColor);
        doc.rect(0, 0, pageWidth, 42, 'F');

        doc.setFontSize(22); doc.setTextColor(...white); doc.setFont('helvetica', 'bold');
        doc.text(data.profileInfo?.fullName || 'Resume', margin, 18);

        doc.setFontSize(11); doc.setTextColor(220, 220, 255); doc.setFont('helvetica', 'normal');
        doc.text(data.profileInfo?.designation || '', margin, 27);

        const contacts = [];
        if (data.contactInfo?.email)    contacts.push(data.contactInfo.email);
        if (data.contactInfo?.phone)    contacts.push(data.contactInfo.phone);
        if (data.contactInfo?.github)   contacts.push(data.contactInfo.github);
        doc.setFontSize(8); doc.setTextColor(200, 200, 255);
        doc.text(contacts.join('   |   '), margin, 36);

        let y = 52;

        // Summary
        if (data.profileInfo?.summary) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('EXECUTIVE SUMMARY', margin, y);
            doc.setDrawColor(...themeColor); doc.setLineWidth(0.4);
            doc.line(margin, y + 2, pageWidth - margin, y + 2); y += 8;

            // Left border line for summary
            doc.setDrawColor(...themeColor); doc.setLineWidth(1.5);
            doc.setFontSize(9); doc.setTextColor(...lightText); doc.setFont('helvetica', 'italic');
            const sl = doc.splitTextToSize(data.profileInfo.summary, contentWidth - 5);
            doc.line(margin, y - 3, margin, y + sl.length * 4);
            doc.text(sl, margin + 4, y); y += sl.length * 4 + 8;
        }

        // Projects in 2 column grid cards
        if (data.projects?.length > 0) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('PROJECTS', margin, y);
            doc.setDrawColor(...themeColor); doc.setLineWidth(0.4);
            doc.line(margin, y + 2, pageWidth - margin, y + 2); y += 8;

            const colW = (contentWidth - 6) / 2;
            let col = 0;
            let rowStartY = y;
            let maxColY = y;

            data.projects.forEach((p) => {
                const xPos = margin + col * (colW + 6);
                let cardY = rowStartY;

                // Card background
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.3);
                doc.roundedRect(xPos, cardY - 2, colW, 28, 2, 2, 'FD');

                doc.setFontSize(9.5); doc.setTextColor(...darkText); doc.setFont('helvetica', 'bold');
                doc.text(p.title || '', xPos + 3, cardY + 5);

                if (p.technologies) {
                    doc.setFontSize(7.5); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
                    doc.text(p.technologies, xPos + 3, cardY + 11);
                }

                if (p.description) {
                    doc.setFontSize(7.5); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
                    const dl = doc.splitTextToSize(p.description, colW - 6);
                    doc.text(dl.slice(0, 2), xPos + 3, cardY + 17);
                }

                col++;
                if (col === 2) {
                    col = 0;
                    rowStartY += 34;
                    maxColY = rowStartY;
                } else {
                    maxColY = Math.max(maxColY, rowStartY + 34);
                }
            });
            y = maxColY + 4;
        }

        // Skills + Education side by side
        const halfW = (contentWidth - 6) / 2;
        let leftY = y; let rightY = y;
        const rightX = margin + halfW + 6;

        if (data.skills?.length > 0) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('SKILLS', margin, leftY);
            doc.setDrawColor(...themeColor); doc.setLineWidth(0.4);
            doc.line(margin, leftY + 2, margin + halfW, leftY + 2); leftY += 8;

            data.skills.forEach((s) => {
                doc.setFillColor(...themeColor);
                doc.roundedRect(margin, leftY - 3.5, halfW, 5.5, 1.5, 1.5, 'F');
                doc.setFontSize(8); doc.setTextColor(...white); doc.setFont('helvetica', 'bold');
                doc.text(s.name || '', margin + 3, leftY); leftY += 8;
            });
        }

        if (data.education?.length > 0) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('EDUCATION', rightX, rightY);
            doc.setDrawColor(...themeColor); doc.setLineWidth(0.4);
            doc.line(rightX, rightY + 2, rightX + halfW, rightY + 2); rightY += 8;

            data.education.forEach((e) => {
                doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
                doc.roundedRect(rightX, rightY - 3, halfW, 18, 1.5, 1.5, 'FD');
                doc.setFontSize(9); doc.setTextColor(...darkText); doc.setFont('helvetica', 'bold');
                doc.text(e.degree || '', rightX + 3, rightY + 3);
                doc.setFontSize(8); doc.setTextColor(...mutedText); doc.setFont('helvetica', 'normal');
                doc.text(e.school || '', rightX + 3, rightY + 8);
                if (e.duration) {
                    doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
                    doc.text(e.duration, rightX + 3, rightY + 13);
                }
                rightY += 22;
            });
        }
    }

    // ─────────────────────────────────────────────
    // LAYOUT 3: MODERN (dark left sidebar)
    // ─────────────────────────────────────────────
    else {
        // Dark left sidebar
        const sidebarW = 65;
        doc.setFillColor(...themeColor);
        doc.rect(0, 0, sidebarW, 297, 'F');

        // Name in sidebar
        doc.setFontSize(13); doc.setTextColor(...white); doc.setFont('helvetica', 'bold');
        const nameLines = doc.splitTextToSize(data.profileInfo?.fullName || 'Resume', sidebarW - 10);
        doc.text(nameLines, 8, 20);

        doc.setFontSize(8); doc.setTextColor(200, 200, 255); doc.setFont('helvetica', 'normal');
        const desigLines = doc.splitTextToSize(data.profileInfo?.designation || '', sidebarW - 10);
        doc.text(desigLines, 8, 20 + nameLines.length * 6 + 3);

        // Divider in sidebar
        doc.setDrawColor(255, 255, 255, 0.3); doc.setLineWidth(0.3);
        doc.line(8, 42, sidebarW - 8, 42);

        // Contact in sidebar
        let sideY = 48;
        doc.setFontSize(7.5); doc.setTextColor(...white); doc.setFont('helvetica', 'bold');
        doc.text('CONTACT', 8, sideY); sideY += 6;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
        if (data.contactInfo?.email) {
            const el = doc.splitTextToSize(data.contactInfo.email, sidebarW - 12);
            doc.text(el, 8, sideY); sideY += el.length * 4 + 2;
        }
        if (data.contactInfo?.phone)    { doc.text(data.contactInfo.phone, 8, sideY); sideY += 6; }
        if (data.contactInfo?.github)   { const gl = doc.splitTextToSize(data.contactInfo.github, sidebarW - 12); doc.text(gl, 8, sideY); sideY += gl.length * 4 + 2; }
        if (data.contactInfo?.linkedIn) { const ll = doc.splitTextToSize(data.contactInfo.linkedIn, sidebarW - 12); doc.text(ll, 8, sideY); sideY += ll.length * 4 + 2; }

        // Skills in sidebar
        sideY += 4;
        doc.setFontSize(7.5); doc.setTextColor(...white); doc.setFont('helvetica', 'bold');
        doc.text('SKILLS', 8, sideY); sideY += 6;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        data.skills?.forEach((s) => {
            doc.setFillColor(255, 255, 255, 0.15);
            doc.setFillColor(255, 255, 255);
            doc.setGState && doc.setGState(doc.GState({ opacity: 0.15 }));
            doc.setTextColor(...white);
            doc.text('• ' + (s.name || ''), 8, sideY); sideY += 6;
        });

        // Education in sidebar
        sideY += 4;
        doc.setFontSize(7.5); doc.setTextColor(...white); doc.setFont('helvetica', 'bold');
        doc.text('EDUCATION', 8, sideY); sideY += 6;
        data.education?.forEach((e) => {
            doc.setFontSize(7.5); doc.setTextColor(...white); doc.setFont('helvetica', 'bold');
            const dl = doc.splitTextToSize(e.degree || '', sidebarW - 12);
            doc.text(dl, 8, sideY); sideY += dl.length * 4 + 1;
            doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 200, 255);
            doc.text(e.school || '', 8, sideY); sideY += 4;
            if (e.duration) { doc.setFontSize(6.5); doc.text(e.duration, 8, sideY); sideY += 5; }
            sideY += 2;
        });

        // RIGHT MAIN CONTENT
        const mainX = sidebarW + 10;
        const mainW = pageWidth - sidebarW - 15;
        let y = 20;

        // Summary
        if (data.profileInfo?.summary) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('PROFILE BRIEF', mainX, y);
            doc.setDrawColor(...themeColor); doc.setLineWidth(0.4);
            doc.line(mainX, y + 2, mainX + mainW, y + 2); y += 8;
            doc.setFontSize(9); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
            const sl = doc.splitTextToSize(data.profileInfo.summary, mainW);
            doc.text(sl, mainX, y); y += sl.length * 4 + 8;
        }

        // Projects
        if (data.projects?.length > 0) {
            doc.setFontSize(9); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
            doc.text('PROJECT PIPELINES', mainX, y);
            doc.setDrawColor(...themeColor); doc.setLineWidth(0.4);
            doc.line(mainX, y + 2, mainX + mainW, y + 2); y += 8;

            data.projects.forEach((p) => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.setFontSize(10); doc.setTextColor(...darkText); doc.setFont('helvetica', 'bold');
                doc.text(p.title || '', mainX, y); y += 5;
                if (p.technologies) {
                    doc.setFontSize(8); doc.setTextColor(...themeColor); doc.setFont('helvetica', 'bold');
                    doc.text(p.technologies, mainX, y); y += 4;
                }
                if (p.description) {
                    doc.setFontSize(8.5); doc.setTextColor(...lightText); doc.setFont('helvetica', 'normal');
                    const dl = doc.splitTextToSize(p.description, mainW);
                    doc.text(dl, mainX, y); y += dl.length * 3.8 + 2;
                }
                y += 5;
            });
        }
    }

    doc.save(filename || 'resume.pdf');
};

    // ✅ NEW: Download PDF from clean HTML
  // Inside Editor.jsx – replace the old handleDownloadPDF with this
// handleDownloadPDF mein ye replace karo
const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
        const filename = `${resumeData.profileInfo?.fullName || 'Resume'}.pdf`;
        const currentTpl = templates.find(t => t.id === activeTemplate);
        const layoutType = currentTpl?.layoutType || 'classic';
        const primaryColor = currentTpl?.primaryColor || '#4f46e5';
        generatePDF(resumeData, filename, layoutType, primaryColor);
    } catch (err) {
        console.error("PDF download failed:", err);
        alert("PDF download failed.");
    } finally {
        setDownloading(false);
    }
};

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Dynamic config checks
    const currentTpl = templates.find(t => t.id === activeTemplate);
    const layoutType = currentTpl?.layoutType || 'classic';
    const primaryThemeColor = currentTpl?.primaryColor || '#4f46e5'; 
    const currentFontFamily = currentTpl?.fontFamily || 'Inter, sans-serif';

    return (
        <div className="h-screen flex flex-col bg-slate-900 font-sans overflow-hidden text-slate-100">
            
            {/* Control Panel Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/dashboard')} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                        &larr; Dashboard
                    </button>
                    <span className="text-slate-700">|</span>
                    <h2 className="text-xs font-bold text-slate-200 tracking-tight truncate max-w-xs">{resumeData.title || 'Untitled Workspace'}</h2>
                </div>

                {/* Templates Selector Hub */}
                <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    {templates.map((tpl) => (
                        <button
                            key={tpl.id}
                            onClick={() => handleTemplateSwitch(tpl)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
                                activeTemplate === tpl.id 
                                ? 'bg-indigo-600 text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <span>{tpl.name}</span>
                            {tpl.isLocked && <span className="text-[10px]">🔒</span>}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
                    >
                        ✉ Share
                    </button>
                    <button
                        onClick={synchronizeDatabase}
                        disabled={saveLoading}
                        className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saveLoading ? 'Saving...' : 'Save Data'}
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                    >
                        {downloading ? 'Downloading...' : '⬇ Download PDF'}
                    </button>
                </div>
            </header>

            {/* Split Grid Body Engine */}
            <div className="flex-grow flex overflow-hidden">
                
                {/* Left Side Form Controls Panel */}
                <div className="w-full lg:w-5/12 h-full bg-slate-950 overflow-y-auto p-6 border-r border-slate-800 space-y-6 pb-24 text-slate-300">
                    
                    {/* Section 1: Identity Management */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Identity Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Full Name</label>
                                <input type="text" name="fullName" value={resumeData.profileInfo.fullName} onChange={handleProfileChange} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 bg-slate-900 text-white" placeholder="Shaikh Aftab" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Designation</label>
                                <input type="text" name="designation" value={resumeData.profileInfo.designation} onChange={handleProfileChange} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 bg-slate-900 text-white" placeholder="Java Backend Developer" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Executive Summary</label>
                                <textarea name="summary" rows="3" value={resumeData.profileInfo.summary} onChange={handleProfileChange} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 bg-slate-900 text-white resize-none" placeholder="Motivated Java Developer proficient in Spring Boot..." />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Communication Infrastructure */}
                    <div className="space-y-3 pt-3 border-t border-slate-900">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Communication Networks</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Email Address</label>
                                <input type="email" name="email" value={resumeData.contactInfo.email} onChange={handleContactChange} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="aftab@example.com" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Contact Phone</label>
                                <input type="text" name="phone" value={resumeData.contactInfo.phone} onChange={handleContactChange} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">GitHub Endpoint</label>
                                <input type="text" name="github" value={resumeData.contactInfo.github} onChange={handleContactChange} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="github.com/aftab" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">LinkedIn URL</label>
                                <input type="text" name="linkedIn" value={resumeData.contactInfo.linkedIn} onChange={handleContactChange} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="linkedin.com/in/aftab" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Technical Capabilities */}
                    <div className="space-y-3 pt-3 border-t border-slate-900">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Skills Core</h4>
                        <div className="flex gap-2">
                            <input type="text" value={skillInput.name} onChange={(e) => setSkillInput({ ...skillInput, name: e.target.value })} className="flex-grow px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="e.g., Spring Boot, Docker, MySQL" />
                            <button onClick={appendSkill} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 rounded-lg font-medium">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {resumeData.skills.map((s, i) => (
                                <span key={i} className="bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-medium px-2 py-0.5 rounded-md">{s.name}</span>
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Academic History */}
                    <div className="space-y-3 pt-3 border-t border-slate-900">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Education Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" value={eduInput.school} onChange={(e) => setEduInput({ ...eduInput, school: e.target.value })} className="px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="Institution / University" />
                            <input type="text" value={eduInput.degree} onChange={(e) => setEduInput({ ...eduInput, degree: e.target.value })} className="px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="B.Tech (CSE)" />
                            <input type="text" value={eduInput.duration} onChange={(e) => setEduInput({ ...eduInput, duration: e.target.value })} className="col-span-2 px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="Duration (e.g., 2023 - 2027)" />
                            <button onClick={appendEducation} className="col-span-2 bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded-lg font-medium">Add Academic Block</button>
                        </div>
                    </div>

                    {/* Section 5: Software Projects */}
                    <div className="space-y-3 pt-3 border-t border-slate-900">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Deployments & Projects</h4>
                        <div className="space-y-2.5">
                            <input type="text" value={projectInput.title} onChange={(e) => setProjectInput({ ...projectInput, title: e.target.value })} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="Project Name" />
                            <input type="text" value={projectInput.technologies} onChange={(e) => setProjectInput({ ...projectInput, technologies: e.target.value })} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white" placeholder="Tech Stack (e.g., Java, Spring Data JPA)" />
                            <textarea rows="2" value={projectInput.description} onChange={(e) => setProjectInput({ ...projectInput, description: e.target.value })} className="w-full px-3 py-2 border border-slate-800 rounded-lg text-xs focus:outline-none bg-slate-900 text-white resize-none" placeholder="Explain the key feature metrics..." />
                            <button onClick={appendProject} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded-lg font-medium">Add Project Instance</button>
                        </div>
                    </div>
                </div>

                {/* Right Side Live Canvas Sandbox View Panel */}
                <div className="hidden lg:flex lg:w-7/12 h-full bg-slate-800 overflow-y-auto p-12 justify-center items-start custom-scrollbar">
                    
                    {/* Real Physical Sized A4 Printable Sheet Container */}
                    <div 
                        ref={resumePrintAreaRef} 
                        id="printable-canvas-a4"
                        className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-10 text-slate-900 select-none flex flex-col justify-between"
                        style={{ fontFamily: currentFontFamily, boxSizing: 'border-box', wordBreak: 'break-word' }}
                    >
                        
                        {/* Dynamic Render Switch Matrix Engine */}
                        {(() => {
                            if (layoutType === 'classic') {
                                return (
                                    <div className="space-y-5 flex-grow">
                                        <div className="border-b pb-4" style={{ borderColor: primaryThemeColor }}>
                                            <h1 className="text-3xl font-bold tracking-tight" style={{ color: primaryThemeColor }}>{resumeData.profileInfo.fullName || 'YOUR FULL NAME'}</h1>
                                            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mt-0.5">{resumeData.profileInfo.designation || 'ENGINEERING DESIGNATION'}</p>
                                            
                                            {/* Communications Loop */}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-500 font-medium">
                                                {resumeData.contactInfo.email && <span>✉ {resumeData.contactInfo.email}</span>}
                                                {resumeData.contactInfo.phone && <span>☎ {resumeData.contactInfo.phone}</span>}
                                                {resumeData.contactInfo.github && <span>📦 {resumeData.contactInfo.github}</span>}
                                                {resumeData.contactInfo.linkedIn && <span>🔗 {resumeData.contactInfo.linkedIn}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryThemeColor }}>Professional Summary</h3>
                                            <p className="text-slate-600 text-[11px] leading-relaxed text-justify">{resumeData.profileInfo.summary || 'Summary description detail array empty.'}</p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 pt-2">
                                            <div className="col-span-2 space-y-4">
                                                <div className="space-y-3">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1 text-slate-800" style={{ borderColor: primaryThemeColor }}>Key Production Deployments</h3>
                                                    {resumeData.projects.map((p, i) => (
                                                        <div key={i} className="space-y-0.5">
                                                            <p className="font-bold text-slate-800 text-[11px]">{p.title} <span className="font-semibold text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md ml-1">{p.technologies}</span></p>
                                                            <p className="text-slate-500 text-[10px] leading-relaxed text-justify">{p.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="col-span-1 space-y-4">
                                                <div className="space-y-2">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1 text-slate-800" style={{ borderColor: primaryThemeColor }}>Core Skills</h3>
                                                    <div className="flex flex-wrap gap-1">
                                                        {resumeData.skills.map((s, i) => (
                                                            <span key={i} className="bg-slate-100 text-slate-700 text-[9px] font-semibold px-2 py-0.5 rounded-md border border-slate-200">{s.name}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1 text-slate-800" style={{ borderColor: primaryThemeColor }}>Academic Matrix</h3>
                                                    {resumeData.education.map((e, i) => (
                                                        <div key={i} className="text-[10px]">
                                                            <p className="font-bold text-slate-800">{e.degree}</p>
                                                            <p className="text-slate-500">{e.school}</p>
                                                            <span className="text-slate-400 text-[9px] font-medium">{e.duration}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            if (layoutType === 'professional') {
                                return (
                                    <div className="space-y-5 flex-grow">
                                        <div className="text-white p-6 rounded-xl flex justify-between items-center shadow-sm" style={{ backgroundColor: primaryThemeColor }}>
                                            <div>
                                                <h1 className="text-2xl font-black tracking-wide uppercase">{resumeData.profileInfo.fullName || 'EXECUTIVE MATRIX'}</h1>
                                                <p className="text-indigo-100 text-xs font-medium tracking-wider mt-0.5 opacity-90">{resumeData.profileInfo.designation || 'ROLE PATHWAY'}</p>
                                            </div>
                                            <div className="text-[10px] text-right text-indigo-50 space-y-0.5 font-medium opacity-80">
                                                <p>{resumeData.contactInfo.email}</p>
                                                <p>{resumeData.contactInfo.phone}</p>
                                                <p>{resumeData.contactInfo.github}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4 pt-2">
                                            <div className="space-y-1">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Executive Briefcase</h3>
                                                <p className="text-slate-600 text-[11px] leading-relaxed text-justify border-l-2 pl-3 italic" style={{ borderColor: primaryThemeColor }}>{resumeData.profileInfo.summary}</p>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1 text-slate-800">Operational Deployments & Repositories</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {resumeData.projects.map((p, i) => (
                                                        <div key={i} className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-1">
                                                            <p className="font-bold text-slate-800 text-[11px]">{p.title}</p>
                                                            <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: `${primaryThemeColor}15`, color: primaryThemeColor }}>{p.technologies}</span>
                                                            <p className="text-slate-500 text-[10px] leading-relaxed text-justify mt-1">{p.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 pt-2">
                                                <div className="space-y-2">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1 text-slate-800">Technical Inventories</h3>
                                                    <div className="flex flex-wrap gap-1">
                                                        {resumeData.skills.map((s, i) => (
                                                            <span key={i} className="text-white text-[9px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: primaryThemeColor }}>{s.name}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1 text-slate-800">Academic Profiles</h3>
                                                    {resumeData.education.map((e, i) => (
                                                        <div key={i} className="text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                            <p className="font-bold text-slate-800">{e.degree} - <span className="text-slate-500 font-medium">{e.school}</span></p>
                                                            <span className="text-slate-400 text-[9px]">{e.duration}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // default: 'modern'
                            return (
                                <div className="grid grid-cols-3 gap-6 h-full flex-grow">
                                    <div className="col-span-1 border-r pr-4 space-y-4" style={{ borderColor: `${primaryThemeColor}20` }}>
                                        <div className="pb-3 text-center border-b" style={{ borderColor: `${primaryThemeColor}20` }}>
                                            <h2 className="font-extrabold text-base uppercase tracking-tight" style={{ color: primaryThemeColor }}>{resumeData.profileInfo.fullName || 'CANDIDATE'}</h2>
                                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">{resumeData.profileInfo.designation}</p>
                                        </div>
                                        
                                        <div className="space-y-1.5 text-[10px] text-slate-600 font-medium">
                                            <p className="truncate"><b>EM:</b> {resumeData.contactInfo.email}</p>
                                            <p><b>PH:</b> {resumeData.contactInfo.phone}</p>
                                            <p className="truncate"><b>GH:</b> {resumeData.contactInfo.github}</p>
                                            <p className="truncate"><b>LI:</b> {resumeData.contactInfo.linkedIn}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-bold uppercase text-[10px] tracking-wider" style={{ color: primaryThemeColor }}>Capabilities</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {resumeData.skills.map((s, i) => (
                                                    <span key={i} className="text-white text-[9px] font-medium px-1.5 py-0.5 rounded shadow-sm" style={{ backgroundColor: primaryThemeColor }}>{s.name}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-bold uppercase text-[10px] tracking-wider" style={{ color: primaryThemeColor }}>Education</h4>
                                            {resumeData.education.map((e, i) => (
                                                <div key={i} className="text-[10px] text-slate-600">
                                                    <p className="font-bold text-slate-800">{e.degree}</p>
                                                    <p className="text-[9px]">{e.school}</p>
                                                    <span className="text-slate-400 text-[8px]">{e.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="font-extrabold uppercase tracking-wide text-xs" style={{ color: primaryThemeColor }}>Profile Brief</h3>
                                            <p className="text-slate-600 leading-relaxed text-[11px] text-justify">{resumeData.profileInfo.summary}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="font-extrabold uppercase tracking-wide text-xs border-b pb-1" style={{ color: primaryThemeColor, borderColor: `${primaryThemeColor}20` }}>Project Pipelines</h3>
                                            {resumeData.projects.map((p, i) => (
                                                <div key={i} className="space-y-0.5">
                                                    <p className="font-bold text-slate-800 text-[11px]">{p.title} <span className="text-[9px] font-semibold tracking-wide ml-1" style={{ color: primaryThemeColor }}>({p.technologies})</span></p>
                                                    <p className="text-slate-500 text-[10px] leading-relaxed text-justify">{p.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* ✅ FIXED: Share Modal with correct resumeId */}
            {showUpgradeModal && <UpgradePlan onClose={() => setShowUpgradeModal(false)} />}
            {showShareModal && (
                <ShareEmailModal 
                    resumeId={id}   // ✅ Corrected: id from useParams
                    onClose={() => setShowShareModal(false)} 
                />
            )}
        </div>
    );
}