

import React, { useState, useRef, useEffect } from 'react';
import type { Role, DecisionTree } from '../types';
import Card from './common/Card';
import Modal from './common/Modal';
import IncidentAssessment from './IncidentAssessment';
import { DICOM_WIZARD_TREE, HL7_WIZARD_TREE } from '../constants';
import { queryKnowledgeBase, generateDocumentation, getDiagnosticResponse, getExplanationFor } from '../services/geminiService';
import { 
    FileWarningIcon, ShieldAlertIcon, SendIcon, BotIcon, UserIcon, ClipboardIcon, CheckIcon, InfoIcon 
} from './common/Icons';
import type { IconProps } from './common/Icons';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface IntegratedSupportHubProps {
  role: Role;
}

interface WizardInfo {
    key: 'DICOM' | 'HL7';
    title: string;
    description: string;
    tree: DecisionTree;
    icon: React.ReactElement<IconProps>;
}

const WIZARDS: WizardInfo[] = [
    {
        key: 'DICOM',
        title: 'DICOM Issues Wizard',
        description: 'Troubleshoot "Images Not Loading" and other DICOM-related problems.',
        tree: DICOM_WIZARD_TREE,
        icon: <FileWarningIcon className="w-8 h-8 text-info" />
    },
    {
        key: 'HL7',
        title: 'HL7 Report Failure Wizard',
        description: 'Diagnose issues with missing reports in EMR/RIS and billing discrepancies.',
        tree: HL7_WIZARD_TREE,
        icon: <ShieldAlertIcon className="w-8 h-8 text-warning" />
    }
];

const DiagnosticWizard = ({ wizard, onClose }: { wizard: WizardInfo; onClose: () => void; }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
    const [explanationContent, setExplanationContent] = useState('');
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');

    const handleBotMessageClick = async (text: string) => {
        if (isExplanationLoading) return;
        setIsExplanationModalOpen(true);
        setIsExplanationLoading(true);
        setSelectedMessage(text);
        try {
            const explanation = await getExplanationFor(text);
            setExplanationContent(explanation);
        } catch (error) {
            setExplanationContent("Sorry, couldn't fetch an explanation for this message.");
        } finally {
            setIsExplanationLoading(false);
        }
    };

    const samplePrompts = wizard.key === 'DICOM'
      ? ["Images are loading very slowly.", "A specific study won't open.", "Is the Unifier for my region online?"]
      : ["A STAT report is missing from the EMR.", "Billing data seems incorrect for recent studies.", "Why are reports from yesterday delayed?"];

    useEffect(() => {
        const initialMessage: Message = {
            sender: 'bot',
            text: `Starting the ${wizard.title}. I will guide you through diagnosing the issue. Please describe the problem you are encountering.`
        };
        setMessages([initialMessage]);
    }, [wizard.title]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const botResponse = await getDiagnosticResponse(wizard.title, newMessages);
            const botMessage: Message = { sender: 'bot', text: botResponse };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in flex flex-col h-[calc(100% - 40px)]">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-info/10 p-2 rounded-full">{React.cloneElement(wizard.icon, { className: 'w-8 h-8 text-info' })}</div>
                    <h3 className="text-xl font-semibold text-brand-text">{wizard.title}</h3>
                </div>
                <button onClick={onClose} className="text-sm font-semibold text-brand-accent hover:underline">&larr; Back to Tool Selection</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar mb-4 bg-brand-bg p-4 rounded-lg">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' ? <>
                            <BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent" />
                            <div onClick={() => handleBotMessageClick(msg.text)} className="max-w-md px-4 py-3 rounded-2xl bg-brand-surface text-brand-text cursor-pointer hover:ring-2 hover:ring-brand-accent/70 transition-all">
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                <div className="text-xs text-brand-subtle mt-2 opacity-60 flex items-center gap-1">
                                    <InfoIcon className="w-3 h-3"/> Click for explanation
                                </div>
                            </div>
                        </> : <>
                            <div className="max-w-md px-4 py-3 rounded-2xl bg-brand-accent text-brand-bg font-medium"><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div>
                            <UserIcon className="w-8 h-8 flex-shrink-0 text-brand-subtle" />
                        </>}
                    </div>
                ))}
                {isLoading && (<div className="flex items-start gap-3"><BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent" /><div className="max-w-md px-4 py-3 rounded-2xl bg-brand-surface text-brand-text"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse"></div><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.4s]"></div></div></div></div>)}
                <div ref={chatEndRef}></div>
            </div>
            
            <div className="mt-auto">
                <div className="flex items-center gap-2 p-2 bg-brand-surface border border-white/10 rounded-lg">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Describe symptoms or answer the question..." className="w-full px-2 py-1 bg-transparent focus:outline-none disabled:opacity-50" disabled={isLoading} />
                    <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-2 rounded-full bg-brand-accent text-brand-bg hover:brightness-90 transition-all disabled:opacity-50"><SendIcon className="w-5 h-5" /></button>
                </div>
                 <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-brand-subtle mr-1">Try asking:</span>
                    {samplePrompts.map((prompt, i) => (
                        <button key={i} onClick={() => setInput(prompt)} className="text-xs px-3 py-1 bg-brand-bg rounded-full border border-brand-subtle/20 hover:bg-brand-subtle/10 text-brand-subtle transition-colors">"{prompt}"</button>
                    ))}
                </div>
            </div>

            {isExplanationModalOpen && (
                <Modal title="Explanation" onClose={() => setIsExplanationModalOpen(false)}>
                    <div className="p-2">
                        <blockquote className="border-l-4 border-brand-subtle/50 pl-4 py-2 mb-4 bg-brand-bg rounded-r-md">
                            <p className="text-brand-subtle italic">{selectedMessage}</p>
                        </blockquote>
                        {isExplanationLoading ? (
                            <div className="flex items-center space-x-2 text-brand-subtle">
                                <svg className="animate-spin h-5 w-5 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Generating explanation...</span>
                            </div>
                        ) : (
                            <p className="text-brand-text whitespace-pre-wrap">{explanationContent}</p>
                        )}
                    </div>
                </Modal>
            )}

            <style>{`.animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};


const IntegratedSupportHub = ({ role }: IntegratedSupportHubProps) => {
    // Diagnostic Wizard State
    const [activeWizard, setActiveWizard] = useState<WizardInfo | null>(null);

    // Knowledge Engine State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isChatLoading, setChatIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    // Documentation Generator State
    const [docTopic, setDocTopic] = useState('');
    const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
    const [isDocLoading, setDocIsLoading] = useState(false);
    const [docError, setDocError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
  
    useEffect(() => {
        if (messages.length > 0) return;
        const initialBotMessage: Message = { sender: 'bot', text: "Hello! I'm Navigator AI. How can I assist you?" };
        setMessages([initialBotMessage]);
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isChatLoading) return;
        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setChatIsLoading(true);
        try {
            const botResponse = await queryKnowledgeBase(input);
            setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error.' }]);
        } finally {
            setChatIsLoading(false);
        }
    };

    const handleGenerateDoc = async () => {
        if (!docTopic.trim() || isDocLoading) return;
        setDocIsLoading(true);
        setGeneratedDoc(null);
        setDocError(null);
        try {
            const result = await generateDocumentation(docTopic);
            setGeneratedDoc(result);
        } catch (err) {
            setDocError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setDocIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (generatedDoc) {
            navigator.clipboard.writeText(generatedDoc);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
            {/* Left side: Diagnostic Tools */}
            <div className="lg:col-span-3 space-y-8 flex flex-col">
                <Card className="flex-1 flex flex-col min-h-[500px]">
                    {!activeWizard ? (
                        <>
                            <h2 className="text-xl font-bold text-brand-text mb-1">Diagnostic Wizards</h2>
                            <p className="text-brand-subtle mb-6">Select a wizard to begin a step-by-step AI-powered diagnostic flow.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {WIZARDS.map((wizard) => (
                                    <button key={wizard.key} onClick={() => setActiveWizard(wizard)} className="text-left p-6 bg-brand-surface/50 rounded-lg border border-brand-subtle/20 hover:border-info hover:bg-brand-surface transition-all group">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-brand-surface p-3 rounded-full group-hover:bg-info transition-colors">{React.cloneElement(wizard.icon, {className: "w-8 h-8 text-info group-hover:text-white transition-colors"})}</div>
                                            <div><h4 className="font-bold text-brand-text">{wizard.title}</h4><p className="text-sm text-brand-subtle">{wizard.description}</p></div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <DiagnosticWizard wizard={activeWizard} onClose={() => setActiveWizard(null)} />
                    )}
                </Card>
                <IncidentAssessment />
            </div>

            {/* Right side: AI Tools */}
            <div className="lg:col-span-2 flex flex-col gap-8">
                <Card className="flex flex-col flex-1 h-[50vh] min-h-[400px]">
                    <h3 className="text-lg font-semibold text-brand-text mb-4">Knowledge AI</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'bot' && <BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent" />}
                                <div className={`max-w-md px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-accent text-brand-bg font-medium' : 'bg-brand-bg text-brand-text'}`}><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div>
                                {msg.sender === 'user' && <UserIcon className="w-8 h-8 flex-shrink-0 text-brand-subtle" />}
                            </div>
                        ))}
                        {isChatLoading && (<div className="flex items-start gap-3"><BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent" /><div className="max-w-md px-4 py-3 rounded-2xl bg-brand-bg text-brand-text"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse"></div><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.4s]"></div></div></div></div>)}
                        <div ref={chatEndRef}></div>
                    </div>
                    <div className="flex items-center gap-2 p-2 mt-4 bg-brand-bg border border-white/10 rounded-lg">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="w-full px-2 py-1 bg-transparent focus:outline-none disabled:opacity-50" disabled={isChatLoading} />
                        <button onClick={handleSend} disabled={isChatLoading || input.trim() === ''} className="p-2 rounded-full bg-brand-accent text-brand-bg hover:brightness-90 transition-all disabled:opacity-50"><SendIcon className="w-5 h-5" /></button>
                    </div>
                </Card>

                <Card className="flex flex-col">
                    <h3 className="text-lg font-semibold text-brand-text mb-4">Documentation Generator</h3>
                    <textarea value={docTopic} onChange={e => setDocTopic(e.target.value)} placeholder="Enter a topic for documentation (e.g., 'What to do when reports are missing from the EMR')" rows={3} className="w-full p-2 bg-brand-bg border border-white/10 rounded-md text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-brand-accent"></textarea>
                    <button onClick={handleGenerateDoc} disabled={isDocLoading || !docTopic.trim()} className="w-full bg-brand-accent text-brand-bg font-bold py-2 px-4 rounded-lg hover:brightness-90 transition-all disabled:opacity-50">{isDocLoading ? 'Generating...' : 'Generate Doc'}</button>
                    
                    {(isDocLoading || docError || generatedDoc) && (
                        <div className="mt-4 pt-4 border-t border-brand-subtle/10">
                            {isDocLoading && (<div className="flex items-center space-x-2 text-brand-subtle"><svg className="animate-spin h-5 w-5 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Please wait...</span></div>)}
                            {docError && <p className="text-critical font-medium">{docError}</p>}
                            {generatedDoc && (
                                <div className="relative">
                                    <button onClick={handleCopy} className="absolute top-0 right-0 p-2 text-sm bg-brand-bg rounded-lg hover:bg-brand-subtle/20 transition-colors flex items-center gap-2"> {copied ? <CheckIcon className="w-4 h-4 text-normal"/> : <ClipboardIcon className="w-4 h-4 text-brand-subtle"/>} {copied ? 'Copied!' : 'Copy'} </button>
                                    <div className="prose prose-sm prose-invert max-w-none mt-2 whitespace-pre-wrap font-mono text-xs p-4 bg-brand-bg rounded-md h-64 overflow-y-auto custom-scrollbar">{generatedDoc}</div>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 3px; }
                .prose-invert { --tw-prose-body: #e5e7eb; --tw-prose-headings: #e5e7eb; --tw-prose-bold: #e5e7eb; --tw-prose-code: #e5e7eb; --tw-prose-bullets: #9ca3af; }
             `}</style>
        </div>
    );
};

export default IntegratedSupportHub;